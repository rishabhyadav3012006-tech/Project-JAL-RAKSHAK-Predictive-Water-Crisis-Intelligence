"""Comprehensive End-to-End Test Suite for All JAL-RAKSHAK API Handlers and Routers.
Tests all 14 modular routers, database CRUD, input validation, and structured error responses.
Directly invokes FastAPI router handlers without external HTTP client dependencies.
"""
import pytest
from fastapi import HTTPException
from app.api.routers.system import health_check, status_check, system_metrics, system_version
from app.api.routers.dashboard import get_dashboard_metrics, get_dashboard_charts
from app.api.routers.users import list_users, get_user, create_user
from app.api.routers.zones import list_zones, get_zone, get_zones_water_availability
from app.api.routers.network import (
    list_components,
    get_digital_twin_network,
    get_preset_scenarios,
    simulate_hydraulic_scenario,
    compare_scenarios,
    save_custom_scenario,
    get_saved_scenarios,
    ScenarioSimulateRequest,
    ScenarioCompareRequest,
    SaveScenarioRequest,
)
from app.api.routers.sensors import list_sensors, get_sensor, get_sensor_readings, get_live_sensors
from app.api.routers.anomalies import list_anomaly_events, get_anomaly_event, predict_anomaly, AnomalyPredictRequest
from app.api.routers.leakage import list_leakage_alerts, get_leakage_alert, get_leakage_statistics
from app.api.routers.demand import list_forecasts, get_zone_forecast_curves, get_demand_evaluation, get_zones_comparison
from app.api.routers.shortage import list_shortage_predictions, get_shortage_overview, get_reservoir_overview, get_shortage_timeline
from app.api.routers.fusion import get_unified_network_health, get_sensor_reliability_metrics, process_sensor_fusion, MultiSensorFusionProcessRequest
from app.api.routers.simulation import list_simulation_scenarios, get_simulation_status
from app.api.routers.analytics import get_water_balance, get_compliance_report
from app.api.routers.realtime import get_activity_feed, get_ws_statistics

# ========================================================
# 1. System, Health & Metrics Handlers
# ========================================================
def test_system_health_handler(db_session):
    res = health_check(db=db_session)
    assert res.status == "healthy"
    assert res.details["database"] == "connected"

def test_system_status_handler():
    res = status_check()
    assert res["status"] == "online"
    assert "timestamp" in res

def test_system_metrics_handler():
    res = system_metrics()
    assert "cpu_usage_percent" in res
    assert "memory_usage_mb" in res

def test_system_version_handler():
    res = system_version()
    assert res["version"] == "1.0.0"

# ========================================================
# 2. Dashboard Overview & Charts Handlers
# ========================================================
def test_dashboard_metrics_handler(db_session):
    res = get_dashboard_metrics(db=db_session)
    assert "total_water_supply_m3h" in res
    assert "current_consumption_m3h" in res
    assert "water_loss_percentage" in res
    assert "network_health_score" in res

def test_dashboard_charts_handler(db_session):
    charts = get_dashboard_charts(db=db_session)
    assert "time_series" in charts
    assert len(charts["time_series"]) > 0
    assert "zonal_distribution" in charts
    assert "reservoir_levels" in charts

# ========================================================
# 3. Users & RBAC Router Handlers
# ========================================================
def test_users_list_and_pagination(db_session):
    res = list_users(skip=0, limit=3, role=None, db=db_session)
    assert res.total >= 1
    assert len(res.items) <= 3

def test_users_filter_by_role(db_session):
    res = list_users(skip=0, limit=50, role="operator", db=db_session)
    for u in res.items:
        assert u.role == "operator"

def test_get_user_by_id(db_session):
    first_user = list_users(skip=0, limit=1, role=None, db=db_session).items[0]
    user = get_user(user_id=first_user.id, db=db_session)
    assert user.id == first_user.id
    assert user.username == first_user.username

def test_get_user_not_found(db_session):
    with pytest.raises(HTTPException) as exc_info:
        get_user(user_id=999999, db=db_session)
    assert exc_info.value.status_code == 404

