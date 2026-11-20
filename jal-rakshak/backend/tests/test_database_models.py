"""Tests for all 11 database models, foreign keys, and relationships."""
from app.models.entities import (
    User, Zone, NetworkComponent, Sensor, SensorReading,
    AnomalyEvent, LeakageAlert, DemandForecast, ShortagePrediction,
    SimulationScenario, AlertHistory
)

def test_all_11_tables_seeded(db_session):
    assert db_session.query(User).count() >= 4
    assert db_session.query(Zone).count() >= 5
    assert db_session.query(NetworkComponent).count() >= 7
    assert db_session.query(Sensor).count() == 17
    assert db_session.query(SensorReading).count() >= 50
    assert db_session.query(AnomalyEvent).count() >= 3
    assert db_session.query(LeakageAlert).count() >= 3
    assert db_session.query(DemandForecast).count() >= 15
    assert db_session.query(ShortagePrediction).count() >= 5
    assert db_session.query(SimulationScenario).count() >= 4
    assert db_session.query(AlertHistory).count() >= 2

def test_zone_relationships(db_session):
    z3 = db_session.query(Zone).filter(Zone.zone_id == "ZONE_3").first()
    assert z3 is not None
    assert len(z3.sensors) == 5
    assert len(z3.leakage_alerts) >= 1
    assert len(z3.demand_forecasts) >= 3
    assert len(z3.shortage_predictions) >= 1

def test_sensor_to_readings_relationship(db_session):
    flow_sensor = db_session.query(Sensor).filter(Sensor.sensor_id == "FLOW-Z3-001").first()
    assert flow_sensor is not None
    assert len(flow_sensor.readings) > 0
    assert flow_sensor.readings[0].unit == "m3/h"

def test_alert_history_relationship(db_session):
    alert = db_session.query(LeakageAlert).filter(LeakageAlert.alert_id == "ALT-2026-002").first()
    assert alert is not None
    assert len(alert.history) >= 1
    assert alert.history[0].alert_id == "ALT-2026-002"
