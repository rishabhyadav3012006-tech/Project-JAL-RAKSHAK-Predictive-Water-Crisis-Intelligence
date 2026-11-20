"""
JAL-RAKSHAK — Water Demand Synthetic Time-Series Generator
Generates realistic multi-zone chronological hourly water consumption series
incorporating diurnal curves, weather effects (temperature/humidity), weekend shifts,
and zone-specific hydraulic demand archetypes.
"""

import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple

ZONE_PROFILES = {
    "zone-north": {
        "name": "Zone 1-4: North Residential",
        "type": "residential",
        "base_m3h": 420.0,
        "morning_peak_hour": 8,
        "evening_peak_hour": 19,
        "night_min_hour": 3,
        "weekend_boost": 1.12,  # +12% on weekends
        "temp_sensitivity": 0.018,  # +1.8% demand per degree C above 26C
    },
    "zone-east": {
        "name": "Zone 5-8: East Commercial & IT",
        "type": "commercial",
        "base_m3h": 360.0,
        "morning_peak_hour": 11,
        "evening_peak_hour": 15,
        "night_min_hour": 2,
        "weekend_boost": 0.75,  # -25% on weekends (offices closed)
        "temp_sensitivity": 0.024,  # +2.4% for cooling/chillers
    },
    "zone-south": {
        "name": "Zone 9-12: South Industrial Ring",
        "type": "industrial",
        "base_m3h": 460.0,
        "morning_peak_hour": 10,
        "evening_peak_hour": 16,
        "night_min_hour": 4,
        "weekend_boost": 0.95,  # Continuous manufacturing, slight drop
        "temp_sensitivity": 0.010,
    },
    "zone-west": {
        "name": "Zone 13-16: West Suburbs",
        "type": "suburban",
        "base_m3h": 310.0,
        "morning_peak_hour": 8,
        "evening_peak_hour": 20,
        "night_min_hour": 3,
        "weekend_boost": 1.15,
        "temp_sensitivity": 0.020,
    },
    "zone-central": {
        "name": "Zone 17-20: Central Civic & Hospitals",
        "type": "civic",
        "base_m3h": 380.0,
        "morning_peak_hour": 9,
        "evening_peak_hour": 18,
        "night_min_hour": 3,
        "weekend_boost": 0.98,
        "temp_sensitivity": 0.015,
    },
}

def generate_zone_time_series(
    zone_id: str = "zone-north",
    days: int = 60,
    start_date: datetime = None,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generates a 60-day chronological hourly dataset (1440 observations).
    """
    np.random.seed(seed)
    if start_date is None:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        start_date = start_date.replace(minute=0, second=0, microsecond=0)

    profile = ZONE_PROFILES.get(zone_id, ZONE_PROFILES["zone-north"])
    records = []

    current_time = start_date
    total_hours = days * 24

    for h in range(total_hours):
        hour = current_time.hour
        day_of_week = current_time.weekday()  # 0=Monday, 6=Sunday
        is_weekend = 1 if day_of_week in [5, 6] else 0

        # Base diurnal cyclical curve (double-peak Gaussian mixture)
        # Morning peak around profile['morning_peak_hour']
        m_peak = profile["morning_peak_hour"]
        e_peak = profile["evening_peak_hour"]
        n_min = profile["night_min_hour"]

        # Diurnal factor normalized around 1.0
        # Peak 1: Morning
        morning_term = 0.55 * math.exp(-((hour - m_peak) ** 2) / 7.0)
        # Peak 2: Evening
        evening_term = 0.45 * math.exp(-((hour - e_peak) ** 2) / 9.0)
        # Deep night dip
        night_term = -0.40 * math.exp(-((hour - n_min) ** 2) / 6.0)

        diurnal_factor = 0.85 + morning_term + evening_term + night_term

        # Synthetic Weather: Temperature sinusoid with seasonal drift & day/night swing
        # Daily cycle: coolest at 05:00, warmest at 15:00
        temp_daily = 7.0 * math.sin((hour - 9) * 2 * math.pi / 24)
        # Seasonal drift over the 60-day horizon
        temp_seasonal = 3.5 * math.sin(h * 2 * math.pi / (60 * 24))
        temperature_c = 28.0 + temp_daily + temp_seasonal + np.random.normal(0, 0.8)

        # Humidity inverse with temperature
        humidity_pct = max(25.0, min(95.0, 75.0 - (temperature_c - 25.0) * 2.2 + np.random.normal(0, 3.0)))

        # Temperature effect on water consumption
        temp_delta = max(0.0, temperature_c - 26.0)
        temp_multiplier = 1.0 + (temp_delta * profile["temp_sensitivity"])

        # Weekend effect
        weekend_multiplier = profile["weekend_boost"] if is_weekend else 1.0

        # Stochastic noise
        noise = np.random.normal(1.0, 0.035)

        # Final calculated consumption
        demand_m3h = profile["base_m3h"] * diurnal_factor * weekend_multiplier * temp_multiplier * noise
        demand_m3h = max(profile["base_m3h"] * 0.3, round(demand_m3h, 2))

        records.append({
            "timestamp": current_time,
            "zone_id": zone_id,
            "hour": hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "temperature_c": round(temperature_c, 1),
            "humidity_pct": round(humidity_pct, 1),
            "demand_m3h": demand_m3h,
        })

        current_time += timedelta(hours=1)

    df = pd.DataFrame(records)
    return df
