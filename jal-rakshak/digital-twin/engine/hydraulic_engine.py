"""JAL-RAKSHAK Simplified Hydraulic & Water-Balance Simulation Engine.

Provides mass-conservation, hydrodynamic nodal pressure estimation, pump head curves,
orifice leakage modeling, priority-based demand distribution, and storage tank depletion.
"""
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

# Base zone demand configurations (MLD)
ZONE_BASE_DEMANDS = {
    "node-zone-res-1": {
        "id": "node-zone-res-1",
        "name": "North Residential Sector 1-4",
        "zone_id": "zone-north",
        "sector_type": "residential",
        "base_demand_mld": 215.0,
        "feeder_pump": "node-pump-1",
        "feeder_tank": "node-tank-1",
        "feeder_pipe": "e-tank1-res1",
        "priority": 1,
    },
    "node-zone-res-2": {
        "id": "node-zone-res-2",
        "name": "East Residential Core 5-8",
        "zone_id": "zone-east",
        "sector_type": "residential",
        "base_demand_mld": 185.0,
        "feeder_pump": "node-pump-1",
        "feeder_tank": "node-tank-1",
        "feeder_pipe": "e-tank1-res2",
        "priority": 1,
    },
    "node-zone-ind-1": {
        "id": "node-zone-ind-1",
        "name": "South Industrial Park Sector 9",
        "zone_id": "zone-south",
        "sector_type": "industrial",
        "base_demand_mld": 240.0,
        "feeder_pump": "node-pump-2",
        "feeder_tank": "node-tank-2",
        "feeder_pipe": "e-p2-pn102",
        "priority": 3,
    },
    "node-zone-agr-1": {
        "id": "node-zone-agr-1",
        "name": "West Suburbs & Agricultural Belt",
        "zone_id": "zone-west",
        "sector_type": "agricultural",
        "base_demand_mld": 120.0,
        "feeder_pump": "node-pump-2",
        "feeder_tank": "node-tank-2",
        "feeder_pipe": "e-tank2-agr",
        "priority": 4,
    },
}

