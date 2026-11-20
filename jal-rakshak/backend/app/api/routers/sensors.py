"""IoT Edge Sensors and Live Telemetry Router."""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Sensor, SensorReading
from app.schemas.entities import SensorOut, SensorReadingCreate, SensorReadingOut
from app.schemas.common import PaginatedResponse, MessageResponse
from simulation.engine import sim_engine

router = APIRouter(prefix="/sensors", tags=["IoT Sensors & Telemetry"])

@router.get("", response_model=PaginatedResponse[SensorOut], summary="List sensors with pagination and filters")
def list_sensors(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    sensor_type: Optional[str] = Query(None, description="Filter by type (flow, pressure, tank, meter, pump)"),
    zone_id: Optional[str] = Query(None, description="Filter by zone ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    query = db.query(Sensor)
    if sensor_type:
        query = query.filter(Sensor.sensor_type == sensor_type)
    if zone_id:
        query = query.filter(Sensor.zone_id == zone_id)
    if is_active is not None:
        query = query.filter(Sensor.is_active == is_active)

    total = query.count()
    items = query.order_by(Sensor.id.asc()).offset(skip).limit(limit).all()
    return PaginatedResponse(total=total, skip=skip, limit=limit, items=items)

@router.get("/live", summary="Get live readings and connectivity status for all 17 sensors")
def get_live_sensors():
    """Returns dynamic real-time telemetry readings, battery, SNR, and connectivity for Live Sensors page."""
    return sim_engine.get_all_sensors()

@router.get("/{sensor_id}", response_model=SensorOut, summary="Get sensor metadata and reliability metrics")
def get_sensor(sensor_id: str, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sensor '{sensor_id}' not found")
    return sensor

@router.get("/{sensor_id}/readings", response_model=List[SensorReadingOut], summary="Get historical time-series readings for sensor")
def get_sensor_readings(
    sensor_id: str,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sensor '{sensor_id}' not found")

    readings = db.query(SensorReading).filter(
        SensorReading.sensor_id == sensor_id
    ).order_by(SensorReading.timestamp.desc()).limit(limit).all()

    return readings

@router.post("/{sensor_id}/readings", response_model=SensorReadingOut, status_code=status.HTTP_201_CREATED, summary="Ingest new sensor reading")
def ingest_reading(
    sensor_id: str,
    payload: SensorReadingCreate,
    db: Session = Depends(get_db)
):
    sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sensor '{sensor_id}' not found")

    reading = SensorReading(
        sensor_id=sensor_id,
        timestamp=payload.timestamp or datetime.now(timezone.utc),
        value=payload.value,
        unit=payload.unit,
        is_valid=payload.is_valid,
        raw_metadata_json=payload.raw_metadata_json,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading
