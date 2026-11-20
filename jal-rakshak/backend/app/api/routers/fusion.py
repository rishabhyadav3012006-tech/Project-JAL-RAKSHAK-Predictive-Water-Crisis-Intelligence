"""Multi-Sensor Fusion Intelligence Router."""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sensor_fusion import unified_health_evaluator, CrossSensorDetector, SensorReliabilityTracker

router = APIRouter(prefix="/fusion", tags=["Multi-Sensor Fusion Intelligence"])

_reliability_tracker = SensorReliabilityTracker()

class MultiSensorFusionProcessRequest(BaseModel):
    zone_id: str = "ZONE_3"
    flow_rate: float
    flow_baseline: float = 165.0
    pressure: float
    pressure_baseline: float = 4.80
    consumption: float
    consumption_baseline: float = 140.0
    tank_depletion_rate: float = 0.0
    expected_tank_depletion: float = 0.0

@router.get("/live-assessment", summary="Unified Water Network Health Index (0 - 100%)")
def get_unified_network_health():
    """Returns composite health assessment combining pressure, volume, storage, NRW loss, and telemetry uptime."""
    return unified_health_evaluator.evaluate_unified_health()

@router.get("/sensor-reliability", summary="Dynamic reliability matrix for all 17 IoT edge sensors")
def get_sensor_reliability_metrics():
    """Returns uptime, packet loss, SNR (dB), calibration drift, and composite reliability scores."""
    return _reliability_tracker.get_all_reliabilities()

@router.get("/compare-detection", summary="Single-Sensor vs Multi-Sensor Fused Detection Benchmark")
def get_detection_comparison_benchmark():
    """Returns benchmark cases demonstrating false alarm suppression during morning surges, pump starts, and noise spikes."""
    return CrossSensorDetector.get_benchmark_comparison_cases()

@router.post("/process", summary="Process ad-hoc multi-sensor telemetry through physical fusion engine")
def process_sensor_fusion(payload: MultiSensorFusionProcessRequest):
    """Combines multi-modal telemetry inputs and returns fused anomaly score with contributing physical signals."""
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
