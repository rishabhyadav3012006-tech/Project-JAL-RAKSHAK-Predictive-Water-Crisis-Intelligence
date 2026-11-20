"""Tests for leakage alerts lifecycle, status transitions, and audit trail."""
from app.api.routers.leakage import list_leakage_alerts, update_alert_status, get_leakage_statistics
from app.schemas.entities import LeakageAlertUpdate
from app.models.entities import AlertHistory

def test_leakage_alerts_listing(db_session):
    res = list_leakage_alerts(skip=0, limit=10, zone_id=None, severity=None, status_filter=None, db=db_session)
    assert res.total >= 3
    assert len(res.items) > 0

def test_leakage_alert_status_transition_and_audit(db_session):
    res = list_leakage_alerts(skip=0, limit=10, zone_id=None, severity=None, status_filter=None, db=db_session)
    alert = res.items[0]
    initial_hist_count = db_session.query(AlertHistory).filter(AlertHistory.alert_id == alert.alert_id).count()

    updated = update_alert_status(
        alert_id=alert.alert_id,
        payload=LeakageAlertUpdate(
            status="INVESTIGATING",
            assigned_crew="Acoustic Survey Crew 4",
            notes="Deploying ground microphones at cross junction"
        ),
        db=db_session
    )
    assert updated.status == "INVESTIGATING"

    new_hist_count = db_session.query(AlertHistory).filter(AlertHistory.alert_id == alert.alert_id).count()
    assert new_hist_count == initial_hist_count + 1

def test_leakage_statistics(db_session):
    stats = get_leakage_statistics(db=db_session)
    assert "total_alerts" in stats
    assert "active_investigations" in stats
    assert "average_suspicion_score" in stats
