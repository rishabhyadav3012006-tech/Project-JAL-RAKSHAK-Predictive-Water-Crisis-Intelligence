"""Pydantic schemas for Command Centre Dashboard KPIs and Charts."""
from typing import List, Dict, Any, Optional
from pydantic import Field
from app.schemas.common import DictAccessibleModel

class DashboardMetricsResponse(DictAccessibleModel):
    timestamp: str
    total_water_supply_m3h: float = Field(..., description="Total bulk inflow into grid (m3/h)")
    current_consumption_m3h: float = Field(..., description="Total metered customer draw (m3/h)")
    water_loss_percentage: float = Field(..., description="Estimated Non-Revenue Water percentage")
    active_leak_suspicions: int = Field(..., description="Count of unacknowledged/investigating leaks")
    available_reservoir_capacity_pct: float = Field(..., description="Average fill percentage across bulk reservoirs")
    predicted_shortage_risk: str = Field(..., description="City-wide shortage risk tier")
    network_health_score: float = Field(..., description="Composite network integrity index (0-100)")
    network_health_status: str = Field(..., description="Qualitative health label")

class ChartDataPoint(DictAccessibleModel):
    time: str
    value: float
    secondary_value: Optional[float] = None
    label: Optional[str] = None

class DashboardChartsResponse(DictAccessibleModel):
    consumption_trend: List[Dict[str, Any]]
    supply_vs_demand: List[Dict[str, Any]]
    pressure_monitoring: List[Dict[str, Any]]
    reservoir_capacity: List[Dict[str, Any]]
    zone_distribution: List[Dict[str, Any]]
