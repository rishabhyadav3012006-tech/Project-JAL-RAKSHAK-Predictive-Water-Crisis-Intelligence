"""Feature extraction and engineering for water network anomaly detection."""
import math
from datetime import datetime
from typing import Dict, Any, List
import numpy as np

ZONE_ENCODING = {
    "zone-north": 0,
    "zone-east": 1,
    "zone-south": 2,
    "zone-west": 3,
    "zone-central": 4,
}

FEATURE_NAMES = [
    "flow_rate_m3h",
    "pressure_bar",
    "tank_level_pct",
    "historical_consumption_m3h",
    "time_of_day_hour",
    "is_weekend",
    "zone_encoded",
    "flow_pressure_ratio",
    "recent_delta_pressure",
    "recent_delta_flow",
]

def extract_features(
    flow: float,
    pressure: float,
    tank_level: float,
    historical_consumption: float,
    timestamp: datetime,
    zone_id: str,
    prev_pressure: float = None,
    prev_flow: float = None,
) -> np.ndarray:
    """Extracts a normalized 10-dimensional feature vector for anomaly models."""
    hour_float = timestamp.hour + timestamp.minute / 60.0
    is_weekend = 1.0 if timestamp.weekday() >= 5 else 0.0
    zone_code = float(ZONE_ENCODING.get(zone_id.lower(), 0))
    
    # Hydraulic interaction feature
    fp_ratio = flow / max(0.2, pressure)
    
    # Recent sensor dynamics
    delta_p = (pressure - prev_pressure) if prev_pressure is not None else 0.0
    delta_f = (flow - prev_flow) if prev_flow is not None else 0.0

    return np.array([
        float(flow),
        float(pressure),
        float(tank_level),
        float(historical_consumption),
        float(hour_float),
        float(is_weekend),
        float(zone_code),
        float(fp_ratio),
        float(delta_p),
        float(delta_f),
    ], dtype=np.float32)