# ========================================================
# 4. Municipal Zones Handlers
# ========================================================
def test_zones_list_and_details(db_session):
    zones = list_zones(skip=0, limit=50, status_filter=None, db=db_session)
    assert zones.total >= 4
    first_zone_id = zones.items[0].zone_id

    first_zone = get_zone(zone_id=first_zone_id, db=db_session)
    assert first_zone["zone"].zone_id == first_zone_id

def test_zone_water_availability_handler(db_session):
    avail = get_zones_water_availability(db=db_session)
    assert len(avail) >= 4
    for z in avail:
        assert "loss_pct" in z
        assert "status" in z

def test_zone_not_found(db_session):
    with pytest.raises(HTTPException) as exc_info:
        get_zone(zone_id="zone-nonexistent", db=db_session)
    assert exc_info.value.status_code == 404

# ========================================================
# 5. Network Infrastructure & Digital Twin Handlers
# ========================================================
def test_network_components_list(db_session):
    comps = list_components(skip=0, limit=20, component_type=None, zone_id=None, status_filter=None, db=db_session)
    assert comps.total >= 5

def test_digital_twin_topology_handler():
    net = get_digital_twin_network()
    assert "nodes" in net
    assert "edges" in net
    assert len(net["nodes"]) >= 10

def test_digital_twin_presets_handler():
    presets = get_preset_scenarios()
    assert len(presets) == 6
    keys = [p["key"] for p in presets]
    assert "normal" in keys

def test_digital_twin_simulate_handler():
    req = ScenarioSimulateRequest(
        reservoir_volume_ml=4500.0,
        incoming_supply_mld=842.0,
        demand_multiplier=1.0,
        simulated_leakage_mld=0.0
    )
    res = simulate_hydraulic_scenario(req=req)
    assert res["water_balance"]["supply_demand_deficit_mld"] == 0.0
    assert "network" in res

def test_digital_twin_compare_handler():
    req = ScenarioCompareRequest(
        simulated_params={
            "reservoir_volume_ml": 4500.0,
            "incoming_supply_mld": 842.0,
            "demand_multiplier": 1.45,
            "simulated_leakage_mld": 0.0
        }
    )
    res = compare_scenarios(req=req)
    assert "baseline" in res
    assert "simulated" in res
    assert "deltas" in res

def test_digital_twin_save_and_retrieve_scenario(db_session):
    payload = SaveScenarioRequest(
        scenario_key="audit_test_scenario_14",
        title="Audit Test Scenario",
        description="Testing scenario persistence during Phase 14 technical audit.",
        parameters={"demand_multiplier": 1.25}
    )
    save_res = save_custom_scenario(payload=payload, db=db_session)
    assert save_res["status"] == "saved"

    saved_list = get_saved_scenarios(db=db_session)
    assert any(s["scenario_key"] == "audit_test_scenario_14" for s in saved_list)

# ========================================================
# 6. Sensors & Telemetry Handlers
# ========================================================
def test_sensors_list_and_readings(db_session):
    sensors = list_sensors(skip=0, limit=50, sensor_type=None, zone_id=None, is_active=None, db=db_session)
    assert sensors.total >= 1
    target_sensor_id = sensors.items[0].sensor_id

    s = get_sensor(sensor_id=target_sensor_id, db=db_session)
    assert s.sensor_id == target_sensor_id

    readings = get_sensor_readings(sensor_id=target_sensor_id, limit=5, db=db_session)
    assert isinstance(readings, list)

def test_sensor_not_found(db_session):
    with pytest.raises(HTTPException) as exc_info:
        get_sensor(sensor_id="NON_EXISTENT_SENSOR", db=db_session)
    assert exc_info.value.status_code == 404

def test_live_sensors_inventory():
    live = get_live_sensors()
    assert isinstance(live, list)
    assert len(live) >= 17

# ========================================================
# 7. Anomalies & Prediction Handlers
# ========================================================
def test_anomalies_list_handler(db_session):
    res = list_anomaly_events(skip=0, limit=50, zone_id=None, severity=None, acknowledged=None, db=db_session)
    assert res.total >= 1

