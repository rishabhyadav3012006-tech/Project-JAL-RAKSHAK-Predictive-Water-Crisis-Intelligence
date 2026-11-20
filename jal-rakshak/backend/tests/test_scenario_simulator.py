"""Phase 13 Advanced Digital Twin Hydraulic Scenario Simulator Tests."""
import pytest
from app.api.routers.network import (
    simulate_hydraulic_scenario,
    get_preset_scenarios,
    compare_scenarios,
    save_custom_scenario,
    get_saved_scenarios,
    ScenarioSimulateRequest,
    ScenarioCompareRequest,
    SaveScenarioRequest,
)
from app.services.hydraulic_simulator import hydraulic_service

def test_preset_scenarios_available():
    """Verifies that the 6 required municipal scenarios are available."""
    presets = get_preset_scenarios()
    assert len(presets) == 6
    preset_keys = {p["key"] for p in presets}
    expected_keys = {
        "normal",
        "increased_demand",
        "reduced_reservoir",
        "pipeline_leakage",
        "pump_failure",
        "multi_anomaly",
    }
    assert expected_keys.issubset(preset_keys)

def test_simulation_normal_distribution():
    """Verifies that normal parameters yield 100% satisfaction, 0 deficit, and nominal health."""
    req = ScenarioSimulateRequest(
        reservoir_volume_ml=4500.0,
        incoming_supply_mld=842.0,
        demand_multiplier=1.0,
        pipelines_status={},
        pumps_status={"node-pump-1": "online", "node-pump-2": "online"},
        simulated_leakage_mld=0.0,
    )
    result = simulate_hydraulic_scenario(req)
    wb = result["water_balance"]

    assert wb["supply_demand_deficit_mld"] == 0.0
    assert wb["satisfaction_rate_pct"] >= 99.0
    assert result["overall_health"] >= 90
    assert len(result["zones_availability"]) == 4

    # All zones should be in Normal risk category
    for zone in result["zones_availability"]:
        assert zone["shortage_risk"] == "Normal"

def test_simulation_increased_demand():
    """Verifies that increased demand (+45%) creates deficit and impacts storage."""
    req = ScenarioSimulateRequest(
        reservoir_volume_ml=4500.0,
        incoming_supply_mld=842.0,
        demand_multiplier=1.45,
        pumps_status={"node-pump-1": "online", "node-pump-2": "online"},
    )
    result = simulate_hydraulic_scenario(req)
    wb = result["water_balance"]

    assert wb["total_demand_mld"] > 1000.0
    assert wb["supply_demand_deficit_mld"] > 0.0
    assert wb["satisfaction_rate_pct"] < 90.0

def test_simulation_reduced_reservoir():
    """Verifies that low reservoir volume triggers priority-based rationing."""
    req = ScenarioSimulateRequest(
        reservoir_volume_ml=1600.0,
        incoming_supply_mld=480.0,
        demand_multiplier=1.0,
        distribution_priorities=["residential", "commercial", "industrial", "agricultural"],
    )
    result = simulate_hydraulic_scenario(req)
    wb = result["water_balance"]
    assert wb["available_water_mld"] <= 480.0
    assert wb["supply_demand_deficit_mld"] > 200.0

    # Residential zones should have lower deficit than agricultural/industrial due to priority
    zones_map = {z["sector_type"]: z for z in result["zones_availability"]}
    res_zone = zones_map["residential"]
    agr_zone = zones_map["agricultural"]
    assert res_zone["availability_pct"] >= agr_zone["availability_pct"]

def test_simulation_pump_failure():
    """Verifies that offline South Booster pump cuts off southern/western supplies."""
    req = ScenarioSimulateRequest(
        pumps_status={"node-pump-1": "online", "node-pump-2": "offline"},
    )
    result = simulate_hydraulic_scenario(req)
    zones_map = {z["zone_id"]: z for z in result["zones_availability"]}

    # South Industrial should be severely impacted
    south_ind = zones_map["zone-south"]
    assert south_ind["shortage_risk"] in ["Critical", "High Risk"]
    assert south_ind["feeder_status"] == "restricted"

def test_simulation_pipeline_leakage():
    """Verifies that pipe fracture introduces leakage losses and flags network leak."""
    req = ScenarioSimulateRequest(
        simulated_leakage_mld=48.0,
        pipelines_status={"e-p2-pn102": True},
    )
    result = simulate_hydraulic_scenario(req)
    wb = result["water_balance"]
    assert wb["simulated_leakage_mld"] == 48.0
    assert wb["distribution_losses_mld"] >= 48.0
    assert result["network"]["active_leaks_count"] == 1

def test_scenario_comparison():
    """Verifies side-by-side Before vs. After comparison calculation."""
    normal_preset = hydraulic_service.get_preset("normal")["params"]
    burst_preset = hydraulic_service.get_preset("pipeline_leakage")["params"]

    req = ScenarioCompareRequest(
        baseline_params=normal_preset,
        simulated_params=burst_preset,
    )
    res = compare_scenarios(req)

    assert "baseline" in res
    assert "simulated" in res
    assert "deltas" in res
    assert "zone_comparisons" in res
    assert res["deltas"]["losses_mld"] > 0.0

def test_save_and_retrieve_scenario(db_session):
    """Verifies saving a scenario to the database and retrieving it."""
    save_req = SaveScenarioRequest(
        scenario_key="test_custom_drought_2026",
        title="Test Custom Severe Drought Scenario",
        description="Drought simulation with 30% storage and 1.2x demand.",
        parameters={"reservoir_volume_ml": 1500.0, "demand_multiplier": 1.2},
    )
    save_res = save_custom_scenario(save_req, db=db_session)
    assert save_res["status"] == "saved"
    assert save_res["scenario_key"] == "test_custom_drought_2026"

    saved_list = get_saved_scenarios(db=db_session)
    assert any(s["scenario_key"] == "test_custom_drought_2026" for s in saved_list)
