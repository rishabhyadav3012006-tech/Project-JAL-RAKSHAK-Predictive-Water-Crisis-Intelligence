"""Pydantic schemas for IoT Simulation Engine and Scenarios."""
from typing import List, Dict, Any, Optional
from pydantic import Field
from app.schemas.common import DictAccessibleModel

class SimulatorControlRequest(DictAccessibleModel):
    action: str = Field(..., pattern="^(start|pause|reset)$", description="start, pause, or reset")
    scenario: Optional[str] = None

class SimulationStatusResponse(DictAccessibleModel):
    is_running: bool
    current_scenario: str
    tick_count: int
    mqtt_broker_status: str
    active_injections: List[str]
    last_tick_timestamp: Optional[str] = None
