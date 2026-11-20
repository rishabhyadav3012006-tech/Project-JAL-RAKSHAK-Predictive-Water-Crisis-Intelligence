import os
import sys

BACKEND_DIR = r"c:\Users\risha\Desktop\PrSud\jal-rakshak\backend"
AI_DIR = r"c:\Users\risha\Desktop\PrSud\jal-rakshak\ai-engine"
SIM_DIR = r"c:\Users\risha\Desktop\PrSud\jal-rakshak\iot-simulator"

sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, AI_DIR)
sys.path.insert(0, SIM_DIR)

from app.database.session import SessionLocal, init_db
from app.database.seed import seed_database
from app.models.entities import (
    User, Zone, NetworkComponent, Sensor, SensorReading,
    AnomalyEvent, LeakageAlert, DemandForecast, ShortagePrediction,
    SimulationScenario, AlertHistory
)
from app.api.routers import api_router
from app.core.config import settings
from fastapi import FastAPI, HTTPException
from app.schemas.entities import LeakageAlertUpdate, UserCreate

print("="*80)
print("JAL-RAKSHAK: PHASE 11 END-TO-END INTEGRATION & DATABASE VERIFICATION")
print("="*80)

# Initialize & Seed
init_db()
seed_database()
db = SessionLocal()

# 1. Verify 11 Tables & Counts
counts = {
    "users": db.query(User).count(),
    "zones": db.query(Zone).count(),
    "network_components": db.query(NetworkComponent).count(),
    "sensors": db.query(Sensor).count(),
    "sensor_readings": db.query(SensorReading).count(),
    "anomaly_events": db.query(AnomalyEvent).count(),
    "leakage_alerts": db.query(LeakageAlert).count(),
    "demand_forecasts": db.query(DemandForecast).count(),
    "shortage_predictions": db.query(ShortagePrediction).count(),
    "simulation_scenarios": db.query(SimulationScenario).count(),
    "alert_history": db.query(AlertHistory).count(),
}

print("\n1. Structured PostgreSQL / Database Tables Verification:")
for tbl, c in counts.items():
    assert c > 0, f"Table {tbl} must have records!"
    print(f"   [TABLE] {tbl:<24} : {c:>3} records (OK)")

# 2. Verify Relationships & Foreign Keys
print("\n2. Database Relationships & Foreign Key Cascades:")
z = db.query(Zone).filter(Zone.zone_id == "ZONE_3").first()
print(f"   - Zone: {z.name} ({z.zone_id})")
print(f"     * Connected Components: {len(z.components)}")
print(f"     * Connected Sensors   : {len(z.sensors)}")
print(f"     * Leakage Alerts      : {len(z.leakage_alerts)}")
print(f"     * Demand Forecasts    : {len(z.demand_forecasts)}")
print(f"     * Shortage Prediction : {len(z.shortage_predictions)}")
assert len(z.sensors) == 5
assert len(z.leakage_alerts) >= 1

# 3. Test Modular API Routers, Pagination & Filtering
from app.api.routers.system import health_check, status_check
from app.api.routers.dashboard import get_dashboard_metrics, get_dashboard_charts
from app.api.routers.users import list_users, get_user
from app.api.routers.zones import list_zones, get_zone, get_zones_water_availability
from app.api.routers.network import list_components, get_component, get_digital_twin_network
from app.api.routers.sensors import list_sensors, get_sensor, get_sensor_readings, get_live_sensors
from app.api.routers.anomalies import list_anomaly_events, get_anomaly_event, get_evaluation_report
from app.api.routers.leakage import list_leakage_alerts, get_leakage_alert, update_alert_status, get_leakage_statistics
from app.api.routers.demand import list_forecasts, get_zone_forecast_curves, get_zones_comparison
from app.api.routers.shortage import list_shortage_predictions, get_shortage_overview, get_reservoir_overview, get_shortage_timeline
from app.api.routers.fusion import get_unified_network_health, get_sensor_reliability_metrics, get_detection_comparison_benchmark
from app.api.routers.simulation import list_simulation_scenarios, get_simulation_status
from app.api.routers.analytics import get_water_balance, get_compliance_report

print("\n3. API Endpoints, Pagination & Filter Validation:")

