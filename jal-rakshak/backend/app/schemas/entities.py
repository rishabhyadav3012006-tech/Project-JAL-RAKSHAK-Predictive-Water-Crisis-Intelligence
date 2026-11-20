"""Pydantic validation and response schemas for all 11 database entities."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# ==========================================
# 1. User Schemas
# ==========================================
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    email: str = Field(..., min_length=5, max_length=120)
    full_name: str = Field(..., min_length=1, max_length=120)
    role: str = Field(default="operator", pattern="^(admin|engineer|operator|viewer)$")
    department: Optional[str] = "Municipal Water Works"
    is_active: bool = True

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 2. Zone Schemas
# ==========================================
class ZoneBase(BaseModel):
    zone_id: str = Field(..., min_length=2, max_length=32)
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    area_km2: float = Field(default=12.5, ge=0.1)
    population_served: int = Field(default=50000, ge=1)
    target_pressure_bar: float = Field(default=4.5, ge=1.0, le=10.0)
    baseline_flow_m3h: float = Field(default=165.0, ge=0.0)
    current_flow_m3h: float = Field(default=165.0, ge=0.0)
    current_pressure_bar: float = Field(default=4.5, ge=0.0)
    status: str = Field(default="NORMAL", pattern="^(NORMAL|LOW_PRESSURE|SHORTAGE_RISK|LEAK_SUSPECTED)$")

class ZoneCreate(ZoneBase):
    pass

class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_pressure_bar: Optional[float] = None
    baseline_flow_m3h: Optional[float] = None
    current_flow_m3h: Optional[float] = None
    current_pressure_bar: Optional[float] = None
    status: Optional[str] = None

class ZoneOut(ZoneBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 3. Network Component Schemas
# ==========================================
class NetworkComponentBase(BaseModel):
    component_id: str = Field(..., min_length=2, max_length=32)
    name: str = Field(..., min_length=2, max_length=100)
    component_type: str = Field(..., pattern="^(reservoir|treatment_plant|pump_station|pipeline|tank|zone)$")
    zone_id: Optional[str] = None
    capacity_m3: float = Field(default=0.0, ge=0.0)
    current_level_pct: float = Field(default=100.0, ge=0.0, le=100.0)
    pressure_bar: float = Field(default=4.5, ge=0.0)
    flow_rate_m3h: float = Field(default=0.0, ge=0.0)
    status: str = Field(default="OPERATIONAL", pattern="^(OPERATIONAL|DEGRADED|LEAK_SUSPECTED|CRITICAL)$")
    coordinates_json: Optional[Dict[str, Any]] = None
    metadata_json: Optional[Dict[str, Any]] = None

class NetworkComponentCreate(NetworkComponentBase):
    pass

class NetworkComponentOut(NetworkComponentBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 4. Sensor Schemas
# ==========================================
class SensorBase(BaseModel):
    sensor_id: str = Field(..., min_length=2, max_length=32)
    zone_id: str
    component_id: Optional[str] = None
    sensor_type: str = Field(..., pattern="^(flow|pressure|tank|meter|pump)$")
    unit: str = Field(..., max_length=16)
    uptime_pct: float = Field(default=99.0, ge=0.0, le=100.0)
    packet_loss_pct: float = Field(default=1.5, ge=0.0, le=100.0)
    calibration_drift_pct: float = Field(default=1.0, ge=0.0, le=100.0)
    snr_db: float = Field(default=38.0)
    reliability_score: float = Field(default=0.95, ge=0.0, le=1.0)
    is_active: bool = True

class SensorCreate(SensorBase):
    pass

class SensorOut(SensorBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 5. Sensor Reading Schemas
# ==========================================
class SensorReadingBase(BaseModel):
    sensor_id: str
    value: float
    unit: str
    is_valid: bool = True
    raw_metadata_json: Optional[Dict[str, Any]] = None

class SensorReadingCreate(SensorReadingBase):
    timestamp: Optional[datetime] = None

class SensorReadingOut(SensorReadingBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 6. Anomaly Event Schemas
# ==========================================
class AnomalyEventBase(BaseModel):
    event_id: str
    zone_id: str
    sensor_id: Optional[str] = None
    anomaly_score: float = Field(..., ge=0.0, le=1.0)
    severity: str = Field(default="MEDIUM", pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    archetype: str
    explanation: str
    acknowledged: bool = False
    resolved: bool = False

class AnomalyEventCreate(AnomalyEventBase):
    detection_timestamp: Optional[datetime] = None

class AnomalyEventOut(AnomalyEventBase):
    id: int
    detection_timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 7. Leakage Alert Schemas
# ==========================================
class LeakageAlertBase(BaseModel):
    alert_id: str
    zone_id: str
    pipeline_id: Optional[str] = None
    suspicion_score: float = Field(..., ge=0.0, le=1.0)
    severity: str = Field(default="Medium", pattern="^(Low|Medium|High|Critical)$")
    status: str = Field(default="UNACKNOWLEDGED", pattern="^(UNACKNOWLEDGED|INVESTIGATING|CONFIRMED_LEAK|FALSE_ALARM|RESOLVED)$")
    supporting_sensors_json: Optional[Dict[str, Any]] = None
    explanation: str
    assigned_crew: Optional[str] = None
    resolution_notes: Optional[str] = None

class LeakageAlertCreate(LeakageAlertBase):
    timestamp: Optional[datetime] = None

class LeakageAlertUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(UNACKNOWLEDGED|INVESTIGATING|CONFIRMED_LEAK|FALSE_ALARM|RESOLVED)$")
    assigned_crew: Optional[str] = None
    resolution_notes: Optional[str] = None
    notes: Optional[str] = None

class AlertHistoryOut(BaseModel):
    id: int
    alert_id: str
    timestamp: Optional[datetime] = None
    previous_status: Optional[str] = None
    new_status: str
    updated_by: str
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class LeakageAlertOut(LeakageAlertBase):
    id: int
    timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None
    history: Optional[List[AlertHistoryOut]] = []
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 8. Demand Forecast Schemas
# ==========================================
class DemandForecastBase(BaseModel):
    zone_id: str
    forecast_horizon: str = Field(..., pattern="^(1h|6h|24h|7d)$")
    target_timestamp: datetime
    predicted_demand_m3h: float
    confidence_lower_m3h: float
    confidence_upper_m3h: float
    weather_condition: Optional[str] = "Clear"
    is_peak_hour: Optional[bool] = False

class DemandForecastCreate(DemandForecastBase):
    generated_at: Optional[datetime] = None

class DemandForecastOut(DemandForecastBase):
    id: int
    generated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 9. Shortage Prediction Schemas
# ==========================================
class ShortagePredictionBase(BaseModel):
    zone_id: str
    current_storage_m3: float
    projected_deficit_m3h: float
    reserve_hours: float
    risk_category: str = Field(..., pattern="^(Normal|Low Risk|Moderate Risk|High Risk|Critical)$")
    risk_score: float = Field(..., ge=0.0, le=1.0)
    recommended_action: str

class ShortagePredictionCreate(ShortagePredictionBase):
    calculated_at: Optional[datetime] = None

class ShortagePredictionOut(ShortagePredictionBase):
    id: int
    calculated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# 10. Simulation Scenario Schemas
# ==========================================
class SimulationScenarioBase(BaseModel):
    scenario_key: str
    title: str
    description: str
    parameters_json: Optional[Dict[str, Any]] = None
    is_active: bool = False

class SimulationScenarioCreate(SimulationScenarioBase):
    pass

class SimulationScenarioOut(SimulationScenarioBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
