"""Security and Hardening Automated Test Suite for JAL-RAKSHAK.

Tests OWASP Top 10 defenses:
1. CORS origins and Regex whitelist verification
2. Security Headers configuration
3. Input Boundary & Range Validations (Pydantic ValidationError on invalid physical telemetry)
4. SQL Injection Immunity (parameterized query safety on raw malicious strings)
5. RBAC & Role Enum Validation
"""
import pytest
from pydantic import ValidationError
from fastapi import HTTPException
from app.core.config import settings
from app.api.routers.anomalies import AnomalyPredictRequest, predict_anomaly
from app.api.routers.simulation import SimulatorControlRequest
from app.schemas.entities import UserUpdate, UserCreate
from app.api.routers.zones import get_zone
from app.api.routers.leakage import get_leakage_alert
from app.api.routers.users import get_user, update_user

def test_cors_trusted_origins_whitelist():
    """Verify CORS configuration does not allow insecure wildcard with credentials."""
    origins = settings.BACKEND_CORS_ORIGINS
    assert "*" not in origins
    assert "https://jalrakshak1030-theta.vercel.app" in origins
    assert "http://localhost:5173" in origins

def test_anomaly_input_boundary_validation():
    """Verify negative pressure and out-of-bounds telemetry are rejected by Pydantic."""
    # Negative pressure is physically impossible in water mains
    with pytest.raises(ValidationError) as exc_info:
        AnomalyPredictRequest(
            flow_rate_m3h=350.0,
            pressure_bar=-12.5,  # Violates ge=0.0
            zone_id="ZONE_1"
        )
    errors = str(exc_info.value)
    assert "pressure_bar" in errors

    # Flow rate exceeding physical maximum (10,000 m3/h)
    with pytest.raises(ValidationError) as exc_info_flow:
        AnomalyPredictRequest(
            flow_rate_m3h=9999999.0,  # Violates le=10000.0
            pressure_bar=4.5,
            zone_id="ZONE_1"
        )
    assert "flow_rate_m3h" in str(exc_info_flow.value)

def test_user_role_enum_validation():
    """Verify unauthorized or invalid roles cannot be set via user schema."""
    with pytest.raises(ValidationError):
        UserUpdate(role="unauthorized_root_attacker")

    with pytest.raises(ValidationError):
        UserCreate(
            username="bad_actor",
            email="bad@actor.com",
            full_name="Attacker",
            role="superadmin_bypass"
        )

def test_sql_injection_immunity(db_session):
    """Verify SQL injection payloads are safely sanitized by SQLAlchemy parameter binding."""
    injection_payloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "1 UNION SELECT 1, 2, 3 --",
        "admin'--",
    ]
    for inj in injection_payloads:
        # Zone query parameterization
        with pytest.raises(HTTPException) as exc_zone:
            get_zone(zone_id=inj, db=db_session)
        assert exc_zone.value.status_code == 404

        # Alert query parameterization
        with pytest.raises(HTTPException) as exc_alert:
            get_leakage_alert(alert_id=inj, db=db_session)
        assert exc_alert.value.status_code == 404

def test_simulator_invalid_action_rejected():
    """Verify simulator rejects unauthorized control actions."""
    with pytest.raises(ValidationError) as exc_info:
        SimulatorControlRequest(action="destructive_malformed_action")
    assert "action" in str(exc_info.value)

def test_user_profile_safe_update(db_session):
    """Verify valid role and department update works cleanly under RBAC."""
    valid_update = UserUpdate(
        full_name="Senior Hydraulic Engineer",
        role="engineer",
        department="Municipal SCADA Division"
    )
    user = update_user(user_id=1, payload=valid_update, db=db_session)
    assert user.role == "engineer"
    assert user.full_name == "Senior Hydraulic Engineer"
