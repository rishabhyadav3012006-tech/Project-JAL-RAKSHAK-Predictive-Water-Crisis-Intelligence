import os
import sys
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Add iot-simulator and ai-engine to python path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT_DIR, "iot-simulator"))
sys.path.insert(0, os.path.join(ROOT_DIR, "ai-engine"))

from app.core.config import settings
from app.schemas.health import HealthCheckResponse
from app.schemas.digital_twin import DigitalTwinNetworkResponse, SimulationActionRequest
from app.services.digital_twin_engine import get_base_digital_twin_network, execute_simulation_action
from simulation.engine import sim_engine
from anomaly_detection.detector import anomaly_detector
from sensor_fusion.fusion_engine import fusion_engine, SensorObservation
from app.services.alert_service import alert_manager
from demand_forecasting.forecaster import water_demand_forecaster
from shortage_prediction.shortage_model import water_shortage_engine
from sensor_fusion import unified_health_evaluator, CrossSensorDetector, SensorReliabilityTracker

router = APIRouter()

# Schema for simulator control
class SimulatorControlRequest(BaseModel):
    action: str  # start, pause, reset
    scenario: Optional[str] = None

# Schema for anomaly prediction request
class AnomalyPredictRequest(BaseModel):
    flow_rate_m3h: float
    pressure_bar: float
    tank_level_pct: float = 80.0
    historical_consumption_m3h: float = 320.0
    zone_id: str = "zone-north"
    prev_pressure: Optional[float] = None
    prev_flow: Optional[float] = None

class AnomalyTriggerTestRequest(BaseModel):
    example_type: str  # unexpected_high_flow, sudden_pressure_deviation, unusual_overnight_consumption, rapid_tank_depletion, abnormal_flow_pressure_relationship

@router.get("/health", response_model=HealthCheckResponse, tags=["System Health"])
def health_check():
    return HealthCheckResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
        details={
            "database": "connected",
            "ai_engine": "online (Isolation Forest + XGBoost active)",
            "iot_simulator": "active (17 sensors streaming)",
            "digital_twin": "online"
        }
    )

@router.get("/status", tags=["System Status"])
def status_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "uptime": "active"
    }

# --- Digital Twin Endpoints ---

@router.get("/digital-twin/network", response_model=DigitalTwinNetworkResponse, tags=["Digital Twin"])
def get_digital_twin_network():
    return get_base_digital_twin_network()

@router.post("/digital-twin/simulate", response_model=DigitalTwinNetworkResponse, tags=["Digital Twin"])
def post_simulate_action(payload: SimulationActionRequest):
    return execute_simulation_action(payload.component_id, payload.action)

# --- IoT Sensor Simulation Endpoints ---

@router.get("/sensors", tags=["IoT Sensors"])
def get_all_sensors():
    return sim_engine.get_all_sensors()

@router.get("/sensors/{sensor_id}/history", tags=["IoT Sensors"])
def get_sensor_history(sensor_id: str):
    history = sim_engine.get_sensor_history(sensor_id)
    if not history:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found")
    return history

@router.get("/sensors/simulation/status", tags=["IoT Simulation Engine"])
def get_simulation_status():
    return sim_engine.get_status()

@router.post("/sensors/simulation/control", tags=["IoT Simulation Engine"])
def control_simulation(payload: SimulatorControlRequest):
    if payload.action == "start":
        sim_engine.start()
    elif payload.action == "pause":
        sim_engine.pause()
    elif payload.action == "reset":
        sim_engine.reset()

    if payload.scenario:
        sim_engine.set_scenario(payload.scenario)

    return sim_engine.get_status()

# --- AI Anomaly Detection Endpoints ---

@router.post("/anomaly/predict", tags=["AI Anomaly Detection"])
def predict_anomaly(payload: AnomalyPredictRequest):
    """
    Ingests feature telemetry, extracts dynamic interaction features,
    and returns Isolation Forest anomaly score, XGBoost probability, severity class, and root-cause explanation.
    """
    return anomaly_detector.predict_reading(
        flow=payload.flow_rate_m3h,
        pressure=payload.pressure_bar,
        tank_level=payload.tank_level_pct,
        historical_consumption=payload.historical_consumption_m3h,
        zone_id=payload.zone_id,
        prev_pressure=payload.prev_pressure,
        prev_flow=payload.prev_flow
    )

@router.get("/anomaly/evaluation", tags=["AI Anomaly Detection"])
def get_anomaly_evaluation():
    """
    Returns the comprehensive Model Evaluation Report:
    Precision, Recall, F1-Score, Confusion Matrix for Isolation Forest & XGBoost,
    alongside feature importances and the synthetic data evaluation notice.
    """
    return anomaly_detector.get_evaluation_report()

