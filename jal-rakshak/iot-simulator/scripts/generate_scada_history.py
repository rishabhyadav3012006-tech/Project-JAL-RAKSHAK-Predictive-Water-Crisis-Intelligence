"""Synthetic High-Frequency SCADA Telemetry Generator for JAL-RAKSHAK.

Generates realistic 30-day multi-modal IoT water network data with diurnal waves,
pump cycles, storage tank replenishment, and ground-truth pipe burst anomalies.
"""
import os
import sys
import argparse
import random
import math
from datetime import datetime, timedelta, timezone

# Ensure path resolution
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

# 17 Municipal Water Grid Sensors
SENSORS = [
    {"id": "FS-101", "name": "Bulk Intake Magflow", "type": "flow", "zone": "zone-north", "base": 840.0, "unit": "m3/h"},
    {"id": "FS-102", "name": "Sector 9 South Feeder", "type": "flow", "zone": "zone-south", "base": 240.0, "unit": "m3/h"},
    {"id": "FS-103", "name": "East High-Service Flow", "type": "flow", "zone": "zone-east", "base": 310.0, "unit": "m3/h"},
    {"id": "FS-104", "name": "West Suburbs Distribution", "type": "flow", "zone": "zone-west", "base": 185.0, "unit": "m3/h"},
    {"id": "PS-201", "name": "North Lift Discharge Transducer", "type": "pressure", "zone": "zone-north", "base": 5.80, "unit": "Bar"},
    {"id": "PS-202", "name": "Sector 9 Industrial Transducer", "type": "pressure", "zone": "zone-south", "base": 4.80, "unit": "Bar"},
    {"id": "PS-203", "name": "East Ring Distribution Transducer", "type": "pressure", "zone": "zone-east", "base": 5.12, "unit": "Bar"},
    {"id": "PS-204", "name": "West Ground Sump Nodal Sensor", "type": "pressure", "zone": "zone-west", "base": 4.45, "unit": "Bar"},
    {"id": "TLS-301", "name": "Sharda Sagar Bulk Basin Level", "type": "tank_level", "zone": "zone-north", "base": 84.5, "unit": "%"},
    {"id": "TLS-302", "name": "East Elevated Balancing Tank Level", "type": "tank_level", "zone": "zone-east", "base": 76.2, "unit": "%"},
    {"id": "TLS-303", "name": "South Industrial Buffer Tank Level", "type": "tank_level", "zone": "zone-south", "base": 72.0, "unit": "%"},
    {"id": "TLS-304", "name": "West Sub-aquifer Clear Sump Level", "type": "tank_level", "zone": "zone-west", "base": 82.0, "unit": "%"},
    {"id": "WCM-401", "name": "Sector 1-4 Residential Bulk Meter", "type": "consumption", "zone": "zone-north", "base": 418.0, "unit": "kL/h"},
    {"id": "WCM-402", "name": "Zone 5-8 Commercial Zone AMR Meter", "type": "consumption", "zone": "zone-east", "base": 360.0, "unit": "kL/h"},
    {"id": "WCM-403", "name": "South Industrial High-Draw Meter", "type": "consumption", "zone": "zone-south", "base": 520.0, "unit": "kL/h"},
    {"id": "PSS-501", "name": "North Lift Pump #1 VFD Monitor", "type": "pump_status", "zone": "zone-north", "base": 1450.0, "unit": "RPM"},
    {"id": "PSS-502", "name": "South Booster Pump #2 VFD Monitor", "type": "pump_status", "zone": "zone-south", "base": 1380.0, "unit": "RPM"},
]

