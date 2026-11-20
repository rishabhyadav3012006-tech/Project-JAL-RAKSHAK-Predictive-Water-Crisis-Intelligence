"""Tests for AI anomaly detection engine (Isolation Forest + XGBoost)."""
from anomaly_detection.detector import anomaly_detector
from app.api.routers.anomalies import predict_anomaly, AnomalyPredictRequest

def test_anomaly_prediction_normal():
    res = anomaly_detector.predict_reading(
        flow=165.0,
        pressure=4.80,
        tank_level=80.0,
        historical_consumption=140.0,
        zone_id="ZONE_1"
    )
    assert "is_anomaly" in res
    assert "anomaly_score" in res
    assert "severity" in res

def test_anomaly_prediction_pipe_rupture():
    res = anomaly_detector.predict_reading(
        flow=420.0,
        pressure=2.1,
        tank_level=55.0,
        historical_consumption=140.0,
        zone_id="ZONE_3"
    )
    assert res["is_anomaly"] is True
    assert res["severity"] in ["HIGH", "CRITICAL"]

def test_anomaly_evaluation_report():
    rep = anomaly_detector.get_evaluation_report()
    assert "isolation_forest" in rep
    assert "xgboost" in rep
    assert "features_evaluated" in rep
    assert len(rep["features_evaluated"]) == 10