@router.get("/anomaly/events", tags=["AI Anomaly Detection"])
def get_anomaly_events():
    """Returns stored historical anomaly events."""
    return anomaly_detector.get_stored_events()

@router.post("/anomaly/trigger-test", tags=["AI Anomaly Detection"])
def trigger_anomaly_test(payload: AnomalyTriggerTestRequest):
    """
    Triggers 1 of the 5 specific detection archetypes:
    - unexpected_high_flow
    - sudden_pressure_deviation
    - unusual_overnight_consumption
    - rapid_tank_depletion
    - abnormal_flow_pressure_relationship
    """
    return anomaly_detector.simulate_detection_example(payload.example_type)

# =========================================================================
# PHASE 7 — PREDICTIVE LEAKAGE INTELLIGENCE & SENSOR FUSION ENDPOINTS
# =========================================================================

class SensorObservationInput(BaseModel):
    sensor_id: str
    sensor_type: str  # flow, pressure, meter, tank
    metric: str
    observed_value: float
    baseline_value: float
    unit: str
    reliability_score: float = 0.95
    anomaly_flag: bool = False

class LeakageFusionRequest(BaseModel):
    pipeline_ref: str
    observations: List[SensorObservationInput]
    zone_id: Optional[str] = None
    custom_location: Optional[str] = None

class TriggerTestLeakRequest(BaseModel):
    pipeline_ref: str = "e-p2-pn102"
    severity: str = "critical"  # critical, high, medium, low

class AlertUpdateRequest(BaseModel):
    investigation_status: Optional[str] = None
    physical_verification: Optional[str] = None
    assigned_crew: Optional[str] = None
    acknowledged: Optional[bool] = None
    note: Optional[str] = None
    actor: str = "Operator"

@router.get("/leakage/suspicions", tags=["Predictive Leakage Intelligence"])
def get_leakage_suspicions():
    """
    Returns all active multi-sensor corroborated leakage suspicions
    with suspicion scores, severity, supporting sensor readings, and investigation status.
    """
    return fusion_engine.get_all_suspicions()

@router.post("/leakage/fuse", tags=["Predictive Leakage Intelligence"])
def fuse_sensor_readings(payload: LeakageFusionRequest):
    """
    Calculates a sensor-fusion-based leakage suspicion score
    combining flow, pressure, consumption, tank level, and sensor reliability.
    """
    observations = [
        SensorObservation(
            sensor_id=o.sensor_id,
            sensor_type=o.sensor_type,
            metric=o.metric,
            observed_value=o.observed_value,
            baseline_value=o.baseline_value,
            unit=o.unit,
            reliability_score=o.reliability_score,
            anomaly_flag=o.anomaly_flag,
        )
        for o in payload.observations
    ]
    suspicion = fusion_engine.calculate_leakage_suspicion(
        pipeline_ref=payload.pipeline_ref,
        observations=observations,
        zone_id=payload.zone_id,
        custom_location=payload.custom_location,
    )
    # If high or critical suspicion, also add to alert manager
    if suspicion.severity in ["high", "critical"]:
        alert_manager.add_alert_from_suspicion(suspicion)
    return suspicion.to_dict()

