"""AI Anomaly Detection and Event History Router."""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import AnomalyEvent
from app.schemas.entities import AnomalyEventOut
from app.schemas.common import PaginatedResponse, MessageResponse
from anomaly_detection.detector import anomaly_detector

router = APIRouter(prefix="/anomalies", tags=["AI Anomaly Detection"])

class AnomalyPredictRequest(BaseModel):
    flow_rate_m3h: float = Field(..., ge=0.0, le=10000.0, description="Flow rate in m3/h")
    pressure_bar: float = Field(..., ge=0.0, le=25.0, description="Pressure in bar")
    tank_level_pct: float = Field(default=80.0, ge=0.0, le=100.0, description="Tank fill percentage")
    historical_consumption_m3h: float = Field(default=320.0, ge=0.0, le=10000.0, description="Baseline expected flow")
    zone_id: str = Field(default="ZONE_1", min_length=2, max_length=32)
    prev_pressure: Optional[float] = Field(default=None, ge=0.0, le=25.0)
    prev_flow: Optional[float] = Field(default=None, ge=0.0, le=10000.0)

class AnomalyTriggerTestRequest(BaseModel):
    example_type: str = Field(..., description="unexpected_high_flow, sudden_pressure_deviation, unusual_overnight_consumption, rapid_tank_depletion, abnormal_flow_pressure_relationship")

@router.get("/events", response_model=PaginatedResponse[AnomalyEventOut], summary="List anomaly events from database")
def list_anomaly_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    zone_id: Optional[str] = Query(None, description="Filter by zone ID"),
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    acknowledged: Optional[bool] = Query(None, description="Filter by acknowledged status"),
    db: Session = Depends(get_db)
):
    query = db.query(AnomalyEvent)
    if zone_id:
        query = query.filter(AnomalyEvent.zone_id == zone_id)
    if severity:
        query = query.filter(AnomalyEvent.severity == severity)
    if acknowledged is not None:
        query = query.filter(AnomalyEvent.acknowledged == acknowledged)

    total = query.count()
    items = query.order_by(AnomalyEvent.detection_timestamp.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse(total=total, skip=skip, limit=limit, items=items)

@router.get("/events/{event_id}", response_model=AnomalyEventOut, summary="Get single anomaly event detail")
def get_anomaly_event(event_id: str, db: Session = Depends(get_db)):
    evt = db.query(AnomalyEvent).filter(AnomalyEvent.event_id == event_id).first()
    if not evt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anomaly event '{event_id}' not found")
    return evt

@router.put("/events/{event_id}/acknowledge", response_model=MessageResponse, summary="Acknowledge anomaly event")
def acknowledge_anomaly(event_id: str, db: Session = Depends(get_db)):
    evt = db.query(AnomalyEvent).filter(AnomalyEvent.event_id == event_id).first()
    if not evt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anomaly event '{event_id}' not found")
    evt.acknowledged = True
    db.commit()
    return MessageResponse(message=f"Anomaly event '{event_id}' successfully acknowledged")

@router.post("/predict", summary="Predict anomaly score on real-time sensor readings")
def predict_anomaly(req: AnomalyPredictRequest):
    """Feeds multi-dimensional readings to Isolation Forest & XGBoost models."""
    return anomaly_detector.predict_reading(
        flow=req.flow_rate_m3h,
        pressure=req.pressure_bar,
        tank_level=req.tank_level_pct,
        historical_consumption=req.historical_consumption_m3h,
        zone_id=req.zone_id,
        prev_pressure=req.prev_pressure,
        prev_flow=req.prev_flow,
    )

@router.post("/trigger-test", summary="Trigger a simulated anomaly archetype")
def trigger_anomaly_test(req: AnomalyTriggerTestRequest):
    """Executes a diagnostic anomaly test across the 5 canonical patterns."""
    return anomaly_detector.trigger_test_anomaly(req.example_type)

@router.get("/evaluation-report", summary="Get ML model evaluation metrics")
def get_evaluation_report():
    """Returns precision, recall, F1-score, and confusion matrix for the AI models."""
    return anomaly_detector.get_evaluation_report()