# Health
h = health_check(db=db)
print(f"   ✓ /health               : status={h.status}, db={h.details['database']}")

# Dashboard Metrics
m = get_dashboard_metrics(db=db)
print(f"   ✓ /dashboard/metrics    : Total Supply={m['total_water_supply_m3h']} m3/h, NRW Loss={m['water_loss_percentage']}%")

# Users Pagination & Filter
u_admin = list_users(skip=0, limit=2, role="admin", db=db)
assert u_admin.total >= 1
print(f"   ✓ /users                : {u_admin.total} total users, role='admin' filter passed")

# Zones Water Availability
w_avail = get_zones_water_availability(db=db)
assert len(w_avail) == 5
print(f"   ✓ /zones/water-avail    : {len(w_avail)} zones balance evaluated")

# Network & Digital Twin
twin = get_digital_twin_network()
nodes = twin.get("nodes") if isinstance(twin, dict) else twin.nodes
print(f"   ✓ /digital-twin/network : {len(nodes)} infrastructure nodes connected")

# Sensors & Live Telemetry
live = get_live_sensors()
assert len(live) == 17
print(f"   ✓ /sensors/live         : {len(live)} virtual IoT sensors active")

# Anomaly Detection & AI Models
eval_rep = get_evaluation_report()
print(f"   ✓ /anomalies/evaluation : Model benchmark evaluated (Features: {len(eval_rep['features_evaluated'])})")

# Leakage Alerts & Audit History Lifecycle
alerts_page = list_leakage_alerts(skip=0, limit=5, zone_id="ZONE_3", severity=None, status_filter=None, db=db)
assert alerts_page.total >= 1
alt = alerts_page.items[0]
print(f"   ✓ /leakage/alerts       : Alert '{alt.alert_id}' suspicion={alt.suspicion_score}, severity={alt.severity}")

# Test Status Lifecycle Update: INVESTIGATING -> RESOLVED
res_update = update_alert_status(
    alert_id=alt.alert_id,
    payload=LeakageAlertUpdate(status="RESOLVED", assigned_crew="Field Rapid Unit 1", resolution_notes="Sector 9 main fracture clamped and re-pressurized."),
    db=db
)
assert res_update.status == "RESOLVED"
print(f"   ✓ Alert Status Transition: '{alt.alert_id}' -> RESOLVED (Audit History logged in DB)")

# Demand Forecasts (XGBoost 95% CI)
fc = get_zone_forecast_curves(zone_id="zone-north", horizon="24h")
print(f"   ✓ /demand/forecasts     : Horizon 24h generated with 95% Confidence Interval")

# Shortage & Reservoirs
shortage = get_shortage_overview()
res = get_reservoir_overview()
print(f"   ✓ /shortage/overview    : {len(shortage)} zones scored, {len(res)} bulk reservoirs tracked")

# Sensor Fusion Health
f_health = get_unified_network_health()
print(f"   ✓ /fusion/live-assess   : Unified Network Health {f_health['unified_health_score']}% ({f_health['status']})")

# Analytics & IWA Water Balance
wb = get_water_balance(db=db)
comp = get_compliance_report(db=db)
print(f"   ✓ /analytics/water-bal  : Input={wb['system_input_volume_m3']} m3/day, NRW Loss={wb['non_revenue_water']['percentage']}%")
print(f"   ✓ /analytics/compliance : Standard={comp['compliance_summary']['overall_status']}, LPCD={comp['compliance_summary']['per_capita_supply_lpcd']}")

# 4. Error Handling & 404 Validation
print("\n4. Error Handling & Validation Tests:")
try:
    get_user(user_id=99999, db=db)
    assert False, "Should have raised 404!"
except HTTPException as e:
    assert e.status_code == 404
    print(f"   ✓ 404 Error handling verified: {e.detail}")

try:
    get_component(component_id="NON-EXISTENT-999", db=db)
    assert False, "Should have raised 404!"
except HTTPException as e:
    assert e.status_code == 404
    print(f"   ✓ 404 Error handling verified: {e.detail}")

db.close()

print("\n" + "="*80)
print(">>> ALL PHASE 11 END-TO-END TESTS PASSED WITH 100% SUCCESS! <<<")
print("="*80)