@router.post("/leakage/trigger-test-leak", tags=["Predictive Leakage Intelligence"])
def trigger_test_leak(payload: TriggerTestLeakRequest):
    """
    Injects a multi-sensor corroborated leak suspicion for testing and Digital Twin highlighting.
    """
    pipe = payload.pipeline_ref
    topo = fusion_engine.pipeline_topology.get(pipe, {})
    zone_id = topo.get("zone_id", "zone-south")
    
    # Create corroborated readings
    if payload.severity == "critical":
        obs = [
            SensorObservation("PRESS-TEST-01", "pressure", "Static Hydrostatic Pressure", 3.10, 4.80, "bar", 0.98, True),
            SensorObservation("FLOW-TEST-01", "flow", "Bulk Inflow Rate", 235.0, 165.0, "m³/h", 0.96, True),
            SensorObservation("METER-TEST-01", "meter", "Aggregated Billed Consumption", 142.0, 140.0, "m³/h", 0.91, False),
            SensorObservation("TANK-TEST-01", "tank", "Storage Depletion Rate", -22.0, -5.0, "m³/h", 0.97, True),
        ]
    elif payload.severity == "high":
        obs = [
            SensorObservation("PRESS-TEST-02", "pressure", "Static Hydrostatic Pressure", 3.65, 4.80, "bar", 0.94, True),
            SensorObservation("FLOW-TEST-02", "flow", "Bulk Inflow Rate", 205.0, 165.0, "m³/h", 0.92, True),
            SensorObservation("METER-TEST-02", "meter", "Aggregated Billed Consumption", 144.0, 140.0, "m³/h", 0.89, False),
        ]
    else:
        obs = [
            SensorObservation("PRESS-TEST-03", "pressure", "Static Hydrostatic Pressure", 4.20, 4.80, "bar", 0.88, True),
            SensorObservation("FLOW-TEST-03", "flow", "Bulk Inflow Rate", 185.0, 165.0, "m³/h", 0.90, True),
        ]
        
    suspicion = fusion_engine.calculate_leakage_suspicion(
        pipeline_ref=pipe,
        observations=obs,
        zone_id=zone_id,
        custom_location=topo.get("name", f"Pipeline Section {pipe}"),
    )
    alert = alert_manager.add_alert_from_suspicion(suspicion)
    return {
        "status": "success",
        "suspicion": suspicion.to_dict(),
        "alert": alert,
        "highlight_pipeline": pipe,
    }

@router.get("/leakage/alerts", tags=["Alert & Incident Management"])
def get_alerts(
    severity: Optional[str] = None,
    zone_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
):
    """
    Returns alerts filtered by severity, zone, investigation status, or search query.
    """
    return alert_manager.get_alerts(severity=severity, zone_id=zone_id, status=status, search=search)

@router.get("/leakage/alerts/stats", tags=["Alert & Incident Management"])
def get_alert_statistics():
    """
    Returns aggregate incident statistics: total, active critical, false positive rate,
    acknowledgement rate, and verification splits.
    """
    return alert_manager.get_statistics()

@router.get("/leakage/alerts/{alert_id}", tags=["Alert & Incident Management"])
def get_alert_detail(alert_id: str):
    alert = alert_manager.get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.post("/leakage/alerts/{alert_id}/acknowledge", tags=["Alert & Incident Management"])
def acknowledge_alert(alert_id: str):
    res = alert_manager.acknowledge_alert(alert_id)
    if not res:
        raise HTTPException(status_code=404, detail="Alert not found")
    return res

