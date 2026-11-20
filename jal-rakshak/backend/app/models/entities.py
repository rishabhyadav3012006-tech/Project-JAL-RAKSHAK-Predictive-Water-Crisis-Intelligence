"""SQLAlchemy ORM Entities for JAL-RAKSHAK Database.
Implements the 11 core tables for complete smart water grid telemetry:
1. Users
2. Zones
3. Network Components
4. Sensors
5. Sensor Readings
6. Anomaly Events
7. Leakage Alerts
8. Demand Forecasts
9. Shortage Predictions
10. Simulation Scenarios
11. Alert History
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Index,
    func
)
from sqlalchemy.orm import relationship
from app.database.session import Base

# 1. Users Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(32), default="operator", nullable=False)  # admin, engineer, operator, viewer
    department = Column(String(64), default="Municipal Water Works")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

# 2. Zones Table
class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_id = Column(String(32), unique=True, index=True, nullable=False)  # e.g., 'ZONE_1', 'zone-north'
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    area_km2 = Column(Float, default=12.5)
    population_served = Column(Integer, default=50000)
    target_pressure_bar = Column(Float, default=4.5)
    baseline_flow_m3h = Column(Float, default=165.0)
    current_flow_m3h = Column(Float, default=165.0)
    current_pressure_bar = Column(Float, default=4.5)
    status = Column(String(32), default="NORMAL", nullable=False)  # NORMAL, LOW_PRESSURE, SHORTAGE_RISK, LEAK_SUSPECTED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    components = relationship("NetworkComponent", back_populates="zone", cascade="all, delete-orphan")
    sensors = relationship("Sensor", back_populates="zone", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyEvent", back_populates="zone", cascade="all, delete-orphan")
    leakage_alerts = relationship("LeakageAlert", back_populates="zone", cascade="all, delete-orphan")
    demand_forecasts = relationship("DemandForecast", back_populates="zone", cascade="all, delete-orphan")
    shortage_predictions = relationship("ShortagePrediction", back_populates="zone", cascade="all, delete-orphan")

# 3. Network Components Table
class NetworkComponent(Base):
    __tablename__ = "network_components"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    component_id = Column(String(32), unique=True, index=True, nullable=False)  # e.g., 'RES-01', 'PUMP-01'
    name = Column(String(100), nullable=False)
    component_type = Column(String(32), nullable=False)  # reservoir, treatment_plant, pump_station, pipeline, tank, zone
    zone_id = Column(String(32), ForeignKey("zones.zone_id", ondelete="SET NULL"), nullable=True)
    capacity_m3 = Column(Float, default=0.0)
    current_level_pct = Column(Float, default=100.0)
    pressure_bar = Column(Float, default=4.5)
    flow_rate_m3h = Column(Float, default=0.0)
    status = Column(String(32), default="OPERATIONAL", nullable=False)  # OPERATIONAL, DEGRADED, LEAK_SUSPECTED, CRITICAL
    coordinates_json = Column(JSON, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    zone = relationship("Zone", back_populates="components")
    sensors = relationship("Sensor", back_populates="component")

# 4. Sensors Table
class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sensor_id = Column(String(32), unique=True, index=True, nullable=False)  # e.g., 'FLOW-Z1-001'
    zone_id = Column(String(32), ForeignKey("zones.zone_id", ondelete="CASCADE"), nullable=False)
    component_id = Column(String(32), ForeignKey("network_components.component_id", ondelete="SET NULL"), nullable=True)
    sensor_type = Column(String(32), nullable=False)  # flow, pressure, tank, meter, pump
    unit = Column(String(16), nullable=False)  # m3/h, bar, %, rpm
    installation_date = Column(DateTime, nullable=True)
    uptime_pct = Column(Float, default=99.0)
    packet_loss_pct = Column(Float, default=1.5)
    calibration_drift_pct = Column(Float, default=1.0)
    snr_db = Column(Float, default=38.0)
    reliability_score = Column(Float, default=0.95)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    zone = relationship("Zone", back_populates="sensors")
    component = relationship("NetworkComponent", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyEvent", back_populates="sensor")

# 5. Sensor Readings Table (High frequency time series)
class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sensor_id = Column(String(32), ForeignKey("sensors.sensor_id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(16), nullable=False)
    is_valid = Column(Boolean, default=True, nullable=False)
    raw_metadata_json = Column(JSON, nullable=True)

    # Relationship
    sensor = relationship("Sensor", back_populates="readings")

    __table_args__ = (
        Index("idx_sensor_time", "sensor_id", "timestamp"),
    )

# 6. Anomaly Events Table
class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(40), unique=True, index=True, nullable=False)
    zone_id = Column(String(32), ForeignKey("zones.zone_id", ondelete="CASCADE"), nullable=False, index=True)
    sensor_id = Column(String(32), ForeignKey("sensors.sensor_id", ondelete="SET NULL"), nullable=True)
    detection_timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    anomaly_score = Column(Float, nullable=False)
    severity = Column(String(16), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    archetype = Column(String(64), nullable=False)  # unexpected_high_flow, sudden_pressure_deviation, etc.
    explanation = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False, nullable=False)
    resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    zone = relationship("Zone", back_populates="anomalies")
    sensor = relationship("Sensor", back_populates="anomalies")

# 7. Leakage Alerts Table
class LeakageAlert(Base):
    __tablename__ = "leakage_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_id = Column(String(40), unique=True, index=True, nullable=False)
    zone_id = Column(String(32), ForeignKey("zones.zone_id", ondelete="CASCADE"), nullable=False, index=True)
    pipeline_id = Column(String(64), nullable=True)
    suspicion_score = Column(Float, nullable=False)
    severity = Column(String(16), default="Medium", nullable=False)  # Low, Medium, High, Critical
    status = Column(String(32), default="UNACKNOWLEDGED", nullable=False)  # UNACKNOWLEDGED, INVESTIGATING, CONFIRMED_LEAK, FALSE_ALARM, RESOLVED
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    supporting_sensors_json = Column(JSON, nullable=True)
    explanation = Column(Text, nullable=False)
    assigned_crew = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    zone = relationship("Zone", back_populates="leakage_alerts")
    history = relationship("AlertHistory", back_populates="alert", cascade="all, delete-orphan")

# 8. Demand Forecasts Table
class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_id = Column(String(32), ForeignKey("zones.zone_id", ondelete="CASCADE"), nullable=False, index=True)
    forecast_horizon = Column(String(16), nullable=False)  # 1h, 6h, 24h, 7d
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    target_timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    predicted_demand_m3h = Column(Float, nullable=False)
    confidence_lower_m3h = Column(Float, nullable=False)
    confidence_upper_m3h = Column(Float, nullable=False)
    weather_condition = Column(String(32), default="Clear")
    is_peak_hour = Column(Boolean, default=False)

    # Relationship
    zone = relationship("Zone", back_populates="demand_forecasts")

# 9. Shortage Predictions Table
class ShortagePrediction(Base):
    __tablename__ = "shortage_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_id = Column(String(32), ForeignKey("zones.zone_id", ondelete="CASCADE"), nullable=False, index=True)
    calculated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    current_storage_m3 = Column(Float, nullable=False)
    projected_deficit_m3h = Column(Float, nullable=False)
    reserve_hours = Column(Float, nullable=False)
    risk_category = Column(String(24), nullable=False)  # Normal, Low Risk, Moderate Risk, High Risk, Critical
    risk_score = Column(Float, nullable=False)
    recommended_action = Column(Text, nullable=False)

    # Relationship
    zone = relationship("Zone", back_populates="shortage_predictions")

# 10. Simulation Scenarios Table
class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scenario_key = Column(String(32), unique=True, index=True, nullable=False)  # NORMAL, PEAK_DEMAND, PIPE_BURST, PUMP_TRIP
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    parameters_json = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

# 11. Alert History Table (Audit Trail)
class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_id = Column(String(40), ForeignKey("leakage_alerts.alert_id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    previous_status = Column(String(32), nullable=True)
    new_status = Column(String(32), nullable=False)
    updated_by = Column(String(100), default="Control Centre Operator")
    notes = Column(Text, nullable=True)

    # Relationship
    alert = relationship("LeakageAlert", back_populates="history")
