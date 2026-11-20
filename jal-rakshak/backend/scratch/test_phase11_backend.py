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

print("="*70)
print("PHASE 11: DATABASE & BACKEND INTEGRATION TEST SUITE")
print("="*70)

# 1. Initialize & Seed Database
print("\n[Test 1] Testing Database Table Creation and Seeding...")
init_db()
seed_database()

db = SessionLocal()

# 2. Test Record Counts in all 11 Tables
tables = [
    ("Users", User),
    ("Zones", Zone),
    ("Network Components", NetworkComponent),
    ("Sensors", Sensor),
    ("Sensor Readings", SensorReading),
    ("Anomaly Events", AnomalyEvent),
    ("Leakage Alerts", LeakageAlert),
    ("Demand Forecasts", DemandForecast),
    ("Shortage Predictions", ShortagePrediction),
    ("Simulation Scenarios", SimulationScenario),
    ("Alert History", AlertHistory),
]

for name, model in tables:
    count = db.query(model).count()
    assert count > 0, f"Table {name} has 0 records!"
    print(f"  ✓ {name:<25}: {count} records")

# 3. Test Foreign Key Relationships and Joins
print("\n[Test 2] Testing Database Relationships & Foreign Keys...")
zone3 = db.query(Zone).filter(Zone.zone_id == "ZONE_3").first()
assert zone3 is not None
print(f"  ✓ Zone '{zone3.name}' loaded successfully")
print(f"    - Connected sensors count: {len(zone3.sensors)}")
print(f"    - Leakage alerts count   : {len(zone3.leakage_alerts)}")
assert len(zone3.sensors) > 0
assert len(zone3.leakage_alerts) > 0

# Check alert history cascade relationship
alert = zone3.leakage_alerts[0]
print(f"  ✓ Alert '{alert.alert_id}' status: {alert.status}")

# 4. Test API Routers Directly
print("\n[Test 3] Testing Modular API Routers...")
from app.api.routers.system import health_check, status_check
from app.api.routers.dashboard import get_dashboard_metrics, get_dashboard_charts
from app.api.routers.users import list_users
from app.api.routers.zones import list_zones, get_zones_water_availability
from app.api.routers.network import list_components, get_digital_twin_network
from app.api.routers.sensors import list_sensors, get_live_sensors
from app.api.routers.anomalies import list_anomaly_events, get_evaluation_report
from app.api.routers.leakage import list_leakage_alerts, get_leakage_statistics, update_alert_status
from app.schemas.entities import LeakageAlertUpdate
from app.api.routers.demand import list_forecasts, get_zone_forecast_curves
from app.api.routers.shortage import get_shortage_overview, get_reservoir_overview
from app.api.routers.fusion import get_unified_network_health, get_sensor_reliability_metrics
from app.api.routers.simulation import list_simulation_scenarios, get_simulation_status
from app.api.routers.analytics import get_water_balance, get_compliance_report

# System
h = health_check(db=db)
assert h.status == "healthy"
print(f"  ✓ System Health: {h.status} (DB: {h.details['database']})")

# Dashboard
kpi = get_dashboard_metrics(db=db)
assert "total_water_supply_m3h" in kpi
print(f"  ✓ Dashboard KPI Supply: {kpi['total_water_supply_m3h']} m3/h, Leaks: {kpi['active_leak_suspicions']}")

# Users
users_page = list_users(skip=0, limit=10, role=None, db=db)
assert users_page.total >= 4
print(f"  ✓ Users Router: {users_page.total} users paginated")

# Zones & Water Availability
zones_page = list_zones(skip=0, limit=10, status_filter=None, db=db)
avail = get_zones_water_availability(db=db)
assert len(avail) >= 5
print(f"  ✓ Zones Router: {len(avail)} zones water balance audited")

# Network & Digital Twin
components_page = list_components(skip=0, limit=10, component_type=None, zone_id=None, status_filter=None, db=db)
twin = get_digital_twin_network()
nodes = twin.get("nodes") if isinstance(twin, dict) else twin.nodes
edges = twin.get("edges") if isinstance(twin, dict) else twin.edges
assert len(nodes) > 0
print(f"  ✓ Digital Twin Graph: {len(nodes)} nodes, {len(edges)} edges")

# Sensors & Live Telemetry
sensors_page = list_sensors(skip=0, limit=20, sensor_type=None, zone_id=None, is_active=None, db=db)
live_state = get_live_sensors()
assert len(live_state) == 17
print(f"  ✓ Sensors Router: {sensors_page.total} sensors in DB, {len(live_state)} live streaming")

# Anomalies
anom_page = list_anomaly_events(skip=0, limit=10, zone_id=None, severity=None, acknowledged=None, db=db)
eval_rep = get_evaluation_report()
assert "isolation_forest" in eval_rep
iso_f1 = eval_rep["isolation_forest"].get("f1_score")
print(f"  ✓ Anomalies Router: {anom_page.total} events, Model F1: {iso_f1}")

# Leakage Alert Lifecycle and Audit Logging
leak_page = list_leakage_alerts(skip=0, limit=10, zone_id=None, severity=None, status_filter=None, db=db)
stats = get_leakage_statistics(db=db)
print(f"  ✓ Leakage Intelligence: {stats['total_alerts']} alerts, {stats['active_investigations']} active investigations")

# Test status update transition + audit logging
first_alert = leak_page.items[0]
updated = update_alert_status(
    alert_id=first_alert.alert_id,
    payload=LeakageAlertUpdate(status="INVESTIGATING", assigned_crew="Field Rapid Unit 1", notes="Dispatching acoustic leak team"),
    db=db
)
assert updated.status == "INVESTIGATING"
hist_count = db.query(AlertHistory).filter(AlertHistory.alert_id == first_alert.alert_id).count()
assert hist_count > 0
print(f"  ✓ Alert Status Transition: {first_alert.alert_id} -> INVESTIGATING (Audit History Logged: {hist_count} entries)")

# Demand Forecasting
fc_page = list_forecasts(skip=0, limit=10, zone_id=None, horizon=None, db=db)
fc_curves = get_zone_forecast_curves(zone_id="zone-north", horizon="24h")
assert "forecast_points" in fc_curves or "horizon" in fc_curves
print(f"  ✓ Demand Router: {fc_page.total} forecasts, curves generated for zone-north")

# Shortage & Reservoirs
shortage = get_shortage_overview()
res_overview = get_reservoir_overview()
assert len(res_overview) > 0
print(f"  ✓ Shortage Router: {len(shortage)} zones scored, {len(res_overview)} bulk reservoirs tracked")

# Fusion
fusion = get_unified_network_health()
assert fusion["unified_health_score"] > 80.0
print(f"  ✓ Sensor Fusion Router: Composite Health {fusion['unified_health_score']}%")

# Simulation
scenarios = list_simulation_scenarios(db=db)
assert len(scenarios) >= 4
print(f"  ✓ Simulation Router: {len(scenarios)} scenarios active in database")

# Analytics
wb = get_water_balance(db=db)
comp = get_compliance_report(db=db)
assert "non_revenue_water" in wb
print(f"  ✓ Analytics Router: NRW Loss {wb['non_revenue_water']['percentage']}%, Compliance: {comp['compliance_summary']['overall_status']}")

db.close()

print("\n" + "="*70)
print(">>> ALL PHASE 11 DATABASE & BACKEND TESTS PASSED WITH 100% SUCCESS! <<<")
print("="*70)