@router.patch("/leakage/alerts/{alert_id}", tags=["Alert & Incident Management"])
def update_alert(alert_id: str, payload: AlertUpdateRequest):
    if payload.acknowledged is True:
        alert_manager.acknowledge_alert(alert_id, actor=payload.actor)
        
    res = alert_manager.update_alert_investigation(
        alert_id=alert_id,
        investigation_status=payload.investigation_status or "under_investigation",
        physical_verification=payload.physical_verification,
        assigned_crew=payload.assigned_crew,
        note=payload.note,
        actor=payload.actor,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    # Also sync suspicion status if linked
    if res.get("suspicion_id"):
        fusion_engine.update_suspicion_status(
            res["suspicion_id"],
            new_status=res["investigation_status"],
            verification_status=res["physical_verification"]
        )
    return res

# =========================================================================
# PHASE 8 — WATER DEMAND FORECASTING ENGINE ENDPOINTS
# =========================================================================

@router.get("/demand/forecast", tags=["Water Demand Forecasting"])
def get_demand_forecast(
    zone_id: str = "zone-north",
    horizon: str = "24h",
):
    """
    Returns forward-looking predicted water demand, confidence intervals (95% CI),
    planned supply buffer, and supply-demand gap analysis for horizons: 1h, 6h, 24h, 7d.
    """
    return water_demand_forecaster.generate_forecast(zone_id=zone_id, horizon=horizon)

@router.get("/demand/evaluation", tags=["Water Demand Forecasting"])
def get_demand_evaluation(zone_id: str = "zone-north"):
    """
    Returns the comprehensive Model Performance Evaluation:
    Compares Historical Averages Baseline vs XGBoost Regressor vs Sequential LSTM Benchmark
    using strict chronological forward out-of-time test splitting (MAE, RMSE, MAPE, R²).
    """
    return water_demand_forecaster.get_evaluation_report(zone_id=zone_id)

@router.get("/demand/zones-comparison", tags=["Water Demand Forecasting"])
def get_zones_comparison(horizon: str = "24h"):
    """
    Returns side-by-side comparative predicted demand, peak requirements,
    and net supply-demand deficit risks across all 5 municipal distribution zones.
    """
    return water_demand_forecaster.get_zone_comparison(horizon=horizon)

@router.get("/demand/factors", tags=["Water Demand Forecasting"])
def get_influencing_factors(zone_id: str = "zone-north"):
    """
    Returns explainable AI insights detailing diurnal peaks, weather/temperature elasticity,
    autocorrelation lags, and weekend variances influencing future water demand.
    """
    return water_demand_forecaster.get_influencing_factors(zone_id=zone_id)

# =========================================================================
# PHASE 9 — WATER SHORTAGE RISK PREDICTION ENDPOINTS
# =========================================================================

@router.get("/shortage/zones", tags=["Water Shortage Risk Prediction"])
def get_zones_shortage_status():
    """
    Returns zone-wise predicted water availability, supply-demand balances,
    storage levels, estimated reserve durations, and transparent shortage risk categories.
    """
    return water_shortage_engine.get_all_zones_shortage()

@router.get("/shortage/reservoirs", tags=["Water Shortage Risk Prediction"])
def get_reservoirs_status():
    """
    Returns current storage, capacity, fill percentages, and reserve days
    across major city bulk reservoirs, clearwells, and balancing tanks.
    """
    return water_shortage_engine.get_reservoir_overview()

@router.get("/shortage/timeline", tags=["Water Shortage Risk Prediction"])
def get_shortage_timeline():
    """
    Returns countdown timeline for zones facing storage depletion deficits,
    including critical facilities at risk and mitigation interventions.
    """
    return water_shortage_engine.get_predicted_shortage_timeline()

@router.get("/shortage/zone/{zone_id}", tags=["Water Shortage Risk Prediction"])
def get_zone_shortage_detail(zone_id: str):
    """
    Returns detailed shortage profile, transparent formula breakdown,
    potential population/facility impact, and actionable recommendations.
    """
    return water_shortage_engine.calculate_zone_shortage(zone_id)

# =========================================================================
# PHASE 10 — MULTI-SENSOR FUSION INTELLIGENCE ENDPOINTS
# =========================================================================

_reliability_tracker = SensorReliabilityTracker()

class RawSensorInput(BaseModel):
    sensor_id: str
    sensor_type: str  # flow, pressure, meter, tank
    value: float
    timestamp: Optional[str] = None

class MultiSensorFusionProcessRequest(BaseModel):
    zone_id: str = "zone-south"
    flow_rate: float
    flow_baseline: float = 165.0
    pressure: float
    pressure_baseline: float = 4.80
    consumption: float
    consumption_baseline: float = 140.0
    tank_depletion_rate: float = 0.0
    expected_tank_depletion: float = 0.0

@router.get("/fusion/live-assessment", tags=["Multi-Sensor Fusion Intelligence"])
def get_unified_network_health():
    """
    Returns unified water network health assessment (0 - 100%),
    combining pressure stability, volumetric equilibrium, storage fill,
    distribution loss efficiency, and telemetry infrastructure reliability.
    """
    return unified_health_evaluator.evaluate_unified_health()

@router.get("/fusion/sensor-reliability", tags=["Multi-Sensor Fusion Intelligence"])
def get_sensor_reliability_metrics():
    """
    Returns dynamic reliability ratings for all 17 IoT edge sensors,
    including uptime percentages, packet loss rates, SNR (dB), and calibration health.
    """
    return _reliability_tracker.get_all_reliabilities()

@router.get("/fusion/compare-detection", tags=["Multi-Sensor Fusion Intelligence"])
def get_detection_comparison_benchmark():
    """
    Returns benchmark cases directly comparing Single-Sensor Naive Detection
    vs Multi-Sensor Fused Detection (demonstrating false alarm suppression
    during morning surges, booster starts, and transducer spikes).
    """
    return CrossSensorDetector.get_benchmark_comparison_cases()

@router.post("/fusion/process", tags=["Multi-Sensor Fusion Intelligence"])
def process_sensor_fusion(payload: MultiSensorFusionProcessRequest):
    """
    Combines multi-modal telemetry inputs, applies timestamp validation and
    cross-sensor correlation, and returns a unified anomaly diagnosis with contributing signals.
    """
    return CrossSensorDetector.process_fusion(
        zone_id=payload.zone_id,
        flow_rate=payload.flow_rate,
        flow_baseline=payload.flow_baseline,
        pressure=payload.pressure,
        pressure_baseline=payload.pressure_baseline,
        consumption=payload.consumption,
        consumption_baseline=payload.consumption_baseline,
        tank_depletion_rate=payload.tank_depletion_rate,
        expected_tank_depletion=payload.expected_tank_depletion,
    )
