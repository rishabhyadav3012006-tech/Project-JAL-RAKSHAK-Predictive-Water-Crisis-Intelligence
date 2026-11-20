"""JAL-RAKSHAK Simplified Hydraulic Digital Twin Engine

Note: This simulation engine provides hydrodynamic approximation models for hackathon MVP telemetry
and stress scenario evaluation. It is an educational approximation rather than a certified engineering tool.
"""
from typing import Dict, Any, List

def get_base_digital_twin_network() -> Dict[str, Any]:
    nodes = [
        {
            "id": "node-res-1",
            "label": "Sharda Sagar Bulk Reservoir",
            "type": "reservoir",
            "zone": "North Basin",
            "pressure_bar": 1.2,
            "flow_mld": 842.0,
            "capacity_ml": 4500.0,
            "level_percent": 84.5,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 120.0,
            "details": {
                "catchment_area_sqkm": 240.0,
                "ph_level": 7.4,
                "dissolved_oxygen_mg_l": 8.2,
                "inflow_source": "Northern Canal Intake"
            },
            "position": {"x": 50, "y": 250}
        },
        {
            "id": "node-wtp-1",
            "label": "Metro Rapid Gravity WTP",
            "type": "treatment",
            "zone": "Central Treatment",
            "pressure_bar": 2.4,
            "flow_mld": 820.0,
            "capacity_ml": 1000.0,
            "level_percent": 88.0,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 95.0,
            "details": {
                "filtration_stages": "Coagulation, Sedimentation, Ozonation, Sand Filters",
                "turbidity_ntu": 0.82,
                "chlorine_residual_ppm": 1.4,
                "operational_units": "6 of 6 online"
            },
            "position": {"x": 280, "y": 250}
        },
        {
            "id": "node-pump-1",
            "label": "North High-Lift Pumping Station",
            "type": "pump",
            "zone": "North Corridor",
            "pressure_bar": 5.8,
            "flow_mld": 420.0,
            "capacity_ml": None,
            "level_percent": None,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 100.0,
            "details": {
                "active_pumps": "4 Centrifugal VFD Pumps",
                "total_power_kw": 450.0,
                "rpm": 1450,
                "discharge_head_m": 65.0
            },
            "position": {"x": 500, "y": 120}
        },
        {
            "id": "node-pump-2",
            "label": "South Booster Station",
            "type": "pump",
            "zone": "South Industrial Corridor",
            "pressure_bar": 3.45,
            "flow_mld": 400.0,
            "capacity_ml": None,
            "level_percent": None,
            "status": "warning",
            "has_leak": True,
            "is_low_pressure": True,
            "elevation_m": 85.0,
            "details": {
                "active_pumps": "2 of 4 Pumps Running (Sub-optimal)",
                "total_power_kw": 280.0,
                "rpm": 1200,
                "anomaly_flag": "Downstream Acoustic Rupture Detected"
            },
            "position": {"x": 500, "y": 380}
        },
        {
            "id": "node-tank-1",
            "label": "East Elevated Balancing Tank",
            "type": "tank",
            "zone": "East Ridge",
            "pressure_bar": 4.5,
            "flow_mld": 184.0,
            "capacity_ml": 950.0,
            "level_percent": 76.2,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 135.0,
            "details": {
                "height_m": 35.0,
                "replenishment_rate_m3_h": 410.0,
                "overflow_risk": "Low"
            },
            "position": {"x": 750, "y": 80}
        },
        {
            "id": "node-tank-2",
            "label": "West Sub-aquifer Ground Sump",
            "type": "tank",
            "zone": "West Suburbs",
            "pressure_bar": 4.1,
            "flow_mld": 174.0,
            "capacity_ml": 850.0,
            "level_percent": 82.0,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 90.0,
            "details": {
                "depth_m": 12.0,
                "recharge_aquifer_sync": "Active",
                "turbidity_ntu": 0.95
            },
            "position": {"x": 750, "y": 440}
        },
        {
            "id": "node-zone-res-1",
            "label": "Sector 1-4 North Residential",
            "type": "residential",
            "zone": "North Residential",
            "pressure_bar": 4.85,
            "flow_mld": 201.2,
            "capacity_ml": None,
            "level_percent": None,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 88.0,
            "details": {
                "population_served": "145,000 residents",
                "per_capita_lpcd": 138.0,
                "metered_connections": 28400
            },
            "position": {"x": 1020, "y": 50}
        },
        {
            "id": "node-zone-res-2",
            "label": "Zone 5-8 East Commercial & IT",
            "type": "residential",
            "zone": "East Commercial",
            "pressure_bar": 5.12,
            "flow_mld": 172.5,
            "capacity_ml": None,
            "level_percent": None,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 92.0,
            "details": {
                "active_smart_meters": 14200,
                "peak_hour": "10:00 - 12:00",
                "water_quality_score": "98.4 / 100"
            },
            "position": {"x": 1020, "y": 180}
        },
        {
            "id": "node-zone-ind-1",
            "label": "Sector 9-12 South Industrial Ring",
            "type": "industrial",
            "zone": "South Industrial",
            "pressure_bar": 3.42,
            "flow_mld": 224.0,
            "capacity_ml": None,
            "level_percent": None,
            "status": "critical",
            "has_leak": True,
            "is_low_pressure": True,
            "elevation_m": 80.0,
            "details": {
                "heavy_manufacturing_plants": 34,
                "leakage_warning": "Acoustic sensor flagged pipe rupture at junction B",
                "loss_volume_est": "18.5 MLD",
                "pressure_deficit": "-1.4 Bar below threshold"
            },
            "position": {"x": 1020, "y": 340}
        },
        {
            "id": "node-zone-agr-1",
            "label": "Eastern Peri-Urban Canal Feeder",
            "type": "agricultural",
            "zone": "Peri-Urban Green Belt",
            "pressure_bar": 3.8,
            "flow_mld": 110.0,
            "capacity_ml": None,
            "level_percent": None,
            "status": "standby",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 75.0,
            "details": {
                "irrigation_hectares": 1250,
                "soil_moisture_sync": "Active",
                "drip_irrigation_mode": "Scheduled 05:00 - 08:00"
            },
            "position": {"x": 1020, "y": 480}
        },
        {
            "id": "node-p-1",
            "label": "Pressure Monitor PN-101",
            "type": "sensor_pressure",
            "zone": "North Main Conduit",
            "pressure_bar": 4.85,
            "flow_mld": 0.0,
            "capacity_ml": None,
            "level_percent": None,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 95.0,
            "details": {
                "telemetry_protocol": "MQTT / LoRaWAN",
                "sampling_rate_sec": 5,
                "battery_health": "96%"
            },
            "position": {"x": 620, "y": 20}
        },
        {
            "id": "node-p-2",
            "label": "Pressure Monitor PN-102 (Leak Zone)",
            "type": "sensor_pressure",
            "zone": "Sector 9 South Conduit",
            "pressure_bar": 3.42,
            "flow_mld": 0.0,
            "capacity_ml": None,
            "level_percent": None,
            "status": "critical",
            "has_leak": True,
            "is_low_pressure": True,
            "elevation_m": 82.0,
            "details": {
                "alarm_state": "CRITICAL DROP TRIGGERED",
                "historical_mean": "4.8 Bar",
                "deviation_sigma": "-3.2 STD"
            },
            "position": {"x": 780, "y": 270}
        },
        {
            "id": "node-f-1",
            "label": "Flow Transducer FM-201",
            "type": "sensor_flow",
            "zone": "Bulk Intake",
            "pressure_bar": 2.4,
            "flow_mld": 820.0,
            "capacity_ml": None,
            "level_percent": None,
            "status": "normal",
            "has_leak": False,
            "is_low_pressure": False,
            "elevation_m": 95.0,
            "details": {
                "meter_type": "Electromagnetic Magflow",
                "accuracy": "+/- 0.2%",
                "pipe_dn_mm": 1200
            },
            "position": {"x": 190, "y": 180}
        },
        {
            "id": "node-f-2",
            "label": "Flow Transducer FM-202",
            "type": "sensor_flow",
            "zone": "South Feeder",
            "pressure_bar": 3.5,
            "flow_mld": 240.0,
            "capacity_ml": None,
            "level_percent": None,
            "status": "warning",
            "has_leak": True,
            "is_low_pressure": False,
            "elevation_m": 84.0,
            "details": {
                "meter_type": "Ultrasonic Transit-Time",
                "flow_discrepancy": "+18.2% vs demand downstream"
            },
            "position": {"x": 880, "y": 380}
        }
    ]

    edges = [
        {
            "id": "e-res-wtp",
            "source": "node-res-1",
            "target": "node-wtp-1",
            "label": "Raw Intake: 842 MLD • 1.2 Bar",
            "flow_mld": 842.0,
            "pressure_bar": 1.2,
            "diameter_mm": 1800,
            "length_km": 4.5,
            "status": "normal",
            "animated": True
        },
        {
            "id": "e-wtp-p1",
            "source": "node-wtp-1",
            "target": "node-pump-1",
            "label": "Treated Water: 420 MLD",
            "flow_mld": 420.0,
            "pressure_bar": 2.4,
            "diameter_mm": 1200,
            "length_km": 2.8,
            "status": "normal",
            "animated": True
        },
        {
            "id": "e-wtp-p2",
            "source": "node-wtp-1",
            "target": "node-pump-2",
            "label": "Treated Water: 400 MLD",
            "flow_mld": 400.0,
            "pressure_bar": 2.4,
            "diameter_mm": 1200,
            "length_km": 3.2,
            "status": "normal",
            "animated": True
        },
        {
            "id": "e-p1-tank1",
            "source": "node-pump-1",
            "target": "node-tank-1",
            "label": "High-Lift Main: 215 MLD • 5.8 Bar",
            "flow_mld": 215.0,
            "pressure_bar": 5.8,
            "diameter_mm": 900,
            "length_km": 3.5,
            "status": "normal",
            "animated": True
        },
        {
            "id": "e-p1-pn101",
            "source": "node-pump-1",
            "target": "node-p-1",
            "label": "Nodal Branch: 4.85 Bar",
            "flow_mld": 0.0,
            "pressure_bar": 4.85,
            "diameter_mm": 300,
            "length_km": 0.8,
            "status": "normal",
            "animated": False
        },
        {
            "id": "e-tank1-res1",
            "source": "node-tank-1",
            "target": "node-zone-res-1",
            "label": "Gravity Feed: 201 MLD • 4.8 Bar",
            "flow_mld": 201.2,
            "pressure_bar": 4.85,
            "diameter_mm": 700,
            "length_km": 2.2,
            "status": "normal",
            "animated": True
        },
        {
            "id": "e-tank1-res2",
            "source": "node-tank-1",
            "target": "node-zone-res-2",
            "label": "Distribution Ring: 172 MLD",
            "flow_mld": 172.5,
            "pressure_bar": 5.12,
            "diameter_mm": 600,
            "length_km": 1.9,
            "status": "normal",
            "animated": True
        },
        {
            "id": "e-p2-pn102",
            "source": "node-pump-2",
            "target": "node-p-2",
            "label": "Sector 9 Trunk: 3.42 Bar (LEAK DETECTED)",
            "flow_mld": 224.0,
            "pressure_bar": 3.42,
            "diameter_mm": 800,
            "length_km": 2.1,
            "status": "leak",
            "animated": True
        },
        {
            "id": "e-pn102-ind",
            "source": "node-p-2",
            "target": "node-zone-ind-1",
            "label": "Industrial Feeder: 224 MLD",
            "flow_mld": 224.0,
            "pressure_bar": 3.42,
            "diameter_mm": 750,
            "length_km": 1.4,
            "status": "leak",
            "animated": True
        },
        {
            "id": "e-p2-tank2",
            "source": "node-pump-2",
            "target": "node-tank-2",
            "label": "West Buffer Trunk: 174 MLD",
            "flow_mld": 174.0,
            "pressure_bar": 4.1,
            "diameter_mm": 650,
            "length_km": 3.0,
            "status": "normal",
            "animated": True
        },
        {
            "id": "e-tank2-agr",
            "source": "node-tank-2",
            "target": "node-zone-agr-1",
            "label": "Irrigation Feeder: 110 MLD",
            "flow_mld": 110.0,
            "pressure_bar": 3.8,
            "diameter_mm": 500,
            "length_km": 4.2,
            "status": "normal",
            "animated": True
        }
    ]

    return {
        "system_name": "Metro Water Grid Alpha Digital Twin",
        "simulation_engine": "Hydraulic Flow Equilibrium v1.0 (Approximation)",
        "disclaimer": "Simulated Hydrodynamic Model (Approximation) — Hackathon MVP Digital Twin Engine",
        "nodes": nodes,
        "edges": edges,
        "overall_health": 91,
        "active_leaks_count": 1
    }