def generate_telemetry_dataset(num_days: int = 7, interval_minutes: int = 15, output_path: str = None) -> str:
    """Generates synthetic SCADA time-series dataset with realistic anomalies."""
    if output_path is None:
        out_dir = os.path.join(ROOT_DIR, "data")
        os.makedirs(out_dir, exist_ok=True)
        output_path = os.path.join(out_dir, f"scada_telemetry_{num_days}d.csv")

    start_time = datetime.now(timezone.utc) - timedelta(days=num_days)
    total_steps = int((num_days * 24 * 60) / interval_minutes)

    print(f"[SCADA Generator] Generating {total_steps} timestamps across {len(SENSORS)} sensors ({num_days} days)...")

    # Injected anomaly windows (e.g. Pipe burst on Day 4 in Sector 9)
    burst_start_step = int(total_steps * 0.55)
    burst_end_step = burst_start_step + int(180 / interval_minutes) # 3-hour rupture

    headers = [
        "timestamp",
        "sensor_id",
        "sensor_name",
        "sensor_type",
        "zone_id",
        "value",
        "unit",
        "battery_pct",
        "signal_rssi",
        "is_anomaly",
        "anomaly_reason",
    ]

    row_count = 0
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(",".join(headers) + "\n")

        for step in range(total_steps):
            current_time = start_time + timedelta(minutes=step * interval_minutes)
            hour_of_day = current_time.hour + (current_time.minute / 60.0)

            # Diurnal multiplier: Morning peak (7-10am) & Evening peak (6-9pm)
            morning_peak = math.exp(-((hour_of_day - 8.0) ** 2) / 4.0) * 0.35
            evening_peak = math.exp(-((hour_of_day - 19.5) ** 2) / 5.0) * 0.28
            night_dip = -math.exp(-((hour_of_day - 3.0) ** 2) / 6.0) * 0.30
            diurnal_factor = 1.0 + morning_peak + evening_peak + night_dip

            # Check if rupture window is active
            in_burst_window = burst_start_step <= step <= burst_end_step

            for s in SENSORS:
                noise = random.gauss(0, 0.02 * s["base"])
                val = s["base"]
                is_anomaly = False
                anomaly_reason = "Normal"

                if s["type"] == "flow":
                    val = (s["base"] * diurnal_factor) + noise
                    if in_burst_window and s["id"] == "FS-102":
                        val *= 1.38 # 38% rupture surge
                        is_anomaly = True
                        anomaly_reason = "Pipe Rupture Flow Surge"
                elif s["type"] == "pressure":
                    # Pressure drops slightly during high diurnal flow
                    val = max(1.5, s["base"] - (diurnal_factor - 1.0) * 0.6 + noise * 0.1)
                    if in_burst_window and s["id"] == "PS-202":
                        val = 3.42 - abs(random.gauss(0, 0.05)) # Acute hydrostatic collapse
                        is_anomaly = True
                        anomaly_reason = "Acute Pressure Gradient Shock"
                elif s["type"] == "tank_level":
                    # Drawdown during day, replenish at night
                    val = max(35.0, min(98.0, s["base"] - (diurnal_factor - 1.0) * 12.0 + noise * 0.5))
                    if in_burst_window and s["id"] == "TLS-303":
                        val = max(52.0, val - 14.0)
                        is_anomaly = True
                        anomaly_reason = "Accelerated Buffer Tank Drawdown"
                elif s["type"] == "consumption":
                    val = (s["base"] * diurnal_factor) + noise
                elif s["type"] == "pump_status":
                    val = s["base"] + random.uniform(-10.0, 10.0)

                battery = round(max(15, 96 - (step / total_steps) * 8 + random.uniform(-1, 1)), 1)
                rssi = int(random.gauss(-68, 4))

                f.write(
                    f"{current_time.isoformat()},{s['id']},\"{s['name']}\",{s['type']},{s['zone']},"
                    f"{round(val, 2)},{s['unit']},{battery},{rssi},{is_anomaly},\"{anomaly_reason}\"\n"
                )
                row_count += 1

    print(f"[SCADA Generator] Successfully written {row_count} readings to: {output_path}")
    return output_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic SCADA telemetry for JAL-RAKSHAK")
    parser.add_argument("--days", type=int, default=7, help="Number of days to simulate (default: 7)")
    parser.add_argument("--interval", type=int, default=15, help="Sampling interval in minutes (default: 15)")
    parser.add_argument("--output", type=str, default=None, help="Output CSV path")
    args = parser.parse_args()

    generate_telemetry_dataset(num_days=args.days, interval_minutes=args.interval, output_path=args.output)
