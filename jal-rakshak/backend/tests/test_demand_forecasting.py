"""Tests for predictive water demand forecasting engine."""
from demand_forecasting.forecaster import water_demand_forecaster

def test_demand_forecast_generation():
    fc = water_demand_forecaster.generate_forecast(zone_id="zone-north", horizon="24h")
    assert "horizon" in fc
    assert "forecast_trajectory" in fc
    assert len(fc["forecast_trajectory"]) > 0

def test_demand_evaluation_metrics():
    eval_rep = water_demand_forecaster.get_evaluation_report(zone_id="zone-north")
    assert "models" in eval_rep
    assert "xgboost_regressor" in eval_rep["models"]
    assert "r2_score" in eval_rep["models"]["xgboost_regressor"]
    assert eval_rep["models"]["xgboost_regressor"]["r2_score"] > 0.90

def test_demand_zones_comparison():
    comp = water_demand_forecaster.get_zone_comparison(horizon="24h")
    assert isinstance(comp, (list, dict))
