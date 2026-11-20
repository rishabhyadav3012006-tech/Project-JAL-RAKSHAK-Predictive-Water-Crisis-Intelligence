"""Tests for IWA Water Balance analytics and regulatory compliance reporting."""
from app.api.routers.analytics import get_water_balance, get_compliance_report

def test_iwa_water_balance(db_session):
    wb = get_water_balance(db=db_session)
    assert "system_input_volume_m3" in wb
    assert "authorized_consumption" in wb
    assert "water_losses" in wb
    assert "non_revenue_water" in wb
    assert wb["non_revenue_water"]["percentage"] > 0.0

def test_compliance_reporting(db_session):
    comp = get_compliance_report(db=db_session)
    assert "compliance_summary" in comp
    assert "zonal_audits" in comp
    assert comp["compliance_summary"]["per_capita_supply_lpcd"] >= 135.0
