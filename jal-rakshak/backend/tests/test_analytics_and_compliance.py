"""Tests for IWA Water Balance analytics, Minimum Night Flow (MNF), and MoHUA compliance reporting."""
from app.api.routers.analytics import (
    get_water_balance,
    get_compliance_report,
    get_service_level_benchmarks,
    get_minimum_night_flow,
)

def test_iwa_water_balance(db_session):
    wb = get_water_balance(db=db_session)
    assert wb.system_input_volume_m3 == 124500.0
    assert wb.authorized_consumption.billed_authorized_m3 > 0.0
    assert wb.water_losses.real_physical_losses_m3 > 0.0
    assert wb.non_revenue_water.percentage == 29.2
    assert wb.non_revenue_water.target_benchmark_pct == 15.0

def test_compliance_reporting_and_135_lpcd(db_session):
    comp = get_compliance_report(db=db_session)
    assert comp.compliance_summary.per_capita_supply_lpcd >= 135.0
    assert len(comp.zonal_audits) > 0
    # Verify zone-level MoHUA 135 LPCD benchmark compliance
    for z in comp.zonal_audits:
        assert z.standard_lpcd == 135.0
        assert z.per_capita_lpcd > 0.0
        assert z.compliance_status in ["SURPLUS", "COMPLIANT", "DEFICIT"]

def test_service_level_benchmarks():
    slb = get_service_level_benchmarks()
    assert len(slb.benchmarks) == 5
    benchmark_names = [b.benchmark_name for b in slb.benchmarks]
    assert any("Per Capita Water Supply" in name for name in benchmark_names)
    assert any("Non-Revenue Water" in name for name in benchmark_names)
    assert slb.overall_slb_score_pct > 80.0

def test_minimum_night_flow_analysis():
    mnf = get_minimum_night_flow()
    assert mnf.total_grid_night_flow_m3h > 0.0
    assert mnf.estimated_excess_physical_leakage_m3h > 0.0
    assert len(mnf.zonal_breakdown) == 5
    # Verify Sector 9 exhibits elevated nocturnal leakage
    sector_9 = next((z for z in mnf.zonal_breakdown if "Sector 9" in z.name), None)
    assert sector_9 is not None
    assert sector_9.status == "CRITICAL_LEAK_CONFIRMED"
    assert sector_9.excess_leakage_flow_m3h > 300.0
