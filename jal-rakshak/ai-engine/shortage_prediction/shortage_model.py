"""
JAL-RAKSHAK — Water Shortage Risk Prediction & Hydrodynamic Reserve Engine
Evaluates dynamic storage depletion, supply-demand deficits, leakage drag,
and reserve duration across municipal zones and balancing reservoirs.

Key Architecture:
- Transparent, explainable scoring model (no opaque black box).
- Considers: Current tank levels, available reservoir capacity, predicted demand,
  incoming supply, historical consumption, leakage estimates, and distribution constraints.
- Explicit non-guaranteed probabilistic disclaimer on all estimates.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional

RESERVOIRS_CONFIG = [
    {
        "id": "res-sharda",
        "name": "Sharda Sagar Bulk Raw Reservoir",
        "type": "raw_basin",
        "capacity_ml": 4500.0,
        "current_ml": 3802.5,
        "level_pct": 84.5,
        "inflow_mld": 860.0,
        "outflow_mld": 842.0,
        "status": "normal",
        "reserve_days": 4.5,
    },
    {
        "id": "res-wtp",
        "name": "Metro Rapid Gravity WTP Clearwell",
        "type": "treatment_storage",
        "capacity_ml": 1000.0,
        "current_ml": 880.0,
        "level_pct": 88.0,
        "inflow_mld": 842.0,
        "outflow_mld": 820.0,
        "status": "normal",
        "reserve_days": 1.1,
    },
    {
        "id": "res-east",
        "name": "East Elevated High-Storage Tank",
        "type": "elevated_balancing",
        "capacity_ml": 950.0,
        "current_ml": 724.0,
        "level_pct": 76.2,
        "inflow_mld": 195.0,
        "outflow_mld": 184.0,
        "status": "normal",
        "reserve_days": 3.9,
    },
    {
        "id": "res-south",
        "name": "South Industrial Balancing Sump",
        "type": "ground_balancing",
        "capacity_ml": 1500.0,
        "current_ml": 876.0,
        "level_pct": 58.4,
        "inflow_mld": 210.0,
        "outflow_mld": 242.5,
        "status": "warning",
        "reserve_days": 1.6,
    },
    {
        "id": "res-west",
        "name": "West Sub-aquifer Ground Reservoir",
        "type": "sub_aquifer_storage",
        "capacity_ml": 850.0,
        "current_ml": 697.0,
        "level_pct": 82.0,
        "inflow_mld": 180.0,
        "outflow_mld": 174.0,
        "status": "normal",
        "reserve_days": 4.0,
    },
]

BASE_ZONE_CONFIG = {
    "zone-north": {
        "name": "Zone 1-4: North Residential",
        "population": 145000,
        "critical_facilities": ["North Municipal Hospital (450 beds)", "12 Primary Schools"],
        "max_storage_m3": 12000.0,
        "current_storage_m3": 9850.0,
        "incoming_supply_m3h": 460.0,
        "predicted_demand_m3h": 435.0,
        "leakage_loss_m3h": 12.0,
        "distribution_capacity_m3h": 550.0,
    },
    "zone-east": {
        "name": "Zone 5-8: East Commercial & IT",
        "population": 95000,
        "critical_facilities": ["Tech Park Data Center Hub", "Metro Rail Interchange"],
        "max_storage_m3": 9500.0,
        "current_storage_m3": 7240.0,
        "incoming_supply_m3h": 380.0,
        "predicted_demand_m3h": 365.0,
        "leakage_loss_m3h": 8.5,
        "distribution_capacity_m3h": 480.0,
    },
    "zone-south": {
        "name": "Zone 9-12: South Industrial Ring",
        "population": 120000,
        "critical_facilities": ["District Trauma Center (600 beds)", "34 Heavy Manufacturing Units", "Pharmaceutical Processing Park"],
        "max_storage_m3": 15000.0,
        "current_storage_m3": 7820.0,
        "incoming_supply_m3h": 440.0,
        "predicted_demand_m3h": 475.0,
        "leakage_loss_m3h": 26.5,  # High leakage due to Conduit 9-B
        "distribution_capacity_m3h": 520.0,
    },
    "zone-west": {
        "name": "Zone 13-16: West Suburbs",
        "population": 110000,
        "critical_facilities": ["West Community Health Centre", "Peri-urban Agro-hub"],
        "max_storage_m3": 8500.0,
        "current_storage_m3": 6970.0,
        "incoming_supply_m3h": 325.0,
        "predicted_demand_m3h": 312.0,
        "leakage_loss_m3h": 14.0,
        "distribution_capacity_m3h": 400.0,
    },
    "zone-central": {
        "name": "Zone 17-20: Central Civic & Hospitals",
        "population": 85000,
        "critical_facilities": ["Apex Multi-Specialty Hospital (1200 beds)", "Municipal Administration HQ", "Central Railway Station"],
        "max_storage_m3": 7500.0,
        "current_storage_m3": 6200.0,
        "incoming_supply_m3h": 395.0,
        "predicted_demand_m3h": 382.0,
        "leakage_loss_m3h": 6.0,
        "distribution_capacity_m3h": 450.0,
    },
}

class WaterShortageEngine:
    """
    Computes transparent supply-demand water balances, storage depletion timelines,
    and shortage risk categories across all zones.
    """

    def __init__(self):
        self.reservoirs = RESERVOIRS_CONFIG
        self.zone_profiles = BASE_ZONE_CONFIG

    def calculate_zone_shortage(
        self,
        zone_id: str,
        predicted_demand_override: Optional[float] = None,
        incoming_supply_override: Optional[float] = None,
        leakage_override: Optional[float] = None,
        current_storage_override: Optional[float] = None,
    ) -> Dict[str, Any]:
        cfg = self.zone_profiles.get(zone_id, self.zone_profiles["zone-north"])

        supply_in = incoming_supply_override if incoming_supply_override is not None else cfg["incoming_supply_m3h"]
        demand_out = predicted_demand_override if predicted_demand_override is not None else cfg["predicted_demand_m3h"]
        leakage_out = leakage_override if leakage_override is not None else cfg["leakage_loss_m3h"]
        current_storage = current_storage_override if current_storage_override is not None else cfg["current_storage_m3"]
        max_storage = cfg["max_storage_m3"]

        storage_pct = round((current_storage / max_storage) * 100.0, 1)

        # Net Hydraulic Balance Rate (m³/h)
        total_outflow = demand_out + leakage_out
        net_balance = round(supply_in - total_outflow, 1)

        # Estimated Reserve Duration
        if net_balance >= 0:
            reserve_hours = 999.0  # Stable / positive buffer
            reserve_days = round((current_storage / max(total_outflow, 1.0)) / 24.0, 1)
            depletion_note = "Continuous equilibrium; storage replenishment active."
        else:
            deficit_rate = abs(net_balance)
            reserve_hours = round(current_storage / max(deficit_rate, 0.1), 1)
            reserve_days = round(reserve_hours / 24.0, 1)
            depletion_note = f"Depletion in ~{reserve_hours} hours ({reserve_days} days) if current deficit persists."

        # Transparent Explainable Shortage Risk Model
        # Term 1: Deficit severity ratio (0 to 0.40)
        deficit_ratio = max(0.0, -net_balance) / max(demand_out, 1.0)
        term_deficit = min(1.0, deficit_ratio / 0.15) * 0.40

        # Term 2: Reserve duration urgency (0 to 0.35)
        if reserve_hours >= 72.0:
            term_reserve = 0.05
        elif reserve_hours >= 48.0:
            term_reserve = 0.12
        elif reserve_hours >= 24.0:
            term_reserve = 0.22
        elif reserve_hours >= 12.0:
            term_reserve = 0.30
        else:
            term_reserve = 0.35

        # Term 3: Storage level depletion (0 to 0.25)
        storage_depletion_fraction = max(0.0, 1.0 - (storage_pct / 100.0))
        term_storage = storage_depletion_fraction * 0.25

        risk_score = min(1.0, max(0.0, round(term_deficit + term_reserve + term_storage, 3)))

        # Categorize into required 5 categories
        if risk_score >= 0.75 or reserve_hours < 18.0:
            risk_category = "Critical"
        elif risk_score >= 0.58 or reserve_hours < 36.0:
            risk_category = "High Risk"
        elif risk_score >= 0.40:
            risk_category = "Moderate Risk"
        elif risk_score >= 0.22:
            risk_category = "Low Risk"
        else:
            risk_category = "Normal"

        # Actionable recommendations
        recs = self._generate_recommendations(risk_category, net_balance, leakage_out, cfg["name"])

        return {
            "zone_id": zone_id,
            "zone_name": cfg["name"],
            "population_served": cfg["population"],
            "critical_facilities": cfg["critical_facilities"],
            "current_storage_m3": current_storage,
            "max_storage_m3": max_storage,
            "storage_level_pct": storage_pct,
            "incoming_supply_m3h": supply_in,
            "predicted_demand_m3h": demand_out,
            "leakage_loss_m3h": leakage_out,
            "net_balance_m3h": net_balance,
            "is_deficit": net_balance < 0,
            "reserve_hours": reserve_hours if reserve_hours < 900 else None,
            "reserve_days": reserve_days,
            "depletion_timeline": depletion_note,
            "shortage_risk_score": risk_score,
            "risk_category": risk_category,
            "transparent_formula": {
                "deficit_term": round(term_deficit, 3),
                "reserve_term": round(term_reserve, 3),
                "storage_term": round(term_storage, 3),
                "total_score": risk_score,
                "weights": "Deficit Ratio (40%) + Reserve Depletion Urgency (35%) + Current Storage Level (25%)",
            },
            "recommendations": recs,
            "disclaimer": "Probabilistic Hydrodynamic Estimate: Estimates reflect dynamic simulation parameters and are not guaranteed future outcomes. Actual availability depends on live meteorological runoff, SCADA throttling, and unmetered demand spikes.",
        }

    def _generate_recommendations(
        self,
        risk: str,
        net_balance: float,
        leakage: float,
        zone_name: str,
    ) -> List[str]:
        recs = []
        if risk == "Critical":
            recs.append("Trigger emergency inter-basin transfer from Sharda Sagar Bulk Line.")
            recs.append("Execute pressure reduction schedule (-0.8 bar) between 23:00 and 05:00.")
            if leakage > 15.0:
                recs.append(f"Fast-track field repair on acoustic leak corridors in {zone_name} to recover ~{leakage} m³/h.")
            recs.append("Place municipal standby auxiliary generator at secondary booster station.")
        elif risk == "High Risk":
            recs.append("Review distribution throttling schedules; restrict non-potable commercial off-takes.")
            recs.append("Monitor service reservoir draw-down rates at 15-minute telemetry intervals.")
            recs.append("Pre-position mobile tanker fleets for critical health and residential nodes.")
        elif risk == "Moderate Risk":
            recs.append("Maintain baseline telemetry watch on district metering zones.")
            recs.append("Investigate distribution losses; schedule non-destructive acoustic survey.")
            recs.append("Calibrate WTP pumping schedules to capture off-peak tariff windows.")
        else:
            recs.append("Operating within normal hydraulic stability envelope.")
            recs.append("Maintain scheduled reservoir turnover and water quality chlorination audits.")
        return recs

    def get_all_zones_shortage(self) -> List[Dict[str, Any]]:
        results = []
        for zid in self.zone_profiles.keys():
            results.append(self.calculate_zone_shortage(zid))
        # Sort by highest risk first
        results.sort(key=lambda z: z["shortage_risk_score"], reverse=True)
        return results

    def get_reservoir_overview(self) -> Dict[str, Any]:
        total_capacity = sum(r["capacity_ml"] for r in self.reservoirs)
        total_current = sum(r["current_ml"] for r in self.reservoirs)
        overall_pct = round((total_current / max(total_capacity, 1.0)) * 100.0, 1)

        return {
            "overall_capacity_ml": total_capacity,
            "overall_current_ml": round(total_current, 1),
            "overall_fill_pct": overall_pct,
            "reservoirs": self.reservoirs,
            "city_wide_water_security_days": round((total_current / 842.0), 1),
        }

    def get_predicted_shortage_timeline(self) -> List[Dict[str, Any]]:
        """
        Projects countdown timeline for zones facing storage depletion deficits.
        """
        timeline = []
        now = datetime.now(timezone.utc)
        zones = self.get_all_zones_shortage()

        for z in zones:
            if z["is_deficit"] and z["reserve_hours"]:
                deplete_dt = now + timedelta(hours=z["reserve_hours"])
                timeline.append({
                    "zone_id": z["zone_id"],
                    "zone_name": z["zone_name"],
                    "risk_category": z["risk_category"],
                    "deficit_m3h": abs(z["net_balance_m3h"]),
                    "hours_remaining": z["reserve_hours"],
                    "projected_depletion_iso": deplete_dt.isoformat(),
                    "projected_depletion_str": deplete_dt.strftime("%b %d, %H:%M UTC"),
                    "critical_facilities": z["critical_facilities"],
                    "recommended_action": z["recommendations"][0] if z["recommendations"] else "Monitor storage",
                })
        return timeline

# Singleton instance
water_shortage_engine = WaterShortageEngine()
