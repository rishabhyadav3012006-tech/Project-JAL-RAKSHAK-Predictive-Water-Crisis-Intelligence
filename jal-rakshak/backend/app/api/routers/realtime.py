"""Real-time Activity Feed and WebSocket Health Router."""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from app.services.realtime_processor import realtime_processor
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/realtime", tags=["Real-Time Intelligence & Streaming"])

class TriggerRealtimeEventRequest(BaseModel):
    event_type: str = Field(..., description="SENSOR_READING, ANOMALY_EVENT, LEAKAGE_SUSPICION, TANK_LEVEL_CHANGE, ZONE_STATUS_CHANGE")
    title: str
    description: str
    severity: str = "NORMAL"  # NORMAL, LOW, MEDIUM, HIGH, CRITICAL
    zone_id: Optional[str] = "ZONE_3"
    sensor_id: Optional[str] = None

@router.get("/activity-feed", summary="Get recent real-time activity feed events")
def get_activity_feed(limit: int = Query(25, ge=5, le=60)) -> List[Dict[str, Any]]:
    """Returns the latest real-time events (anomalies, leaks, tank shifts, zone changes)."""
    feed = realtime_processor.get_recent_activity()
    return feed[:limit]

@router.get("/ws-stats", summary="Get WebSocket connection manager statistics")
def get_ws_statistics() -> Dict[str, Any]:
    """Returns count of active WebSocket subscribers, total messages broadcast, and last broadcast timestamp."""
    return ws_manager.get_stats()

@router.post("/trigger-event", summary="Inject an ad-hoc event into the live stream")
async def trigger_realtime_event(payload: TriggerRealtimeEventRequest):
    """Manually injects an activity event and broadcasts it immediately to all connected clients."""
    event = realtime_processor.add_activity(
        event_type=payload.event_type,
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        zone_id=payload.zone_id,
        sensor_id=payload.sensor_id,
    )
    await ws_manager.broadcast({
        "type": "USER_TRIGGERED_EVENT",
        "event": event,
    })
    return {"status": "event_broadcast", "event": event}
