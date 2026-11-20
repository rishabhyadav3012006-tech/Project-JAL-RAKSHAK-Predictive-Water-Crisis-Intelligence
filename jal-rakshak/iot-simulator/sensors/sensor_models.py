from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

class SensorReading(BaseModel):
    sensor_id: str
    zone_id: str
    sensor_type: str  # flow, pressure, tank_level, consumption, pump_status
    timestamp: str
    measurement_value: float
    unit: str
    operational_status: str  # online, warning, critical, offline, disconnected
    battery_percent: int = 95
    signal_rssi_dbm: int = -68
    anomaly_flags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class HistoricalPoint(BaseModel):
    timestamp: str
    value: float
    status: str

class SensorWithHistory(BaseModel):
    sensor_id: str
    zone_id: str
    sensor_type: str
    sensor_name: str
    timestamp: str
    measurement_value: float
    unit: str
    operational_status: str
    battery_percent: int
    signal_rssi_dbm: int
    anomaly_flags: List[str]
    metadata: Dict[str, Any]
    history: List[HistoricalPoint] = Field(default_factory=list)

class SimulatorStatus(BaseModel):
    is_running: bool
    active_scenario: str
    tick_rate_seconds: float
    total_readings_generated: int
    mqtt_connected: bool
    fallback_mode: bool
    last_tick_timestamp: Optional[str] = None
