"""Water Shortage Risk Prediction Router."""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import ShortagePrediction
from app.schemas.entities import ShortagePredictionOut
from app.schemas.common import PaginatedResponse
from shortage_prediction.shortage_model import water_shortage_engine

router = APIRouter(prefix="/shortage", tags=["Water Shortage Risk Prediction"])

@router.get("/predictions", response_model=PaginatedResponse[ShortagePredictionOut], summary="List shortage risk predictions from database")
def list_shortage_predictions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    zone_id: Optional[str] = Query(None, description="Filter by zone ID"),
    db: Session = Depends(get_db)
):
    query = db.query(ShortagePrediction)
    if zone_id:
        query = query.filter(ShortagePrediction.zone_id == zone_id)

    total = query.count()
    items = query.order_by(ShortagePrediction.risk_score.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse(total=total, skip=skip, limit=limit, items=items)

@router.get("/overview", summary="Water availability and shortage risk overview across all zones")
def get_shortage_overview():
    """Returns city-wide availability, risk scores, demand vs supply, and emergency recommendations."""
    return water_shortage_engine.get_all_zones_shortage()

@router.get("/reservoirs", summary="Reservoir storage levels, capacities, and reserve durations")
def get_reservoir_overview():
    """Returns current storage, capacity, fill percentages, and reserve days across bulk reservoirs."""
    return water_shortage_engine.get_reservoir_overview()

@router.get("/timeline", summary="Predicted shortage depletion timeline")
def get_shortage_timeline():
    """Returns countdown timeline for zones facing storage depletion deficits."""
    return water_shortage_engine.get_predicted_shortage_timeline()

@router.get("/zone/{zone_id}", summary="Detailed zone shortage profile with transparent formula breakdown")
def get_zone_shortage(zone_id: str):
    """Returns detailed shortage profile, transparent formula breakdown, and actionable recommendations."""
    return water_shortage_engine.calculate_zone_shortage(zone_id)
