"""Municipal Zones Management and Water Balance Router."""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Zone, Sensor, NetworkComponent
from app.schemas.entities import ZoneCreate, ZoneUpdate, ZoneOut
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter(prefix="/zones", tags=["Municipal Zones & Distribution"])

@router.get("", response_model=PaginatedResponse[ZoneOut], summary="List zones with pagination and status filter")
def list_zones(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Zone)
    if status_filter:
        query = query.filter(Zone.status == status_filter)
    total = query.count()
    items = query.order_by(Zone.id.asc()).offset(skip).limit(limit).all()
    return PaginatedResponse(total=total, skip=skip, limit=limit, items=items)

@router.get("/water-availability", summary="Zone-wise water balance and availability table")
def get_zones_water_availability(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Returns zone-wise inflow, metered consumption, leakage rate, and status."""
    zones = db.query(Zone).all()
    results = []
    for z in zones:
        loss_pct = round(max(0.0, ((z.current_flow_m3h - z.baseline_flow_m3h * 0.85) / max(z.current_flow_m3h, 1.0)) * 100.0), 1)
        results.append({
            "zone_id": z.zone_id,
            "name": z.name,
            "population": z.population_served,
            "current_flow_m3h": z.current_flow_m3h,
            "baseline_flow_m3h": z.baseline_flow_m3h,
            "pressure_bar": z.current_pressure_bar,
            "target_pressure_bar": z.target_pressure_bar,
            "loss_pct": loss_pct,
            "status": z.status,
            "alert": "AI Leak Investigation" if z.status == "LEAK_SUSPECTED" else "Normal",
        })
    return results

@router.get("/{zone_id}", summary="Get zone profile with connected sensors and components")
def get_zone(zone_id: str, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.zone_id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Zone '{zone_id}' not found")

    components = db.query(NetworkComponent).filter(NetworkComponent.zone_id == zone_id).all()
    sensors = db.query(Sensor).filter(Sensor.zone_id == zone_id).all()

    return {
        "zone": ZoneOut.model_validate(zone),
        "components_count": len(components),
        "components": [{"id": c.component_id, "name": c.name, "type": c.component_type, "status": c.status} for c in components],
        "sensors_count": len(sensors),
        "sensors": [{"id": s.sensor_id, "type": s.sensor_type, "reliability": s.reliability_score} for s in sensors],
    }

@router.post("", response_model=ZoneOut, status_code=status.HTTP_201_CREATED, summary="Create a new municipal zone")
def create_zone(payload: ZoneCreate, db: Session = Depends(get_db)):
    existing = db.query(Zone).filter(Zone.zone_id == payload.zone_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Zone '{payload.zone_id}' already exists")
    zone = Zone(**payload.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone

@router.put("/{zone_id}", response_model=ZoneOut, summary="Update zone hydraulic baseline or parameters")
def update_zone(zone_id: str, payload: ZoneUpdate, db: Session = Depends(get_db)):
    zone = db.query(Zone).filter(Zone.zone_id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Zone '{zone_id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(zone, field, value)

    db.commit()
    db.refresh(zone)
    return zone
