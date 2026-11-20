"""
JAL-RAKSHAK — Predictive Leakage Intelligence & Multi-Sensor Fusion Engine
Combines heterogeneous sensor modalities (flow, pressure, acoustic/vibration, tank level, smart meter consumption)
and sensor reliability indices into a probabilistic leakage suspicion score.

Key Principle:
An isolated anomalous reading is NEVER treated as a confirmed leak.
A leak suspicion is corroborated only when physical hydraulic constraints are satisfied:
1. Volumetric surge (Flow UP)
2. Hydrostatic drop (Pressure DOWN)
3. Night minimum or baseline consumption divergence
4. Storage imbalance (Tank depletion > metered delivery)
5. Sensor reliability discount factor
"""

import math
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

class SensorObservation:
    def __init__(
        self,
        sensor_id: str,
        sensor_type: str,
        metric: str,
        observed_value: float,
        baseline_value: float,
        unit: str,
        reliability_score: float = 0.95,
        anomaly_flag: bool = False,
    ):
        self.sensor_id = sensor_id
        self.sensor_type = sensor_type
        self.metric = metric
        self.observed_value = observed_value
        self.baseline_value = baseline_value
        self.unit = unit
        self.reliability_score = max(0.1, min(1.0, reliability_score))
        self.anomaly_flag = anomaly_flag
        
        # Calculate deviation percentage & signed delta
        self.delta = self.observed_value - self.baseline_value
        self.pct_deviation = (self.delta / max(abs(self.baseline_value), 0.001)) * 100.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sensor_id": self.sensor_id,
            "sensor_type": self.sensor_type,
            "metric": self.metric,
            "observed_value": round(self.observed_value, 2),
            "baseline_value": round(self.baseline_value, 2),
            "unit": self.unit,
            "deviation_pct": round(self.pct_deviation, 1),
            "reliability_score": round(self.reliability_score, 2),
            "anomaly_flag": self.anomaly_flag,
        }

class LeakageSuspicion:
    def __init__(
        self,
        id: str,
        pipeline_ref: str,
        potential_location: str,
        zone_id: str,
        suspicion_score: float,
        severity: str,
        supporting_observations: List[SensorObservation],
        explanation: str,
        investigation_status: str = "under_investigation",
        physical_verification: str = "AI Suspicion (Unverified)",
        timestamp: Optional[str] = None,
        estimated_loss_rate_m3h: float = 0.0,
    ):
        self.id = id
        self.pipeline_ref = pipeline_ref
        self.potential_location = potential_location
        self.zone_id = zone_id
        self.suspicion_score = round(max(0.0, min(1.0, suspicion_score)), 3)
        self.severity = severity
        self.supporting_observations = supporting_observations
        self.explanation = explanation
        self.investigation_status = investigation_status
        self.physical_verification = physical_verification
        self.timestamp = timestamp or datetime.now(timezone.utc).isoformat()
        self.estimated_loss_rate_m3h = round(estimated_loss_rate_m3h, 1)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "pipeline_ref": self.pipeline_ref,
            "potential_location": self.potential_location,
            "zone_id": self.zone_id,
            "suspicion_score": self.suspicion_score,
            "severity": self.severity,
            "timestamp": self.timestamp,
            "investigation_status": self.investigation_status,
            "physical_verification": self.physical_verification,
            "estimated_loss_rate_m3h": self.estimated_loss_rate_m3h,
            "explanation": self.explanation,
            "supporting_observations": [obs.to_dict() for obs in self.supporting_observations],
            "disclaimer": "AI-derived probabilistic suspicion. Physical acoustic probe or ground inspection required for engineering verification.",
        }

class MultiSensorFusionEngine:
    """
    Sensor-Fusion Bayesian/Dempster-Shafer style weighting engine
    combining flow, pressure, consumption, tank level, and sensor reliability.
    """

    def __init__(self):
        # Known distribution pipe segments and topological sensor affinities
        self.pipeline_topology = {
            "e-p2-pn102": {
                "name": "Conduit 9-B (South Booster to Sector 9 Junction)",
                "zone_id": "zone-south",
                "flow_sensors": ["FLOW-Z3-001"],
                "pressure_sensors": ["PRESS-Z3-001"],
                "tank_sensors": ["TANK-Z3-001"],
                "consumption_meters": ["METER-Z3-001"],
            },
            "e-p2-ind1": {
                "name": "South Industrial Distribution Main 12-A",
                "zone_id": "zone-south",
                "flow_sensors": ["FLOW-Z3-001"],
                "pressure_sensors": ["PRESS-Z3-001"],
                "tank_sensors": ["TANK-Z3-001"],
                "consumption_meters": ["METER-Z3-001"],
            },
            "e-tank1-res1": {
                "name": "East High-Storage Delivery Trunk 4-A",
                "zone_id": "zone-east",
                "flow_sensors": ["FLOW-Z2-001"],
                "pressure_sensors": ["PRESS-Z2-001"],
                "tank_sensors": ["TANK-Z2-001"],
                "consumption_meters": ["METER-Z2-001"],
            },
            "e-wtp-p1": {
                "name": "North Raw Clear Water Transmission Trunk",
                "zone_id": "zone-north",
                "flow_sensors": ["FLOW-Z1-001"],
                "pressure_sensors": ["PRESS-Z1-001"],
                "tank_sensors": ["TANK-Z1-001"],
                "consumption_meters": ["METER-Z1-001"],
            },
            "e-p1-pn101": {
                "name": "North Feeder Branch Junction 1-4",
                "zone_id": "zone-north",
                "flow_sensors": ["FLOW-Z1-001"],
                "pressure_sensors": ["PRESS-Z1-001"],
                "tank_sensors": ["TANK-Z1-001"],
                "consumption_meters": ["METER-Z1-001"],
            },
        }

        # Active suspicions database (persisted in-memory with seed incidents)
        self.active_suspicions: Dict[str, LeakageSuspicion] = {}
        self._initialize_seed_suspicions()

    def _initialize_seed_suspicions(self):
        """Preload realistic multi-sensor corroborated suspicions"""
        obs1 = [
            SensorObservation("PRESS-Z3-001", "pressure", "Static Hydrostatic Pressure", 3.42, 4.80, "bar", reliability_score=0.98, anomaly_flag=True),
            SensorObservation("FLOW-Z3-001", "flow", "Bulk Inflow Rate", 224.0, 165.0, "m³/h", reliability_score=0.95, anomaly_flag=True),
            SensorObservation("METER-Z3-001", "meter", "Aggregated Billed Consumption", 142.0, 140.0, "m³/h", reliability_score=0.92, anomaly_flag=False),
            SensorObservation("TANK-Z3-001", "tank", "Balancing Storage Depletion Rate", -18.5, -6.0, "m³/h", reliability_score=0.96, anomaly_flag=True),
        ]
        suspicion_1 = LeakageSuspicion(
            id="LS-2026-081",
            pipeline_ref="e-p2-pn102",
            potential_location="Conduit 9-B between South Booster Station and Sector 9 Junction",
            zone_id="zone-south",
            suspicion_score=0.892,
            severity="critical",
            supporting_observations=obs1,
            explanation="Multi-sensor corroboration: Significant hydraulic gradient divergence. Flow rate elevated by +35.8% (224.0 m³/h vs 165.0 baseline) while downstream hydrostatic pressure dropped sharply by -28.8% (3.42 bar vs 4.80 bar). Concurrently, balancing tank outflow exceeds authorized metered customer consumption by 18.5 m³/h. High confidence pipeline fracture.",
            investigation_status="under_investigation",
            physical_verification="AI Suspicion (Unverified)",
            estimated_loss_rate_m3h=18.5,
        )

        obs2 = [
            SensorObservation("PRESS-Z2-001", "pressure", "Zonal Feeder Pressure", 4.15, 4.60, "bar", reliability_score=0.88, anomaly_flag=True),
            SensorObservation("FLOW-Z2-001", "flow", "East Distribution Flow", 188.0, 172.0, "m³/h", reliability_score=0.94, anomaly_flag=True),
            SensorObservation("METER-Z2-001", "meter", "Commercial Smart Meter Flow", 158.0, 160.0, "m³/h", reliability_score=0.90, anomaly_flag=False),
        ]
        suspicion_2 = LeakageSuspicion(
            id="LS-2026-082",
            pipeline_ref="e-tank1-res1",
            potential_location="East High-Storage Delivery Trunk 4-A near Commercial Gateway",
            zone_id="zone-east",
            suspicion_score=0.645,
            severity="medium",
            supporting_observations=obs2,
            explanation="Moderate multi-sensor divergence: Inflow rate is +9.3% above expected curve while nodal pressure is down by -9.8%. Downstream smart meters report normal consumption, suggesting minor subterranean joint seepage.",
            investigation_status="unassigned",
            physical_verification="AI Suspicion (Unverified)",
            estimated_loss_rate_m3h=6.2,
        )

        self.active_suspicions[suspicion_1.id] = suspicion_1
        self.active_suspicions[suspicion_2.id] = suspicion_2

    def calculate_leakage_suspicion(
        self,
        pipeline_ref: str,
        observations: List[SensorObservation],
        zone_id: Optional[str] = None,
        custom_location: Optional[str] = None,
    ) -> LeakageSuspicion:
        """
        Combines multiple sensor readings using domain-specific hydraulic fusion logic.
        """
        topo = self.pipeline_topology.get(pipeline_ref, {})
        resolved_zone = zone_id or topo.get("zone_id", "zone-central")
        location_name = custom_location or topo.get("name", f"Pipeline Section {pipeline_ref}")

        # Extract specific modalities
        flow_obs = [o for o in observations if o.sensor_type == "flow"]
        press_obs = [o for o in observations if o.sensor_type == "pressure"]
        meter_obs = [o for o in observations if o.sensor_type == "meter"]
        tank_obs = [o for o in observations if o.sensor_type == "tank"]

        # Modality 1: Flow Anomaly (Surge)
        flow_score = 0.0
        flow_delta = 0.0
        if flow_obs:
            flow_item = flow_obs[0]
            # Leak causes positive deviation in trunk flow
            if flow_item.delta > 0:
                rel = flow_item.reliability_score
                surge_ratio = flow_item.delta / max(flow_item.baseline_value, 1.0)
                # 30% surge corresponds to saturated 1.0 flow anomaly
                flow_score = min(surge_ratio / 0.30, 1.0) * rel
                flow_delta = flow_item.delta

        # Modality 2: Pressure Anomaly (Drop)
        pressure_score = 0.0
        press_drop = 0.0
        if press_obs:
            press_item = press_obs[0]
            # Leak causes negative deviation in pressure
            if press_item.delta < 0:
                rel = press_item.reliability_score
                drop_ratio = abs(press_item.delta) / max(press_item.baseline_value, 0.5)
                # 25% drop corresponds to saturated 1.0 pressure anomaly
                pressure_score = min(drop_ratio / 0.25, 1.0) * rel
                press_drop = abs(press_item.delta)

        # Modality 3: Consumption Discrepancy (Flow vs Billed Consumption)
        consumption_score = 0.0
        unmetered_delta = 0.0
        if flow_obs and meter_obs:
            f = flow_obs[0].observed_value
            m = meter_obs[0].observed_value
            if f > m:
                diff = f - m
                expected_diff = max(0.0, flow_obs[0].baseline_value - meter_obs[0].baseline_value)
                excess_loss = diff - expected_diff
                if excess_loss > 0:
                    unmetered_delta = excess_loss
                    consumption_score = min(excess_loss / max(f * 0.15, 5.0), 1.0) * meter_obs[0].reliability_score

        # Modality 4: Tank Depletion Anomaly
        tank_score = 0.0
        if tank_obs:
            t = tank_obs[0]
            if t.anomaly_flag or t.delta < 0:
                depletion_rate = abs(t.delta)
                tank_score = min(depletion_rate / 15.0, 1.0) * t.reliability_score

        # Modality 5: Hydraulic Incongruence Sanity Check
        # Physical law: A genuine pipe burst increases upstream flow AND decreases downstream pressure.
        # If flow is up AND pressure is up -> That is a PUMP SURGE, NOT A LEAK.
        # If flow is down AND pressure is down -> That is an INTAKE SHORTAGE, NOT A LEAK.
        incongruence_multiplier = 1.0
        if flow_obs and press_obs:
            f_item = flow_obs[0]
            p_item = press_obs[0]
            if f_item.delta > 0 and p_item.delta > 0:
                # Both positive = pump acceleration
                incongruence_multiplier = 0.25
            elif f_item.delta < 0 and p_item.delta < 0:
                # Both negative = supply throttling / closed valve
                incongruence_multiplier = 0.20
            elif f_item.delta > 0 and p_item.delta < 0:
                # OPPOSITE: Perfect hydraulic leak signature
                incongruence_multiplier = 1.25

        # Weighted Fusion Calculation
        weights = {
            "flow": 0.32,
            "pressure": 0.32,
            "consumption": 0.20,
            "tank": 0.16,
        }

        raw_fused = (
            (flow_score * weights["flow"]) +
            (pressure_score * weights["pressure"]) +
            (consumption_score * weights["consumption"]) +
            (tank_score * weights["tank"])
        ) * incongruence_multiplier

        # Average sensor reliability discount
        avg_rel = sum(o.reliability_score for o in observations) / max(len(observations), 1)
        fused_score = min(1.0, max(0.0, raw_fused * (0.5 + 0.5 * avg_rel)))

        # Determine severity
        if fused_score >= 0.80:
            severity = "critical"
        elif fused_score >= 0.65:
            severity = "high"
        elif fused_score >= 0.45:
            severity = "medium"
        else:
            severity = "low"

        # Generate human-readable corroborating explanation
        explanation_parts = []
        if flow_score > 0.3:
            explanation_parts.append(f"Flow rate elevated by +{round(flow_delta, 1)} m³/h above expected curve")
        if pressure_score > 0.3:
            explanation_parts.append(f"Pressure collapsed by -{round(press_drop, 2)} bar below baseline")
        if consumption_score > 0.2:
            explanation_parts.append(f"Unaccounted volume of {round(unmetered_delta, 1)} m³/h between bulk inflow and smart meters")
        if tank_score > 0.2:
            explanation_parts.append("Elevated storage tank draw-down rate detected")
        if incongruence_multiplier < 0.5:
            explanation_parts.append("Note: Flow and pressure vectors correlate positively, discounting leak probability (indicative of valve or pump state change)")

        if not explanation_parts:
            explanation = "Sensor signals within normal hydraulic variability envelopes. Multi-sensor fusion yields negligible leak probability."
        else:
            explanation = "Corroborated Multi-Sensor Anomaly: " + "; ".join(explanation_parts) + f". Overall sensor network reliability: {int(avg_rel*100)}%."

        suspicion_id = f"LS-{datetime.now().strftime('%Y')}-{len(self.active_suspicions) + 83:03d}"
        estimated_loss = unmetered_delta if unmetered_delta > 0 else (flow_delta * 0.7 if flow_delta > 0 else 0.0)

        suspicion = LeakageSuspicion(
            id=suspicion_id,
            pipeline_ref=pipeline_ref,
            potential_location=location_name,
            zone_id=resolved_zone,
            suspicion_score=fused_score,
            severity=severity,
            supporting_observations=observations,
            explanation=explanation,
            investigation_status="under_investigation" if severity in ["high", "critical"] else "unassigned",
            physical_verification="AI Suspicion (Unverified)",
            estimated_loss_rate_m3h=estimated_loss,
        )

        self.active_suspicions[suspicion.id] = suspicion
        return suspicion

    def get_all_suspicions(self) -> List[Dict[str, Any]]:
        return [s.to_dict() for s in self.active_suspicions.values()]

    def update_suspicion_status(self, suspicion_id: str, new_status: str, verification_status: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if suspicion_id not in self.active_suspicions:
            return None
        susp = self.active_suspicions[suspicion_id]
        susp.investigation_status = new_status
        if verification_status:
            susp.physical_verification = verification_status
        elif new_status == "verified_leak":
            susp.physical_verification = "Physically Verified (Field Acoustic Crew)"
        elif new_status == "false_positive":
            susp.physical_verification = "False Positive (Meter Recalibration Required)"
        return susp.to_dict()

# Singleton instance
fusion_engine = MultiSensorFusionEngine()
