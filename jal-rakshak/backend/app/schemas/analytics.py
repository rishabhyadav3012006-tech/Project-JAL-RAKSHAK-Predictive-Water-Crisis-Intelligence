"""Pydantic schemas for Non-Revenue Water, IWA Water Balance, and Regulatory Compliance."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DictAccessibleModel(BaseModel):
    """Pydantic model supporting both attribute and dict-bracket notation for backward compatibility."""
    def __getitem__(self, item: str) -> Any:
        try:
            return getattr(self, item)
        except AttributeError as exc:
            raise KeyError(item) from exc

    def __contains__(self, item: str) -> bool:
        return hasattr(self, item)

    def get(self, item: str, default: Any = None) -> Any:
        return getattr(self, item, default)

class AuthorizedConsumptionModel(DictAccessibleModel):
    billed_authorized_m3: float = Field(..., description="Billed metered and unmetered consumption")
    unbilled_authorized_m3: float = Field(..., description="Civic and fire services")
    total_authorized_m3: float = Field(..., description="Total authorized consumption")

class WaterLossesModel(DictAccessibleModel):
    apparent_losses_m3: float = Field(..., description="Commercial losses: meter drift & billing inaccuracies")
    real_physical_losses_m3: float = Field(..., description="Physical losses: sub-surface fractures & joint leaks")
    total_water_losses_m3: float = Field(..., description="Total system water loss")

class NonRevenueWaterModel(DictAccessibleModel):
    volume_m3: float = Field(..., description="Total NRW volume in cubic meters per day")
    percentage: float = Field(..., description="NRW percentage of system input")
    target_benchmark_pct: float = Field(default=15.0, description="AMRUT 2.0 national benchmark limit")
    financial_loss_inr: float = Field(..., description="Daily financial loss in INR based on bulk tariff")

class WaterBalanceResponse(DictAccessibleModel):
    audit_period: str
    currency: str = "INR (₹)"
    system_input_volume_m3: float
    authorized_consumption: AuthorizedConsumptionModel
    water_losses: WaterLossesModel
    non_revenue_water: NonRevenueWaterModel

class ZonalAuditModel(DictAccessibleModel):
    zone_id: str
    name: str
    population: int
    daily_supply_m3: float
    per_capita_lpcd: float = Field(..., description="Actual litres per capita per day delivered")
    standard_lpcd: float = Field(default=135.0, description="MoHUA CPHEEO national urban benchmark")
    compliance_status: str = Field(..., description="SURPLUS, COMPLIANT, or DEFICIT")
    deficit_lpcd: float = Field(default=0.0, description="Deficit below 135 LPCD benchmark")
    pressure_compliance: str
    status: str

class ComplianceSummaryModel(DictAccessibleModel):
    overall_status: str
    per_capita_supply_lpcd: float
    continuity_of_supply_hours: float
    pressure_compliance_pct: float
    water_quality_index: float
    active_unresolved_ruptures: int

class ComplianceReportResponse(DictAccessibleModel):
    report_id: str
    municipality: str
    generated_at: str
    regulatory_standards: List[str]
    compliance_summary: ComplianceSummaryModel
    zonal_audits: List[ZonalAuditModel]

class ServiceLevelBenchmarkItem(DictAccessibleModel):
    benchmark_name: str
    mohua_target: float
    achieved_value: float
    unit: str
    status: str
    description: str

class ServiceLevelBenchmarksResponse(DictAccessibleModel):
    framework: str = "MoHUA / AMRUT 2.0 Urban Water Service Level Benchmarks (SLB)"
    last_evaluated: str
    overall_slb_score_pct: float
    benchmarks: List[ServiceLevelBenchmarkItem]

class MinimumNightFlowZonal(DictAccessibleModel):
    zone_id: str
    name: str
    daytime_peak_m3h: float
    night_flow_m3h: float = Field(..., description="Minimum flow between 02:00-04:00 AM")
    night_day_ratio_pct: float
    unavoidable_background_loss_m3h: float
    excess_leakage_flow_m3h: float
    leak_probability_pct: float
    status: str

class MinimumNightFlowResponse(DictAccessibleModel):
    analysis_window: str = "02:00 AM - 04:00 AM Nocturnal Minimum Window"
    methodology: str = "IWA / AWWA Minimum Night Flow (MNF) Telemetry Analysis"
    total_grid_night_flow_m3h: float
    average_daytime_flow_m3h: float
    grid_night_to_day_ratio_pct: float
    estimated_excess_physical_leakage_m3h: float
    estimated_daily_wastage_m3: float
    financial_waste_daily_inr: float
    zonal_breakdown: List[MinimumNightFlowZonal]