def test_predict_anomaly_handler():
    req = AnomalyPredictRequest(
        flow_rate_m3h=400.0,
        pressure_bar=2.1,
        tank_level_pct=55.0,
        historical_consumption_m3h=140.0,
        zone_id="ZONE_3"
    )
    res = predict_anomaly(req=req)
    assert "is_anomaly" in res
    assert "anomaly_score" in res

# ========================================================
# 8. Leakage & Incidents Handlers
# ========================================================
def test_leakage_alerts_handler(db_session):
    alerts = list_leakage_alerts(skip=0, limit=50, zone_id=None, severity=None, status_filter=None, db=db_session)
    assert alerts.total >= 1

def test_leakage_statistics_handler(db_session):
    stats = get_leakage_statistics(db=db_session)
    assert "total_alerts" in stats
    assert "active_investigations" in stats

# ========================================================
# 9. Demand Forecasting Handlers
# ========================================================
def test_demand_forecast_handler(db_session):
    fc = list_forecasts(skip=0, limit=50, zone_id=None, horizon=None, db=db_session)
    assert fc.total >= 1

    curves = get_zone_forecast_curves(zone_id="zone-north", horizon="24h")
    assert "forecast_trajectory" in curves

def test_demand_evaluation_curves_handler():
    eval_rep = get_demand_evaluation(zone_id="zone-north")
    assert "models" in eval_rep

def test_demand_zones_comparison_handler():
    comp = get_zones_comparison(horizon="24h")
    assert isinstance(comp, (list, dict))

# ========================================================
# 10. Water Availability & Shortage Handlers
# ========================================================
def test_shortage_predictions_handler(db_session):
    res = list_shortage_predictions(skip=0, limit=50, zone_id=None, db=db_session)
    assert res.total >= 1

def test_shortage_overview_and_reservoirs():
    overview = get_shortage_overview()
    assert isinstance(overview, list)
    assert len(overview) >= 4

    res_dict = get_reservoir_overview()
    assert "reservoirs" in res_dict

def test_shortage_timeline_handler():
    timeline = get_shortage_timeline()
    assert isinstance(timeline, list)

# ========================================================
# 11. Sensor Fusion Handlers
# ========================================================
def test_fusion_status_handler():
    health = get_unified_network_health()
    assert "unified_health_score" in health

    rel = get_sensor_reliability_metrics()
    assert isinstance(rel, list)
    assert len(rel) == 17

def test_fusion_evaluate_handler():
    payload = MultiSensorFusionProcessRequest(
        zone_id="ZONE_1",
        flow_rate=218.0,
        flow_baseline=165.0,
        pressure=4.65,
        pressure_baseline=4.80,
        consumption=182.0,
        consumption_baseline=140.0
    )
    eval_res = process_sensor_fusion(payload=payload)
    assert eval_res["is_fused_leak_suspicion"] is False
    assert eval_res["fused_classification"] == "AUTHORIZED_DEMAND_SURGE"

# ========================================================
# 12. Simulation Scenarios Handlers
# ========================================================
def test_simulation_scenarios_list_handler(db_session):
    res = list_simulation_scenarios(db=db_session)
    assert len(res) >= 1

def test_simulation_status_handler():
    status_info = get_simulation_status()
    assert status_info.is_running is True

# ========================================================
# 13. IWA Analytics & Compliance Handlers
# ========================================================
def test_analytics_water_balance_handler(db_session):
    wb = get_water_balance(db=db_session)
    assert "system_input_volume_m3" in wb
    assert "water_losses" in wb

def test_compliance_reporting_handler(db_session):
    comp = get_compliance_report(db=db_session)
    assert "compliance_summary" in comp
    assert "per_capita_supply_lpcd" in comp["compliance_summary"]

# ========================================================
# 14. Real-time Telemetry Handlers
# ========================================================
def test_realtime_status_handler():
    stats = get_ws_statistics()
    assert "active_clients" in stats

def test_realtime_activity_feed_handler():
    feed = get_activity_feed(limit=5)
    assert isinstance(feed, list)
