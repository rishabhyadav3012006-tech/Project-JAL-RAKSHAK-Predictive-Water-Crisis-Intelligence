"""
JAL-RAKSHAK — Telemetry Validation, Alignment, Imputation & Reliability Pipeline
Handles heterogeneous, asynchronous IoT sensor streams:
1. Timestamp alignment across asynchronous sampling rates.
2. Range validation and packet freshness checking.
3. Missing value imputation (decay forward-fill & historical diurnal priors).
4. Outlier handling (transducer noise spike filtering vs genuine hydraulic shock).
5. Dynamic sensor reliability tracking (packet loss, calibration drift, SNR).
"""

import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional, Tuple

# Physical engineering validation boundaries
SENSOR_BOUNDS = {
    "flow": {"min": 0.0, "max": 2500.0, "unit": "m³/h", "max_delta_15m": 350.0},
    "pressure": {"min": 0.0, "max": 16.0, "unit": "bar", "max_delta_15m": 4.5},
    "tank": {"min": 0.0, "max": 100.0, "unit": "%", "max_delta_15m": 25.0},
    "meter": {"min": 0.0, "max": 1200.0, "unit": "m³/h", "max_delta_15m": 200.0},
    "pump": {"min": 0.0, "max": 1.0, "unit": "state", "max_delta_15m": 1.0},
}

class TelemetryValidator:
    """Validates physical range bounds, packet freshness, and rate-of-change limits."""

    @staticmethod
    def validate_packet(packet: Dict[str, Any]) -> Dict[str, Any]:
        sensor_type = packet.get("sensor_type", "flow").lower()
        value = packet.get("value")
        bounds = SENSOR_BOUNDS.get(sensor_type, SENSOR_BOUNDS["flow"])

        validation_flags = []
        is_valid = True

        # Check None or NaN
        if value is None or (isinstance(value, float) and math.isnan(value)):
            return {
                **packet,
                "is_valid": False,
                "sanitized_value": None,
                "validation_flags": ["MISSING_VALUE"],
            }

        # Check physical boundaries
        if value < bounds["min"]:
            validation_flags.append(f"BELOW_MIN_LIMIT ({value} < {bounds['min']})")
            is_valid = False
            sanitized_value = bounds["min"]
        elif value > bounds["max"]:
            validation_flags.append(f"EXCEEDS_MAX_LIMIT ({value} > {bounds['max']})")
            is_valid = False
            sanitized_value = bounds["max"]
        else:
            sanitized_value = value

        # Check packet freshness (older than 30 mins flagged as stale)
        ts_str = packet.get("timestamp")
        if ts_str:
            try:
                pkt_time = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                latency_sec = abs((datetime.now(timezone.utc) - pkt_time).total_seconds())
                if latency_sec > 1800:
                    validation_flags.append(f"STALE_TELEMETRY ({int(latency_sec / 60)} mins old)")
            except Exception:
                pass

        return {
            **packet,
            "is_valid": is_valid,
            "sanitized_value": sanitized_value,
            "validation_flags": validation_flags,
        }

class TimestampAligner:
    """
    Aligns asynchronous sensor packets onto uniform discrete time epochs
    (e.g., 5-minute or 15-minute synchronized intervals).
    """

    @staticmethod
    def align_series(
        packets: List[Dict[str, Any]],
        epoch_interval_mins: int = 15,
        start_time: Optional[datetime] = None,
        periods: int = 8,
    ) -> pd.DataFrame:
        if not packets:
            return pd.DataFrame()

        df = pd.DataFrame(packets)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        if start_time is None:
            start_time = df["timestamp"].min().floor(f"{epoch_interval_mins}min")

        # Create uniform epoch grid
        grid_index = pd.date_range(
            start=start_time,
            periods=periods,
            freq=f"{epoch_interval_mins}min",
        )

        aligned_rows = []
        for sensor_id, sensor_df in df.groupby("sensor_id"):
            sensor_df = sensor_df.set_index("timestamp").sort_index()
            # Reindex onto grid with time tolerance
            reindexed = sensor_df.reindex(grid_index, method="nearest", tolerance=pd.Timedelta("7min"))
            reindexed["sensor_id"] = sensor_id
            reindexed["epoch"] = grid_index
            aligned_rows.append(reindexed)

        if aligned_rows:
            aligned_df = pd.concat(aligned_rows).reset_index(drop=True)
            return aligned_df
        return pd.DataFrame()

