"""Baseline operating data generator for water distribution anomaly detection."""
import math
import random
from datetime import datetime, timedelta, timezone
import numpy as np
from .features import extract_features, FEATURE_NAMES

def generate_synthetic_dataset(num_samples: int = 3000, anomaly_ratio: float = 0.12):
    """
    Generates synthetic water distribution telemetry:
    - Normal diurnal baseline with Gaussian noise
    - Injected labelled anomalies covering 5 detection archetypes
    """
    np.random.seed(42)
    random.seed(42)

    X_list = []
    y_list = []
    types_list = []

    start_date = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    base_flow = 320.0
    base_pressure = 4.8
    base_level = 82.0

    prev_p = base_pressure
    prev_f = base_flow

    num_anomalies = int(num_samples * anomaly_ratio)
    anomaly_indices = set(random.sample(range(200, num_samples), num_anomalies))

    for i in range(num_samples):
        current_time = start_date + timedelta(minutes=i * 15)
        hour = current_time.hour + current_time.minute / 60.0

        # Normal diurnal consumption pattern (morning 08:00 & evening 19:00 peaks)
        time_rad = (hour / 24.0) * (2 * math.pi)
        diurnal_factor = 0.8 + 0.35 * math.sin(time_rad - 1.2) ** 2
        
        # Base normal values
        normal_flow = base_flow * diurnal_factor + np.random.normal(0, 12.0)
        normal_pressure = base_pressure - (diurnal_factor - 1.0) * 0.4 + np.random.normal(0, 0.08)
        normal_level = base_level - (diurnal_factor - 1.0) * 8.0 + np.random.normal(0, 1.2)
        normal_hist = normal_flow * 0.98

        zone = random.choice(["zone-north", "zone-east", "zone-south", "zone-west"])

        is_anomaly = i in anomaly_indices
        anomaly_type = "normal"

        flow = normal_flow
        pressure = normal_pressure
        tank_level = normal_level

        if is_anomaly:
            scenario_choice = random.choice([
                "unexpected_high_flow",
                "sudden_pressure_deviation",
                "unusual_overnight_consumption",
                "rapid_tank_depletion",
                "abnormal_flow_pressure_relationship"
            ])
            anomaly_type = scenario_choice

            if scenario_choice == "unexpected_high_flow":
                # Sudden burst: +90% flow with pressure loss
                flow = normal_flow * 1.95
                pressure = max(1.8, normal_pressure - 1.4)
            elif scenario_choice == "sudden_pressure_deviation":
                # Valve hunting or surge
                pressure = normal_pressure + random.choice([-2.1, 2.2])
            elif scenario_choice == "unusual_overnight_consumption":
                # High flow at 03:00 AM
                flow = base_flow * 1.85
            elif scenario_choice == "rapid_tank_depletion":
                # Reservoir depletion
                tank_level = max(10.0, normal_level - 42.0)
            elif scenario_choice == "abnormal_flow_pressure_relationship":
                # Flow drops while pressure collapses (blockage/fracture)
                flow = normal_flow * 0.3
                pressure = max(1.5, normal_pressure - 2.0)

        feats = extract_features(
            flow=flow,
            pressure=pressure,
            tank_level=tank_level,
            historical_consumption=normal_hist,
            timestamp=current_time,
            zone_id=zone,
            prev_pressure=prev_p,
            prev_flow=prev_f,
        )

        prev_p = pressure
        prev_f = flow

        X_list.append(feats)
        y_list.append(1 if is_anomaly else 0)
        types_list.append(anomaly_type)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int32)

    return X, y, types_list
