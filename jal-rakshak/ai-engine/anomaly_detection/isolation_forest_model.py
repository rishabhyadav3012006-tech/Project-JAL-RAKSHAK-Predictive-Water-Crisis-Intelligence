"""Isolation Forest baseline unsupervised anomaly detector."""
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple
from .features import FEATURE_NAMES

class IsolationForestDetector:
    def __init__(self, contamination: float = 0.12):
        self.contamination = contamination
        self.model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42,
            n_jobs=-1
        )
        self.is_fitted = False
        self.score_min = -0.8
        self.score_max = -0.35

    def fit(self, X_train: np.ndarray):
        """Fits Isolation Forest on baseline operating data."""
        self.model.fit(X_train)
        self.is_fitted = True
        raw_scores = self.model.score_samples(X_train)
        self.score_min = float(np.percentile(raw_scores, 1))
        self.score_max = float(np.percentile(raw_scores, 99))

    def predict_score(self, feature_vector: np.ndarray) -> Tuple[float, bool, str, str]:
        """
        Returns:
            - normalized_score (0.0 to 1.0)
            - is_anomaly (bool)
            - severity ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')
            - explanation (human-readable string)
        """
        if not self.is_fitted:
            return 0.2, False, "LOW", "Model not fitted; default baseline."

        if feature_vector.ndim == 1:
            X = feature_vector.reshape(1, -1)
        else:
            X = feature_vector

        raw_score = float(self.model.score_samples(X)[0])
        # Invert: lower raw score means more anomalous
        norm_score = (self.score_max - raw_score) / max(0.01, (self.score_max - self.score_min))
        norm_score = float(np.clip(norm_score, 0.02, 0.99))

        is_anomaly = norm_score >= 0.55

        # Severity categories
        if norm_score >= 0.82:
            severity = "CRITICAL"
        elif norm_score >= 0.65:
            severity = "HIGH"
        elif norm_score >= 0.45:
            severity = "MODERATE"
        else:
            severity = "LOW"

        explanation = self._generate_explanation(feature_vector, norm_score, severity)
        return round(norm_score, 3), is_anomaly, severity, explanation

    def _generate_explanation(self, feat: np.ndarray, score: float, severity: str) -> str:
        f = feat.flatten()
        flow = f[0]
        pressure = f[1]
        tank_level = f[2]
        hour = f[4]
        delta_p = f[8]

        reasons = []

        # Acoustic burst / surge
        if flow > 520.0 and pressure < 3.8:
            reasons.append(f"Excessive water throughput ({flow:.1f} m³/h) paired with hydrostatic pressure drop ({pressure:.2f} Bar) strongly indicates pipe rupture or burst.")
        elif flow > 500.0:
            reasons.append(f"Unexpectedly high water flow rate ({flow:.1f} m³/h) deviating significantly from diurnal baseline.")

        # Pressure deviation
        if abs(delta_p) > 1.2 or pressure < 2.5:
            reasons.append(f"Sudden pressure transient deviation ({delta_p:+.2f} Bar delta, absolute {pressure:.2f} Bar) indicating valve failure or hydraulic shock.")

        # Overnight consumption
        if (hour < 5.0 or hour > 23.0) and flow > 380.0:
            reasons.append(f"Unusual overnight consumption spike ({flow:.1f} m³/h at {int(hour):02d}:{int((hour%1)*60):02d} hrs) when baseline demand is nocturnal idle.")

        # Tank depletion
        if tank_level < 35.0:
            reasons.append(f"Reservoir storage buffer depleted to critical threshold ({tank_level:.1f}%) faster than historical inflow rate.")

        if not reasons:
            if severity in ["HIGH", "CRITICAL"]:
                reasons.append(f"Multi-feature Isolation Forest vector anomaly score ({score:.2f}) indicates an irregular combined flow-pressure state.")
            else:
                reasons.append("All hydraulic telemetry parameters are operating within baseline diurnal tolerances.")

        return " ".join(reasons)