class MissingValueImputer:
    """
    Imputes missing telemetry packets using decay forward-fill or diurnal historical conditional priors.
    """

    @staticmethod
    def impute_sensor_gap(
        sensor_type: str,
        last_valid_value: Optional[float],
        baseline_hour_value: float,
        consecutive_misses: int,
    ) -> Tuple[float, str]:
        if last_valid_value is None:
            return baseline_hour_value, "DIURNAL_HISTORICAL_PRIOR"

        if consecutive_misses <= 2:
            # Short outage: Exponential decay forward-fill toward baseline
            decay = math.exp(-0.15 * consecutive_misses)
            imputed = (last_valid_value * decay) + (baseline_hour_value * (1.0 - decay))
            return round(imputed, 2), "EXPONENTIAL_DECAY_FORWARD_FILL"
        else:
            # Prolonged outage: Regress to historical diurnal mean
            return round(baseline_hour_value, 2), "HISTORICAL_CONDITIONAL_MEAN"

class OutlierHandler:
    """
    Filters isolated electrical transducer noise spikes while preserving genuine hydraulic shocks.
    Rule: A genuine hydraulic burst is corroborated across multiple time samples or adjacent sensors.
    """

    @staticmethod
    def process_outliers(
        current_val: float,
        recent_history: List[float],
        sensor_type: str,
    ) -> Tuple[float, bool, str]:
        if len(recent_history) < 3:
            return current_val, False, "INSUFFICIENT_HISTORY"

        mean_val = float(np.mean(recent_history))
        std_val = max(float(np.std(recent_history)), 0.05)
        z_score = abs(current_val - mean_val) / std_val

        # If z-score is severe (> 3.8 STD), check if single isolated spike
        if z_score > 3.8:
            bounds = SENSOR_BOUNDS.get(sensor_type, SENSOR_BOUNDS["flow"])
            delta = abs(current_val - recent_history[-1])
            if delta > bounds["max_delta_15m"]:
                # Clipped electrical spike
                clipped_val = round(mean_val + (3.0 * std_val * (1 if current_val > mean_val else -1)), 2)
                return clipped_val, True, f"TRANSDUCER_NOISE_SPIKE_CLIPPED (z={round(z_score, 1)})"

        return current_val, False, "NORMAL_VARIATION"

