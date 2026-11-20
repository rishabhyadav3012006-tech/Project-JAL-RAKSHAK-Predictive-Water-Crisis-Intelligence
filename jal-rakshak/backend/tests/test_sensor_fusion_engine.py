"""Tests for multi-sensor fusion intelligence and false alarm suppression."""
from sensor_fusion import unified_health_evaluator, CrossSensorDetector, SensorReliabilityTracker

def test_unified_network_health():
    health = unified_health_evaluator.evaluate_unified_health()
    assert health["unified_health_score"] >= 80.0
    assert health["status"] in ["EXCELLENT", "GOOD / HEALTHY"]
    assert "sub_indices" in health
    assert "pressure_stability" in health["sub_indices"]
    assert "volumetric_equilibrium" in health["sub_indices"]

def test_sensor_reliability_tracking():
    tracker = SensorReliabilityTracker()
    reliabilities = tracker.get_all_reliabilities()
    assert len(reliabilities) == 17
    for r in reliabilities:
        assert 0.0 <= r["reliability_score"] <= 1.0
        assert r["uptime_pct"] > 90.0

def test_false_alarm_suppression_morning_surge():
    # Inflow increases by +32%, but customer smart meters match with +30%
    res = CrossSensorDetector.process_fusion(
        zone_id="ZONE_1",
        flow_rate=218.0,
        flow_baseline=165.0,
        pressure=4.65,
        pressure_baseline=4.80,
        consumption=182.0,
        consumption_baseline=140.0,
    )
    # Fused engine suppresses false leak alarm!
    assert res["is_fused_leak_suspicion"] is False
    assert res["fused_classification"] == "AUTHORIZED_DEMAND_SURGE"
    assert res["fused_anomaly_score"] < 0.10

def test_pipe_rupture_corroboration():
    # Inflow increases by +35%, pressure drops by -28%, consumption is flat
    res = CrossSensorDetector.process_fusion(
        zone_id="ZONE_3",
        flow_rate=224.0,
        flow_baseline=165.0,
        pressure=3.42,
        pressure_baseline=4.80,
        consumption=142.0,
        consumption_baseline=140.0,
    )
    # Fused engine confirms pipe fracture!
    assert res["is_fused_leak_suspicion"] is True
    assert res["fused_classification"] == "CORROBORATED_PIPELINE_FRACTURE"
    assert res["fused_anomaly_score"] > 0.90
