"""
JAL-RAKSHAK — Demand Forecasting Feature Engineering Pipeline
Constructs autoregressive lags, rolling statistics, cyclical temporal features,
and meteorological regressors for chronological ML time-series models.
"""

import math
import numpy as np
import pandas as pd
from typing import Tuple, List

FEATURE_NAMES = [
    "hour",
    "hour_sin",
    "hour_cos",
    "day_of_week",
    "is_weekend",
    "temperature_c",
    "humidity_pct",
    "lag_1h",
    "lag_2h",
    "lag_3h",
    "lag_24h",
    "lag_168h",
    "rolling_mean_3h",
    "rolling_mean_24h",
    "rolling_std_24h",
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw time-series into supervised machine-learning features.
    Maintains strict chronological sequence to prevent future data leakage.
    """
    df = df.copy()
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Cyclical temporal encodings
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24.0)
    df["dow_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7.0)
    df["dow_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7.0)

    # Autoregressive Lag Features
    df["lag_1h"] = df["demand_m3h"].shift(1)
    df["lag_2h"] = df["demand_m3h"].shift(2)
    df["lag_3h"] = df["demand_m3h"].shift(3)
    df["lag_24h"] = df["demand_m3h"].shift(24)
    # 1 week lag (168 hours)
    df["lag_168h"] = df["demand_m3h"].shift(168).bfill()

    # Rolling window aggregations (strictly backward-looking)
    df["rolling_mean_3h"] = df["demand_m3h"].shift(1).rolling(window=3, min_periods=1).mean()
    df["rolling_mean_24h"] = df["demand_m3h"].shift(1).rolling(window=24, min_periods=1).mean()
    df["rolling_std_24h"] = df["demand_m3h"].shift(1).rolling(window=24, min_periods=1).std().fillna(5.0)

    # Backward fill initial lag rows to prevent NaNs while keeping chronological order
    df = df.bfill()

    return df

def chronological_train_test_split(
    df: pd.DataFrame,
    test_ratio: float = 0.20,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Splits time series chronologically into Train and Test partitions.
    Strictly forbids random shuffling to guarantee no temporal data leakage.
    """
    split_idx = int(len(df) * (1.0 - test_ratio))
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()

    X_train = train_df[FEATURE_NAMES]
    y_train = train_df["demand_m3h"]

    X_test = test_df[FEATURE_NAMES]
    y_test = test_df["demand_m3h"]

    return X_train, X_test, y_train, y_test, train_df, test_df
