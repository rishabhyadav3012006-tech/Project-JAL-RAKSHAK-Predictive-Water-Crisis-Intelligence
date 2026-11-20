"""Hydraulic Scenario Simulation Service for JAL-RAKSHAK."""
import sys
import os
from typing import Dict, Any, List, Optional

# Ensure digital-twin module is on sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
DIGITAL_TWIN_DIR = os.path.join(ROOT_DIR, "digital-twin")
if DIGITAL_TWIN_DIR not in sys.path:
    sys.path.insert(0, DIGITAL_TWIN_DIR)

from engine.hydraulic_engine import hydraulic_engine, PRESET_SCENARIOS

class HydraulicSimulatorService:
    """Service orchestrating scenario computations, preset management, and comparisons."""

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the computational hydraulic and water-balance model."""
        return hydraulic_engine.simulate(params)

    def get_presets(self) -> List[Dict[str, Any]]:
        """Returns the 6 standard pre-configured municipal scenarios."""
        return list(PRESET_SCENARIOS.values())

    def get_preset(self, preset_key: str) -> Optional[Dict[str, Any]]:
        """Retrieves a preset scenario configuration by key."""
        return PRESET_SCENARIOS.get(preset_key)

    def compare(self, base_params: Dict[str, Any], sim_params: Dict[str, Any]) -> Dict[str, Any]:
        """Runs side-by-side comparison between baseline and simulated scenario."""
        baseline_res = hydraulic_engine.simulate(base_params)
        simulated_res = hydraulic_engine.simulate(sim_params)

        wb_base = baseline_res["water_balance"]
        wb_sim = simulated_res["water_balance"]

        # Delta metrics
        delta_water_mld = round(wb_sim["available_water_mld"] - wb_base["available_water_mld"], 1)
        delta_demand_mld = round(wb_sim["total_demand_mld"] - wb_base["total_demand_mld"], 1)
        delta_consumption_mld = round(wb_sim["total_consumption_mld"] - wb_base["total_consumption_mld"], 1)
        delta_deficit_mld = round(wb_sim["supply_demand_deficit_mld"] - wb_base["supply_demand_deficit_mld"], 1)
        delta_losses_mld = round(wb_sim["distribution_losses_mld"] - wb_base["distribution_losses_mld"], 1)
        delta_health = simulated_res["overall_health"] - baseline_res["overall_health"]

        # Zone comparisons
        zone_comparisons = []
        sim_zones_map = {z["zone_id"]: z for z in simulated_res["zones_availability"]}
        for b_zone in baseline_res["zones_availability"]:
            z_id = b_zone["zone_id"]
            s_zone = sim_zones_map.get(z_id, b_zone)
            zone_comparisons.append({
                "zone_id": z_id,
                "name": b_zone["name"],
                "sector_type": b_zone["sector_type"],
                "baseline_demand_mld": b_zone["target_demand_mld"],
                "simulated_demand_mld": s_zone["target_demand_mld"],
                "baseline_allocated_mld": b_zone["allocated_flow_mld"],
                "simulated_allocated_mld": s_zone["allocated_flow_mld"],
                "baseline_deficit_mld": b_zone["deficit_mld"],
                "simulated_deficit_mld": s_zone["deficit_mld"],
                "baseline_shortage_risk": b_zone["shortage_risk"],
                "simulated_shortage_risk": s_zone["shortage_risk"],
                "risk_shifted": b_zone["shortage_risk"] != s_zone["shortage_risk"],
            })

        return {
            "baseline": {
                "scenario_name": baseline_res["scenario_name"],
                "water_balance": wb_base,
                "tank_dynamics": baseline_res["tank_dynamics"],
                "overall_health": baseline_res["overall_health"],
            },
            "simulated": {
                "scenario_name": simulated_res["scenario_name"],
                "water_balance": wb_sim,
                "tank_dynamics": simulated_res["tank_dynamics"],
                "overall_health": simulated_res["overall_health"],
            },
            "deltas": {
                "available_water_mld": delta_water_mld,
                "demand_mld": delta_demand_mld,
                "consumption_mld": delta_consumption_mld,
                "deficit_mld": delta_deficit_mld,
                "losses_mld": delta_losses_mld,
                "overall_health": delta_health,
            },
            "zone_comparisons": zone_comparisons,
        }

hydraulic_service = HydraulicSimulatorService()
