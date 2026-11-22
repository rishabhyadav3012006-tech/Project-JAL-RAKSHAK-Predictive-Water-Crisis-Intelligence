"""Pydantic schemas for Demand Forecasting Engine."""
from typing import List, Dict, Any, Optional
from pydantic import Field
from app.schemas.common import DictAccessibleModel

class ForecastCurvePoint(DictAccessibleModel):
    timestamp: str
    predicted_demand_m3h: float
    lower_bound_95: float
    upper_bound_95: float
    historical_baseline_m3h: Optional[float] = None

class ZoneForecastResponse(DictAccessibleModel):
    zone_id: str
    horizon: str
    model_name: str
    generated_at: str
    r2_score: float
    forecast_points: List[Dict[str, Any]]

class DemandEvaluationReport(DictAccessibleModel):
    zone_id: str
    evaluation_window: str
    models: Dict[str, Any]
    feature_importance: Dict[str, float]

class ZoneDemandComparison(DictAccessibleModel):
    horizon: str
    zones: List[Dict[str, Any]]
