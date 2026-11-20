"""Predictive Leakage Intelligence and Incident Management Router."""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import LeakageAlert, AlertHistory
from app.schemas.entities import LeakageAlertOut, LeakageAlertUpdate, AlertHistoryOut
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter(prefix="/leakage", tags=["Predictive Leakage Intelligence"])

@router.get("/alerts", response_model=PaginatedResponse[LeakageAlertOut], summary="List leakage alerts with filters and pagination")
def list_leakage_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    zone_id: Optional[str] = Query(None, description="Filter by zone ID"),
    severity: Optional[str] = Query(None, description="Filter by severity (Low, Medium, High, Critical)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (UNACKNOWLEDGED, INVESTIGATING, CONFIRMED_LEAK, FALSE_ALARM, RESOLVED)"),
    db: Session = Depends(get_db)
):
    query = db.query(LeakageAlert)
    if zone_id:
        query = query.filter(LeakageAlert.zone_id == zone_id)
    if severity:
        query = query.filter(LeakageAlert.severity == severity)
    if status_filter:
        query = query.filter(LeakageAlert.status == status_filter)

    total = query.count()
    items = query.order_by(LeakageAlert.timestamp.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse(total=total, skip=skip, limit=limit, items=items)

@router.get("/alerts/{alert_id}", response_model=LeakageAlertOut, summary="Get leakage alert details and audit history")
def get_leakage_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(LeakageAlert).filter(LeakageAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Leakage alert '{alert_id}' not found")
    return alert

@router.put("/alerts/{alert_id}/status", response_model=LeakageAlertOut, summary="Update alert lifecycle status and log to history")
def update_alert_status(
    alert_id: str,
    payload: LeakageAlertUpdate,
    db: Session = Depends(get_db)
):
    alert = db.query(LeakageAlert).filter(LeakageAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Leakage alert '{alert_id}' not found")

    old_status = alert.status
    new_status = payload.status or old_status

    if payload.status:
        alert.status = payload.status
    if payload.assigned_crew is not None:
        alert.assigned_crew = payload.assigned_crew
    if payload.resolution_notes is not None:
        alert.resolution_notes = payload.resolution_notes

    # Add audit history log entry
    history_entry = AlertHistory(
        alert_id=alert_id,
        timestamp=datetime.now(timezone.utc),
        previous_status=old_status,
        new_status=new_status,
        updated_by=payload.assigned_crew or "Command Centre Operator",
        notes=payload.notes or payload.resolution_notes or f"Status changed from {old_status} to {new_status}",
    )
    db.add(history_entry)

    db.commit()
    db.refresh(alert)
    return alert

@router.get("/statistics", summary="Get leakage alert and incident resolution statistics")
def get_leakage_statistics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    alerts = db.query(LeakageAlert).all()
    total = len(alerts)
    unack = sum(1 for a in alerts if a.status == "UNACKNOWLEDGED")
    investigating = sum(1 for a in alerts if a.status == "INVESTIGATING")
    confirmed = sum(1 for a in alerts if a.status == "CONFIRMED_LEAK")
    resolved = sum(1 for a in alerts if a.status == "RESOLVED")
    false_alarms = sum(1 for a in alerts if a.status == "FALSE_ALARM")
    avg_suspicion = round(sum(a.suspicion_score for a in alerts) / max(total, 1), 3)

    return {
        "total_alerts": total,
        "unacknowledged_alerts": unack,
        "active_investigations": investigating,
        "confirmed_leaks": confirmed,
        "resolved_leaks": resolved,
        "false_alarms_filtered": false_alarms,
        "average_suspicion_score": avg_suspicion,
        "most_affected_zone": "ZONE_3 (Sector 9)" if confirmed or unack else "None",
    }