def execute_simulation_action(component_id: str, action: str) -> Dict[str, Any]:
    network = get_base_digital_twin_network()
    
    if action == "valve_shutoff":
        for node in network["nodes"]:
            if node["id"] == component_id or node["id"] == "node-zone-ind-1":
                node["status"] = "standby"
                node["flow_mld"] = 0.0
                node["pressure_bar"] = 0.0
        for edge in network["edges"]:
            if edge["target"] == component_id or edge["source"] == component_id or edge["id"] in ["e-p2-pn102", "e-pn102-ind"]:
                edge["status"] = "normal"
                edge["flow_mld"] = 0.0
                edge["label"] = "Valve Isolated: 0 MLD"
                edge["animated"] = False
        network["active_leaks_count"] = 0
        network["overall_health"] = 96

    elif action == "repair_leak":
        for node in network["nodes"]:
            if node["id"] in ["node-pump-2", "node-zone-ind-1", "node-p-2", "node-f-2"]:
                node["status"] = "normal"
                node["has_leak"] = False
                node["is_low_pressure"] = False
                node["pressure_bar"] = 4.8
        for edge in network["edges"]:
            if edge["id"] in ["e-p2-pn102", "e-pn102-ind"]:
                edge["status"] = "normal"
                edge["pressure_bar"] = 4.8
                edge["label"] = "Sector 9 Trunk: 205 MLD • 4.8 Bar (Repaired)"
        network["active_leaks_count"] = 0
        network["overall_health"] = 98

    elif action == "pressure_boost":
        for node in network["nodes"]:
            if node["id"] == "node-pump-2":
                node["pressure_bar"] = 4.6
                node["status"] = "normal"
        for edge in network["edges"]:
            if edge["source"] == "node-pump-2":
                edge["pressure_bar"] = 4.6

    return network