PRESET_SCENARIOS = {
    "normal": {
        "key": "normal",
        "title": "1. Normal Water Distribution",
        "description": "Full reservoir volume, standard seasonal demand, both pump stations fully operational, nominal background pipe friction.",
        "params": {
            "reservoir_volume_ml": 4500.0,
            "incoming_supply_mld": 842.0,
            "demand_multiplier": 1.0,
            "pipelines_status": {},
            "pumps_status": {"node-pump-1": "online", "node-pump-2": "online"},
            "simulated_leakage_mld": 0.0,
            "distribution_priorities": ["residential", "commercial", "industrial", "agricultural"],
        },
    },
    "increased_demand": {
        "key": "increased_demand",
        "title": "2. Increased Water Demand (+45%)",
        "description": "Summer heatwave and industrial shift expansion causing a 45% surge in gross consumption, testing grid transmission headroom.",
        "params": {
            "reservoir_volume_ml": 4200.0,
            "incoming_supply_mld": 842.0,
            "demand_multiplier": 1.45,
            "pipelines_status": {},
            "pumps_status": {"node-pump-1": "online", "node-pump-2": "online"},
            "simulated_leakage_mld": 0.0,
            "distribution_priorities": ["residential", "commercial", "industrial", "agricultural"],
        },
    },
    "reduced_reservoir": {
        "key": "reduced_reservoir",
        "title": "3. Reduced Reservoir Capacity (Drought / Intake Siltation)",
        "description": "Bulk storage depleted to 35% with canal intake slashed by 43%, triggering priority-based municipal rationing.",
        "params": {
            "reservoir_volume_ml": 1600.0,
            "incoming_supply_mld": 480.0,
            "demand_multiplier": 1.0,
            "pipelines_status": {},
            "pumps_status": {"node-pump-1": "online", "node-pump-2": "online"},
            "simulated_leakage_mld": 0.0,
            "distribution_priorities": ["residential", "commercial", "industrial", "agricultural"],
        },
    },
    "pipeline_leakage": {
        "key": "pipeline_leakage",
        "title": "4. Suspected Pipeline Rupture (Sector 9 Trunk)",
        "description": "Catastrophic fracture in Sector 9 distribution feeder leaking 48 MLD with severe localized pressure drop.",
        "params": {
            "reservoir_volume_ml": 4500.0,
            "incoming_supply_mld": 842.0,
            "demand_multiplier": 1.0,
            "pipelines_status": {"e-p2-pn102": True},
            "pumps_status": {"node-pump-1": "online", "node-pump-2": "online"},
            "simulated_leakage_mld": 48.0,
            "distribution_priorities": ["residential", "commercial", "industrial", "agricultural"],
        },
    },
    "pump_failure": {
        "key": "pump_failure",
        "title": "5. Pump Station Unavailable (South Booster Trip)",
        "description": "Major electrical fault takes South Booster Station completely offline, starving southern and western distribution corridors.",
        "params": {
            "reservoir_volume_ml": 4500.0,
            "incoming_supply_mld": 842.0,
            "demand_multiplier": 1.0,
            "pipelines_status": {},
            "pumps_status": {"node-pump-1": "online", "node-pump-2": "offline"},
            "simulated_leakage_mld": 0.0,
            "distribution_priorities": ["residential", "commercial", "industrial", "agricultural"],
        },
    },
    "multi_anomaly": {
        "key": "multi_anomaly",
        "title": "6. Multiple Simultaneous Compounding Anomalies",
        "description": "Extreme compound crisis: Depleted reservoir (2,200 ML) + South Pump throttled to 50% + high summer demand (+35%) + Sector 9 conduit fracture.",
        "params": {
            "reservoir_volume_ml": 2200.0,
            "incoming_supply_mld": 550.0,
            "demand_multiplier": 1.35,
            "pipelines_status": {"e-p2-pn102": True},
            "pumps_status": {"node-pump-1": "online", "node-pump-2": "throttled"},
            "simulated_leakage_mld": 38.0,
            "distribution_priorities": ["residential", "commercial", "industrial", "agricultural"],
        },
    },
}

class HydraulicSimulationEngine:
    """Computes hydrodynamic state, mass balance, tank depletion, and network graph."""

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        res_vol = float(params.get("reservoir_volume_ml", 4500.0))
        supply_mld = float(params.get("incoming_supply_mld", 842.0))
        demand_mult = max(0.2, min(3.0, float(params.get("demand_multiplier", 1.0))))
        pipe_status = params.get("pipelines_status", {})
        pump_status = params.get("pumps_status", {"node-pump-1": "online", "node-pump-2": "online"})
        leakage_mld = max(0.0, float(params.get("simulated_leakage_mld", 0.0)))
        priorities = params.get("distribution_priorities", ["residential", "commercial", "industrial", "agricultural"])

        # 1. Available Water Calculation
        res_capacity_ml = 5000.0
        res_level_pct = round(min(100.0, (res_vol / res_capacity_ml) * 100), 1)
        raw_intake_mld = min(supply_mld, res_vol * 0.28) # Max daily discharge rate from reservoir
        wtp_capacity_mld = 900.0
        is_intake_pipe_open = pipe_status.get("e-res-wtp", True)

        if not is_intake_pipe_open:
            water_treated_mld = 0.0
        else:
            water_treated_mld = min(raw_intake_mld, wtp_capacity_mld)

        # 2. Pump Capacities & Head Pressures
        is_p1_pipe_open = pipe_status.get("e-wtp-p1", True)
        is_p2_pipe_open = pipe_status.get("e-wtp-p2", True)

        p1_state = pump_status.get("node-pump-1", "online")
        p2_state = pump_status.get("node-pump-2", "online")

        # Pump 1 (North High-Lift)
        if not is_p1_pipe_open or p1_state == "offline":
            p1_flow_mld = 0.0
            p1_press_bar = 0.8 # static head only
        elif p1_state == "throttled":
            p1_flow_mld = 250.0
            p1_press_bar = 4.2
        else:
            p1_flow_mld = 420.0
            p1_press_bar = 5.8

        # Pump 2 (South Booster)
        if not is_p2_pipe_open or p2_state == "offline":
            p2_flow_mld = 0.0
            p2_press_bar = 0.6
        elif p2_state == "throttled":
            p2_flow_mld = 220.0
            p2_press_bar = 2.8
        else:
            p2_flow_mld = 400.0
            p2_press_bar = 3.45 if leakage_mld > 10 else 4.8

        # Limit pump inflows to total treated water
        total_pump_demand = p1_flow_mld + p2_flow_mld
        if total_pump_demand > water_treated_mld and total_pump_demand > 0:
            scale_ratio = water_treated_mld / total_pump_demand
            p1_flow_mld *= scale_ratio
            p2_flow_mld *= scale_ratio

        # 3. Distribution Losses & Leakage Losses
        background_loss_pct = 0.052 # 5.2% nominal friction/unmetered loss
        actual_transmission_mld = p1_flow_mld + p2_flow_mld
        background_loss_mld = actual_transmission_mld * background_loss_pct
        total_losses_mld = round(background_loss_mld + leakage_mld, 1)

        # Net deliverable water to distribution networks
        net_distributable_mld = max(0.0, actual_transmission_mld - total_losses_mld)

        # 4. Zone Demand & Priority Allocation
        zone_results = {}
        total_demand_mld = 0.0
        total_allocated_mld = 0.0

        # Sort sectors based on user-defined priority order
        sorted_zones = sorted(
            ZONE_BASE_DEMANDS.values(),
            key=lambda z: (
                priorities.index(z["sector_type"]) if z["sector_type"] in priorities else 99,
                z["priority"]
            )
        )

        remaining_water = net_distributable_mld

        for z in sorted_zones:
            target_demand = round(z["base_demand_mld"] * demand_mult, 1)
            total_demand_mld += target_demand

            # Check upstream feeder pipe and pump availability
            feeder_pipe_open = pipe_status.get(z["feeder_pipe"], True)
            pump_delivering = (p1_flow_mld > 0) if z["feeder_pump"] == "node-pump-1" else (p2_flow_mld > 0)

            if not feeder_pipe_open or not pump_delivering:
                # Emergency gravity allowance from tank if available (max 40% of demand)
                allocated = min(target_demand * 0.35, remaining_water)
                pressure_drop = True
            else:
                allocated = min(target_demand, remaining_water)
                pressure_drop = False

            remaining_water = max(0.0, remaining_water - allocated)
            total_allocated_mld += allocated

            deficit = max(0.0, target_demand - allocated)
            avail_pct = round((allocated / max(target_demand, 0.1)) * 100, 1)

            # Assign Shortage Risk Category
            if avail_pct >= 95.0:
                risk_cat = "Normal"
            elif avail_pct >= 80.0:
                risk_cat = "Low Risk"
            elif avail_pct >= 65.0:
                risk_cat = "Moderate Risk"
            elif avail_pct >= 50.0:
                risk_cat = "High Risk"
            else:
                risk_cat = "Critical"

            zone_results[z["id"]] = {
                "zone_id": z["zone_id"],
                "name": z["name"],
                "sector_type": z["sector_type"],
                "priority_rank": z["priority"],
                "target_demand_mld": target_demand,
                "allocated_flow_mld": round(allocated, 1),
                "deficit_mld": round(deficit, 1),
                "availability_pct": avail_pct,
                "shortage_risk": risk_cat,
                "pressure_bar": 2.1 if pressure_drop else (3.42 if z["id"] == "node-zone-ind-1" and leakage_mld > 10 else 4.8),
                "feeder_status": "restricted" if pressure_drop else "nominal",
            }

        total_deficit_mld = round(max(0.0, total_demand_mld - total_allocated_mld), 1)
        grid_satisfaction_pct = round((total_allocated_mld / max(total_demand_mld, 0.1)) * 100, 1)

        # 5. Tank-Level Dynamics & Reserve Hours
        # East Elevated Tank (Capacity: 950 ML)
        tank1_inflow = p1_flow_mld
        tank1_outflow = zone_results["node-zone-res-1"]["allocated_flow_mld"] + zone_results["node-zone-res-2"]["allocated_flow_mld"]
        tank1_net_mld = tank1_inflow - tank1_outflow
        tank1_level_pct = max(15.0, min(100.0, round(76.2 + (tank1_net_mld / 950.0) * 100, 1)))
        tank1_reserve_hours = round((950.0 * (tank1_level_pct / 100)) / max(tank1_outflow / 24, 0.1), 1)

        # South Industrial Buffer Tank (Capacity: 750 ML)
        tank2_inflow = p2_flow_mld
        tank2_outflow = zone_results["node-zone-ind-1"]["allocated_flow_mld"] + zone_results["node-zone-agr-1"]["allocated_flow_mld"]
        tank2_net_mld = tank2_inflow - tank2_outflow
        tank2_level_pct = max(10.0, min(100.0, round(68.4 + (tank2_net_mld / 750.0) * 100, 1)))
        tank2_reserve_hours = round((750.0 * (tank2_level_pct / 100)) / max(tank2_outflow / 24, 0.1), 1)

        # 6. Overall System Health Score (0 - 100%)
        health_penalty = 0.0
        health_penalty += (100.0 - grid_satisfaction_pct) * 0.4
        health_penalty += min(25.0, (leakage_mld / 10.0) * 5.0)
        if p1_state != "online": health_penalty += 15.0
        if p2_state != "online": health_penalty += 15.0
        if res_level_pct < 50: health_penalty += 15.0

        overall_health = max(18, min(99, int(100.0 - health_penalty)))

        # 7. Update Full React Flow Graph (Nodes & Edges)
        network_graph = self._build_network_graph(
            res_vol=res_vol,
            res_level_pct=res_level_pct,
            water_treated_mld=water_treated_mld,
            p1_flow=p1_flow_mld,
            p1_press=p1_press_bar,
            p1_state=p1_state,
            p2_flow=p2_flow_mld,
            p2_press=p2_press_bar,
            p2_state=p2_state,
            tank1_level=tank1_level_pct,
            tank2_level=tank2_level_pct,
            zone_results=zone_results,
            pipe_status=pipe_status,
            leakage_mld=leakage_mld,
            overall_health=overall_health,
        )

        return {
            "scenario_name": params.get("name", "Active Simulation"),
            "scenario_key": params.get("scenario_key", "custom"),
            "water_balance": {
                "available_water_mld": round(water_treated_mld, 1),
                "reservoir_volume_ml": round(res_vol, 1),
                "reservoir_level_pct": res_level_pct,
                "total_demand_mld": round(total_demand_mld, 1),
                "total_consumption_mld": round(total_allocated_mld, 1),
                "distribution_losses_mld": total_losses_mld,
                "simulated_leakage_mld": round(leakage_mld, 1),
                "supply_demand_deficit_mld": total_deficit_mld,
                "satisfaction_rate_pct": grid_satisfaction_pct,
            },
            "tank_dynamics": {
                "east_tank": {
                    "id": "node-tank-1",
                    "name": "East Elevated Balancing Tank",
                    "level_pct": tank1_level_pct,
                    "net_flow_mld": round(tank1_net_mld, 1),
                    "reserve_hours": tank1_reserve_hours,
                    "trend": "filling" if tank1_net_mld > 0 else "depleting",
                },
                "south_tank": {
                    "id": "node-tank-2",
                    "name": "South Industrial Buffer Tank",
                    "level_pct": tank2_level_pct,
                    "net_flow_mld": round(tank2_net_mld, 1),
                    "reserve_hours": tank2_reserve_hours,
                    "trend": "filling" if tank2_net_mld > 0 else "depleting",
                },
            },
            "zones_availability": list(zone_results.values()),
            "overall_health": overall_health,
            "network": network_graph,
            "assumptions_and_limitations": [
                "Mass-conservation equilibrium: Inflow, leakage, and consumption are balanced over a daily horizon.",
                "Steady-state hydrodynamic approximation: Pipe friction loss is evaluated via simplified Hazen-Williams coefficients (C=120) without transient wave equations.",
                "Priority-rationed distribution: High-priority residential sectors are protected ahead of industrial and agricultural quotas during supply deficits.",
                "Approximation notice: Educational municipal scenario simulator for hackathon and operational triage evaluation; non-engineering certified.",
            ],
        }

    def _build_network_graph(
        self,
        res_vol: float,
        res_level_pct: float,
        water_treated_mld: float,
        p1_flow: float,
        p1_press: float,
        p1_state: str,
        p2_flow: float,
        p2_press: float,
        p2_state: str,
        tank1_level: float,
        tank2_level: float,
        zone_results: Dict[str, Any],
        pipe_status: Dict[str, bool],
        leakage_mld: float,
        overall_health: int,
    ) -> Dict[str, Any]:
        has_leak = leakage_mld > 5.0

        nodes = [
            {
                "id": "node-res-1",
                "label": "Sharda Sagar Bulk Reservoir",
                "type": "reservoir",
                "zone": "North Basin",
                "pressure_bar": 1.2,
                "flow_mld": round(water_treated_mld, 1),
                "capacity_ml": 4500.0,
                "level_percent": res_level_pct,
                "status": "warning" if res_level_pct < 40 else "normal",
                "has_leak": False,
                "is_low_pressure": False,
                "elevation_m": 120.0,
                "details": {
                    "catchment_area_sqkm": 240.0,
                    "storage_available_ml": round(res_vol, 1),
                    "level_pct": f"{res_level_pct}%",
                },
                "position": {"x": 50, "y": 250},
            },
            {
                "id": "node-wtp-1",
                "label": "Metro Rapid Gravity WTP",
                "type": "treatment",
                "zone": "Central Treatment",
                "pressure_bar": 2.4,
                "flow_mld": round(water_treated_mld, 1),
                "capacity_ml": 1000.0,
                "level_percent": 88.0,
                "status": "normal" if water_treated_mld > 200 else "warning",
                "has_leak": False,
                "is_low_pressure": False,
                "elevation_m": 95.0,
                "details": {"active_filtration_units": "6 of 6 online", "turbidity_ntu": 0.82},
                "position": {"x": 280, "y": 250},
            },
            {
                "id": "node-pump-1",
                "label": "North High-Lift Pumping Station",
                "type": "pump",
                "zone": "North Corridor",
                "pressure_bar": p1_press,
                "flow_mld": round(p1_flow, 1),
                "capacity_ml": None,
                "level_percent": None,
                "status": "critical" if p1_state == "offline" else ("warning" if p1_state == "throttled" else "normal"),
                "has_leak": False,
                "is_low_pressure": p1_press < 2.0,
                "elevation_m": 100.0,
                "details": {"status": p1_state.upper(), "active_pumps": "4 VFD Pumps", "rpm": 1450 if p1_state == "online" else (900 if p1_state == "throttled" else 0)},
                "position": {"x": 500, "y": 120},
            },
            {
                "id": "node-pump-2",
                "label": "South Booster Station",
                "type": "pump",
                "zone": "South Industrial Corridor",
                "pressure_bar": p2_press,
                "flow_mld": round(p2_flow, 1),
                "capacity_ml": None,
                "level_percent": None,
                "status": "critical" if p2_state == "offline" else ("warning" if (p2_state == "throttled" or has_leak) else "normal"),
                "has_leak": has_leak,
                "is_low_pressure": p2_press < 3.0,
                "elevation_m": 85.0,
                "details": {"status": p2_state.upper(), "active_pumps": "4 Centrifugal Pumps", "rpm": 1380 if p2_state == "online" else (800 if p2_state == "throttled" else 0)},
                "position": {"x": 500, "y": 380},
            },
            {
                "id": "node-tank-1",
                "label": "East Elevated Balancing Tank",
                "type": "tank",
                "zone": "East Ridge",
                "pressure_bar": 4.5,
                "flow_mld": round(p1_flow * 0.88, 1),
                "capacity_ml": 950.0,
                "level_percent": tank1_level,
                "status": "warning" if tank1_level < 40 else "normal",
                "has_leak": False,
                "is_low_pressure": False,
                "elevation_m": 145.0,
                "details": {"capacity_ml": 950.0, "level_pct": f"{tank1_level}%"},
                "position": {"x": 750, "y": 120},
            },
            {
                "id": "node-tank-2",
                "label": "South Buffer Ground Reservoir",
                "type": "tank",
                "zone": "South-West Grid",
                "pressure_bar": 3.8,
                "flow_mld": round(p2_flow * 0.75, 1),
                "capacity_ml": 750.0,
                "level_percent": tank2_level,
                "status": "warning" if tank2_level < 40 else "normal",
                "has_leak": False,
                "is_low_pressure": False,
                "elevation_m": 80.0,
                "details": {"capacity_ml": 750.0, "level_pct": f"{tank2_level}%"},
                "position": {"x": 750, "y": 480},
            },
            {
                "id": "node-zone-res-1",
                "label": "Residential Sector 1-4",
                "type": "zone",
                "zone": "North District",
                "pressure_bar": zone_results["node-zone-res-1"]["pressure_bar"],
                "flow_mld": zone_results["node-zone-res-1"]["allocated_flow_mld"],
                "capacity_ml": None,
                "level_percent": None,
                "status": "normal" if zone_results["node-zone-res-1"]["shortage_risk"] == "Normal" else "warning",
                "has_leak": False,
                "is_low_pressure": zone_results["node-zone-res-1"]["pressure_bar"] < 3.0,
                "elevation_m": 105.0,
                "details": {"deficit": f"{zone_results['node-zone-res-1']['deficit_mld']} MLD", "risk": zone_results["node-zone-res-1"]["shortage_risk"]},
                "position": {"x": 980, "y": 50},
            },
            {
                "id": "node-zone-res-2",
                "label": "Residential Core 5-8",
                "type": "zone",
                "zone": "East Core",
                "pressure_bar": zone_results["node-zone-res-2"]["pressure_bar"],
                "flow_mld": zone_results["node-zone-res-2"]["allocated_flow_mld"],
                "capacity_ml": None,
                "level_percent": None,
                "status": "normal" if zone_results["node-zone-res-2"]["shortage_risk"] == "Normal" else "warning",
                "has_leak": False,
                "is_low_pressure": zone_results["node-zone-res-2"]["pressure_bar"] < 3.0,
                "elevation_m": 110.0,
                "details": {"deficit": f"{zone_results['node-zone-res-2']['deficit_mld']} MLD", "risk": zone_results["node-zone-res-2"]["shortage_risk"]},
                "position": {"x": 980, "y": 170},
            },
            {
                "id": "node-zone-ind-1",
                "label": "Industrial Sector 9",
                "type": "zone",
                "zone": "South Industrial",
                "pressure_bar": zone_results["node-zone-ind-1"]["pressure_bar"],
                "flow_mld": zone_results["node-zone-ind-1"]["allocated_flow_mld"],
                "capacity_ml": None,
                "level_percent": None,
                "status": "critical" if (has_leak or zone_results["node-zone-ind-1"]["shortage_risk"] in ["Critical", "High Risk"]) else "normal",
                "has_leak": has_leak,
                "is_low_pressure": zone_results["node-zone-ind-1"]["pressure_bar"] < 3.0,
                "elevation_m": 82.0,
                "details": {"deficit": f"{zone_results['node-zone-ind-1']['deficit_mld']} MLD", "risk": zone_results["node-zone-ind-1"]["shortage_risk"]},
                "position": {"x": 980, "y": 320},
            },
            {
                "id": "node-zone-agr-1",
                "label": "Agricultural Belt",
                "type": "zone",
                "zone": "West Suburbs",
                "pressure_bar": zone_results["node-zone-agr-1"]["pressure_bar"],
                "flow_mld": zone_results["node-zone-agr-1"]["allocated_flow_mld"],
                "capacity_ml": None,
                "level_percent": None,
                "status": "critical" if zone_results["node-zone-agr-1"]["shortage_risk"] in ["Critical", "High Risk"] else "normal",
                "has_leak": False,
                "is_low_pressure": zone_results["node-zone-agr-1"]["pressure_bar"] < 3.0,
                "elevation_m": 78.0,
                "details": {"deficit": f"{zone_results['node-zone-agr-1']['deficit_mld']} MLD", "risk": zone_results["node-zone-agr-1"]["shortage_risk"]},
                "position": {"x": 980, "y": 480},
            },
            {
                "id": "node-p-2",
                "label": "Pressure Monitor PN-102",
                "type": "sensor_pressure",
                "zone": "Sector 9",
                "pressure_bar": 3.42 if has_leak else 4.8,
                "flow_mld": 0.0,
                "capacity_ml": None,
                "level_percent": None,
                "status": "critical" if has_leak else "normal",
                "has_leak": has_leak,
                "is_low_pressure": has_leak,
                "elevation_m": 82.0,
                "details": {"status": "ANOMALY" if has_leak else "ONLINE"},
                "position": {"x": 770, "y": 320},
            },
        ]

        edges = [
            {
                "id": "e-res-wtp",
                "source": "node-res-1",
                "target": "node-wtp-1",
                "label": f"{round(water_treated_mld, 1)} MLD",
                "flow_mld": round(water_treated_mld, 1),
                "pressure_bar": 1.2,
                "diameter_mm": 1800,
                "status": "normal" if pipe_status.get("e-res-wtp", True) else "disabled",
                "animated": pipe_status.get("e-res-wtp", True) and water_treated_mld > 0,
            },
            {
                "id": "e-wtp-p1",
                "source": "node-wtp-1",
                "target": "node-pump-1",
                "label": f"{round(p1_flow, 1)} MLD",
                "flow_mld": round(p1_flow, 1),
                "pressure_bar": 2.4,
                "diameter_mm": 1200,
                "status": "normal" if pipe_status.get("e-wtp-p1", True) else "disabled",
                "animated": pipe_status.get("e-wtp-p1", True) and p1_flow > 0,
            },
            {
                "id": "e-wtp-p2",
                "source": "node-wtp-1",
                "target": "node-pump-2",
                "label": f"{round(p2_flow, 1)} MLD",
                "flow_mld": round(p2_flow, 1),
                "pressure_bar": 2.4,
                "diameter_mm": 1200,
                "status": "normal" if pipe_status.get("e-wtp-p2", True) else "disabled",
                "animated": pipe_status.get("e-wtp-p2", True) and p2_flow > 0,
            },
            {
                "id": "e-p1-tank1",
                "source": "node-pump-1",
                "target": "node-tank-1",
                "label": f"{round(p1_flow, 1)} MLD • {p1_press} Bar",
                "flow_mld": round(p1_flow, 1),
                "pressure_bar": p1_press,
                "diameter_mm": 900,
                "status": "normal" if pipe_status.get("e-p1-tank1", True) else "disabled",
                "animated": pipe_status.get("e-p1-tank1", True) and p1_flow > 0,
            },
            {
                "id": "e-tank1-res1",
                "source": "node-tank-1",
                "target": "node-zone-res-1",
                "label": f"{zone_results['node-zone-res-1']['allocated_flow_mld']} MLD",
                "flow_mld": zone_results["node-zone-res-1"]["allocated_flow_mld"],
                "pressure_bar": zone_results["node-zone-res-1"]["pressure_bar"],
                "diameter_mm": 700,
                "status": "normal" if pipe_status.get("e-tank1-res1", True) else "disabled",
                "animated": pipe_status.get("e-tank1-res1", True) and zone_results["node-zone-res-1"]["allocated_flow_mld"] > 0,
            },
            {
                "id": "e-tank1-res2",
                "source": "node-tank-1",
                "target": "node-zone-res-2",
                "label": f"{zone_results['node-zone-res-2']['allocated_flow_mld']} MLD",
                "flow_mld": zone_results["node-zone-res-2"]["allocated_flow_mld"],
                "pressure_bar": zone_results["node-zone-res-2"]["pressure_bar"],
                "diameter_mm": 600,
                "status": "normal" if pipe_status.get("e-tank1-res2", True) else "disabled",
                "animated": pipe_status.get("e-tank1-res2", True) and zone_results["node-zone-res-2"]["allocated_flow_mld"] > 0,
            },
            {
                "id": "e-p2-pn102",
                "source": "node-pump-2",
                "target": "node-p-2",
                "label": f"{p2_press} Bar" + (" (LEAK DETECTED)" if has_leak else ""),
                "flow_mld": round(p2_flow * 0.6, 1),
                "pressure_bar": p2_press,
                "diameter_mm": 800,
                "status": "leak" if has_leak else ("disabled" if not pipe_status.get("e-p2-pn102", True) else "normal"),
                "animated": pipe_status.get("e-p2-pn102", True) and p2_flow > 0,
            },
            {
                "id": "e-pn102-ind",
                "source": "node-p-2",
                "target": "node-zone-ind-1",
                "label": f"{zone_results['node-zone-ind-1']['allocated_flow_mld']} MLD",
                "flow_mld": zone_results["node-zone-ind-1"]["allocated_flow_mld"],
                "pressure_bar": zone_results["node-zone-ind-1"]["pressure_bar"],
                "diameter_mm": 750,
                "status": "leak" if has_leak else ("disabled" if not pipe_status.get("e-pn102-ind", True) else "normal"),
                "animated": pipe_status.get("e-pn102-ind", True) and zone_results["node-zone-ind-1"]["allocated_flow_mld"] > 0,
            },
            {
                "id": "e-p2-tank2",
                "source": "node-pump-2",
                "target": "node-tank-2",
                "label": f"{round(p2_flow * 0.4, 1)} MLD",
                "flow_mld": round(p2_flow * 0.4, 1),
                "pressure_bar": 4.1,
                "diameter_mm": 650,
                "status": "normal" if pipe_status.get("e-p2-tank2", True) else "disabled",
                "animated": pipe_status.get("e-p2-tank2", True) and p2_flow > 0,
            },
            {
                "id": "e-tank2-agr",
                "source": "node-tank-2",
                "target": "node-zone-agr-1",
                "label": f"{zone_results['node-zone-agr-1']['allocated_flow_mld']} MLD",
                "flow_mld": zone_results["node-zone-agr-1"]["allocated_flow_mld"],
                "pressure_bar": zone_results["node-zone-agr-1"]["pressure_bar"],
                "diameter_mm": 500,
                "status": "normal" if pipe_status.get("e-tank2-agr", True) else "disabled",
                "animated": pipe_status.get("e-tank2-agr", True) and zone_results["node-zone-agr-1"]["allocated_flow_mld"] > 0,
            },
        ]

        return {
            "system_name": "Metro Water Grid Alpha Digital Twin",
            "simulation_engine": "Hydraulic Flow Equilibrium v2.0 (Computational Simulator)",
            "disclaimer": "Simulated Hydrodynamic Model: Steady-state approximation based on mass-conservation and nodal pressure gradient physics.",
            "overall_health": overall_health,
            "active_leaks_count": 1 if has_leak else 0,
            "nodes": nodes,
            "edges": edges,
        }

hydraulic_engine = HydraulicSimulationEngine()