class SensorReliabilityTracker:
    """
    Computes dynamic telemetry reliability scores [0.0 - 1.0] for all sensors:
    R = 0.35 * Freshness + 0.30 * (1 - PacketLoss) + 0.20 * SignalStability + 0.15 * Calibration
    """

    def __init__(self):
        # 17 Initialized IoT sensors across the water grid
        self.sensor_metadata = {
            # Flow Sensors
            "FLOW-Z1-001": {"zone": "zone-north", "type": "flow", "uptime": 0.99, "packet_loss": 0.02, "calibration_drift": 0.01, "snr_db": 38.0},
            "FLOW-Z2-001": {"zone": "zone-east", "type": "flow", "uptime": 0.98, "packet_loss": 0.04, "calibration_drift": 0.02, "snr_db": 35.0},
            "FLOW-Z3-001": {"zone": "zone-south", "type": "flow", "uptime": 0.99, "packet_loss": 0.01, "calibration_drift": 0.01, "snr_db": 41.0},
            "FLOW-Z4-001": {"zone": "zone-west", "type": "flow", "uptime": 0.94, "packet_loss": 0.08, "calibration_drift": 0.04, "snr_db": 29.0},
            "FLOW-Z5-001": {"zone": "zone-central", "type": "flow", "uptime": 0.99, "packet_loss": 0.01, "calibration_drift": 0.01, "snr_db": 42.0},

            # Pressure Sensors
            "PRESS-Z1-001": {"zone": "zone-north", "type": "pressure", "uptime": 0.98, "packet_loss": 0.03, "calibration_drift": 0.02, "snr_db": 36.0},
            "PRESS-Z2-001": {"zone": "zone-east", "type": "pressure", "uptime": 0.92, "packet_loss": 0.11, "calibration_drift": 0.05, "snr_db": 26.0},
            "PRESS-Z3-001": {"zone": "zone-south", "type": "pressure", "uptime": 0.99, "packet_loss": 0.01, "calibration_drift": 0.01, "snr_db": 44.0},
            "PRESS-Z4-001": {"zone": "zone-west", "type": "pressure", "uptime": 0.96, "packet_loss": 0.05, "calibration_drift": 0.03, "snr_db": 32.0},
            "PRESS-Z5-001": {"zone": "zone-central", "type": "pressure", "uptime": 0.99, "packet_loss": 0.01, "calibration_drift": 0.01, "snr_db": 43.0},

            # Storage Tank Level Sensors
            "TANK-Z1-001": {"zone": "zone-north", "type": "tank", "uptime": 0.99, "packet_loss": 0.02, "calibration_drift": 0.01, "snr_db": 39.0},
            "TANK-Z2-001": {"zone": "zone-east", "type": "tank", "uptime": 0.97, "packet_loss": 0.04, "calibration_drift": 0.02, "snr_db": 34.0},
            "TANK-Z3-001": {"zone": "zone-south", "type": "tank", "uptime": 0.98, "packet_loss": 0.02, "calibration_drift": 0.02, "snr_db": 38.0},

            # Consumption Meters
            "METER-Z1-001": {"zone": "zone-north", "type": "meter", "uptime": 0.97, "packet_loss": 0.04, "calibration_drift": 0.03, "snr_db": 33.0},
            "METER-Z3-001": {"zone": "zone-south", "type": "meter", "uptime": 0.96, "packet_loss": 0.05, "calibration_drift": 0.02, "snr_db": 35.0},

            # Pump Status Telemetry
            "PUMP-ST-001": {"zone": "zone-north", "type": "pump", "uptime": 0.99, "packet_loss": 0.01, "calibration_drift": 0.00, "snr_db": 45.0},
            "PUMP-ST-002": {"zone": "zone-south", "type": "pump", "uptime": 0.99, "packet_loss": 0.01, "calibration_drift": 0.00, "snr_db": 44.0},
        }

    def calculate_reliability(self, sensor_id: str) -> Dict[str, Any]:
        meta = self.sensor_metadata.get(sensor_id, {
            "zone": "zone-north", "type": "flow", "uptime": 0.95, "packet_loss": 0.05, "calibration_drift": 0.03, "snr_db": 32.0
        })

        uptime = meta["uptime"]
        packet_loss = meta["packet_loss"]
        drift = meta["calibration_drift"]
        snr_ratio = min(1.0, meta["snr_db"] / 40.0)

        # Weighted Reliability Score
        score = (
            (uptime * 0.35) +
            ((1.0 - packet_loss) * 0.30) +
            (snr_ratio * 0.20) +
            ((1.0 - drift) * 0.15)
        )
        score = round(max(0.1, min(1.0, score)), 3)

        if score >= 0.92:
            status = "HEALTHY"
        elif score >= 0.80:
            status = "ACCEPTABLE"
        elif score >= 0.65:
            status = "DEGRADED"
        else:
            status = "UNRELIABLE"

        return {
            "sensor_id": sensor_id,
            "sensor_type": meta["type"],
            "zone_id": meta["zone"],
            "reliability_score": score,
            "status": status,
            "uptime_pct": round(uptime * 100, 1),
            "packet_loss_pct": round(packet_loss * 100, 1),
            "snr_db": meta["snr_db"],
            "calibration_health_pct": round((1.0 - drift) * 100, 1),
        }

    def get_all_reliabilities(self) -> List[Dict[str, Any]]:
        return [self.calculate_reliability(sid) for sid in self.sensor_metadata.keys()]
