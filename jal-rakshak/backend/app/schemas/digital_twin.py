from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class NetworkNode(BaseModel):
    id: str
    label: str
    type: str  # reservoir, treatment, pump, tank, residential, industrial, agricultural, sensor_pressure, sensor_flow
    zone: str
    pressure_bar: float
    flow_mld: float
    capacity_ml: Optional[float] = None
    level_percent: Optional[float] = None
    status: str  # normal, warning, critical, standby
    has_leak: bool = False
    is_low_pressure: bool = False
    elevation_m: float
    details: Dict[str, Any] = Field(default_factory=dict)
    position: Dict[str, float]

class NetworkEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    flow_mld: float
    pressure_bar: float
    diameter_mm: int
    length_km: float
    status: str  # normal, leak, high_friction
    animated: bool = True

class DigitalTwinNetworkResponse(BaseModel):
    system_name: str
    simulation_engine: str
    disclaimer: str
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
    overall_health: int
    active_leaks_count: int

class SimulationActionRequest(BaseModel):
    component_id: str
    action: str  # valve_shutoff, pressure_boost, inject_leak, repair_leak, reset
