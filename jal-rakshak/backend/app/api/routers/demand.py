"""Predictive Water Demand Forecasting Router."""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import DemandForecast
from app.schemas.entities import DemandForecastOut
from app.schemas.common import PaginatedResponse
from demand_forecasting.forecaster import water_demand_forecaster

router = APIRouter(prefix="/demand", tags=["Water Demand Forecasting"])

@router.get("/forecasts", response_model=PaginatedResponse[DemandForecastOut], summary="List stored demand forecasts")
def list_forecasts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    zone_id: Optional[str] = Query(None, description="Filter by zone ID"),
    horizon: Optional[str] = Query(None, description="Filter by horizon (1h, 6h, 24h, 7d)"),
    db: Session = Depends(get_db)
):
    query = db.query(DemandForecast)
    if zone_id:
        query = query.filter(DemandForecast.zone_id == zone_id)
    if horizon:
        query = query.filter(DemandForecast.forecast_horizon == horizon)

    total = query.count()
    items = query.order_by(DemandForecast.target_timestamp.asc()).offset(skip).limit(limit).all()
    return PaginatedResponse(total=total, skip=skip, limit=limit, items=items)

@router.get("/forecasts/{zone_id}", summary="Get multi-horizon forecast curves with 95% confidence intervals")
def get_zone_forecast_curves(
    zone_id: str = "zone-north",
    horizon: str = Query("24h", pattern="^(1h|6h|24h|7d)$")
):
    """Returns dynamic forecast curves for 1h, 6h, 24h, and 7d horizons from XGBoost engine."""
    return water_demand_forecaster.generate_forecast(zone_id=zone_id, horizon=horizon)

@router.get("/evaluation", summary="Model evaluation metrics (Baseline vs XGBoost vs LSTM)")
def get_demand_evaluation(zone_id: str = "zone-north"):
    """Returns MAE, RMSE, MAPE, and R2 evaluation report."""
    return water_demand_forecaster.get_evaluation_report(zone_id=zone_id)

@router.get("/zones-comparison", summary="Side-by-side comparative predicted demand across all zones")
def get_zones_comparison(horizon: str = "24h"):
    """Returns comparative predicted demand and net supply-demand deficits."""
    return water_demand_forecaster.get_zone_comparison(horizon=horizon)

@router.get("/factors", summary="Influencing factors (weather, elasticity, day of week)")
def get_influencing_factors(zone_id: str = "zone-north"):
    """Returns explainable AI insights detailing diurnal peaks and temperature elasticity."""
    return water_demand_forecaster.get_influencing_factors(zone_id=zone_id)
