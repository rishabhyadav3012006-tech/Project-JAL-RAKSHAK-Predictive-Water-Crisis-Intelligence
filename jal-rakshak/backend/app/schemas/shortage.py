"""Pydantic schemas for Water Shortage Risk and Depletion Engine."""
from typing import List, Dict, Any, Optional
from pydantic import Field
from app.schemas.common import DictAccessibleModel

class ZoneShortageSummary(DictAccessibleModel):
    zone_id: str
    name: str
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Normalized risk index 0.0 to 1.0")
    risk_tier: str
    reserve_hours_remaining: float
    population_affected: int
    deficit_mld: float
    actionable_advisory: str

class ReservoirSummary(DictAccessibleModel):
    name: str
    component_id: str
    current_storage_ml: float
    capacity_ml: float
    fill_percentage: float
    reserve_days: float
    status: str

class ShortageTimelinePoint(DictAccessibleModel):
    zone_id: str
    name: str
    projected_depletion_timestamp: str
    hours_countdown: float
    priority: str
    advisory: str
