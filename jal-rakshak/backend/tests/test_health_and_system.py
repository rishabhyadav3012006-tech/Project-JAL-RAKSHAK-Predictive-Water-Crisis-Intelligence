"""Tests for system health check, status ping, and database connectivity."""
from app.api.routers.system import health_check, status_check
from app.core.config import settings

def test_system_health(db_session):
    res = health_check(db=db_session)
    assert res.status == "healthy"
    assert res.service == settings.PROJECT_NAME
    assert res.details["database"] == "connected"
    assert "Isolation Forest" in res.details["ai_engine"]
    assert "17 sensors" in res.details["iot_simulator"]

def test_system_status():
    res = status_check()
    assert res["status"] == "online"
    assert res["service"] == settings.PROJECT_NAME
    assert "timestamp" in res
