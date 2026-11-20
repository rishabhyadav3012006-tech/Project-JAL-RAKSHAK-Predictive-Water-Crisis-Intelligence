"""Integrated Water Distribution Anomaly Detection Pipeline orchestrator."""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix

from .features import extract_features, FEATURE_NAMES
from .baseline_generator import generate_synthetic_dataset
from .isolation_forest_model import IsolationForestDetector
from .xgboost_model import XGBoostAnomalyClassifier

class WaterAnomalyDetector:
    def __init__(self):
        self.iso_forest = IsolationForestDetector()
        self.xgb_model = XGBoostAnomalyClassifier()
        self.stored_events: List[Dict[str, Any]] = []
        self.is_initialized = False
        self.dataset_meta: Dict[str, Any] = {}
        self.iso_eval_metrics: Dict[str, Any] = {}

        # Automatically bootstrap and fit models
        self.bootstrap()

    def bootstrap(self):
        """Generates synthetic baseline and trains both Isolation Forest and XGBoost."""
        X, y, types = generate_synthetic_dataset(num_samples=3000, anomaly_ratio=0.12)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

        # 1. Fit Isolation Forest on clean normal data
        normal_mask = (y_train == 0)
        self.iso_forest.fit(X_train[normal_mask])

        # Evaluate Isolation Forest on test set
        iso_preds_binary = []
        for i in range(len(X_test)):
            score, is_anom, _, _ = self.iso_forest.predict_score(X_test[i])
            iso_preds_binary.append(1 if is_anom else 0)

        iso_preds_binary = np.array(iso_preds_binary)
        cm_iso = confusion_matrix(y_test, iso_preds_binary).tolist()

        self.iso_eval_metrics = {
            "model_type": "Isolation Forest (Unsupervised Baseline)",
            "precision": round(float(precision_score(y_test, iso_preds_binary, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, iso_preds_binary, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, iso_preds_binary, zero_division=0)), 4),
            "confusion_matrix": {
                "true_negatives": cm_iso[0][0],
                "false_positives": cm_iso[0][1],
                "false_negatives": cm_iso[1][0],
                "true_positives": cm_iso[1][1],
            }
        }

        # 2. Fit XGBoost on labeled train set
        self.xgb_model.fit_and_evaluate(X_train, y_train, X_test, y_test)

        self.dataset_meta = {
            "total_synthetic_samples": len(X),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "anomaly_ratio_pct": 12.0,
            "disclaimer": "EVALUATION NOTICE: Metrics derived from synthetic hydrodynamic baseline simulations. Synthetic training sets validate algorithmic efficacy but do not represent validated municipal field certification."
        }

        # Seed initial anomaly history events
        self._seed_initial_events()
        self.is_initialized = True

    def _seed_initial_events(self):
        self.stored_events = [
            {
                "id": "anom-ev-101",
                "timestamp": "12 mins ago",
                "sensor_id": "PS-202",
                "zone_id": "zone-south",
                "anomaly_score": 0.885,
                "severity": "CRITICAL",
                "category": "Sudden Pressure Deviation & Rupture",
                "flow_rate_m3h": 542.0,
                "pressure_bar": 3.42,
                "tank_level_pct": 68.4,
                "explanation": "Excessive flow rate (542 m³/h) paired with sudden -1.4 Bar pressure drop indicates acute pipe rupture in Sector 9 Conduit.",
                "acknowledged": False
            },
            {
                "id": "anom-ev-102",
                "timestamp": "34 mins ago",
                "sensor_id": "FS-102",
                "zone_id": "zone-south",
                "anomaly_score": 0.760,
                "severity": "HIGH",
                "category": "Unexpected High Flow Rate",
                "flow_rate_m3h": 490.5,
                "pressure_bar": 3.85,
                "tank_level_pct": 72.0,
                "explanation": "Unexpectedly high water flow rate deviating significantly from diurnal baseline draw.",
                "acknowledged": True
            },
            {
                "id": "anom-ev-103",
                "timestamp": "1 hr 15 mins ago",
                "sensor_id": "WCM-403",
                "zone_id": "zone-south",
                "anomaly_score": 0.540,
                "severity": "MODERATE",
                "category": "Unusual Overnight Consumption",
                "flow_rate_m3h": 360.0,
                "pressure_bar": 4.60,
                "tank_level_pct": 78.0,
                "explanation": "Unusual overnight consumption spike recorded between 02:00-04:00 AM.",
                "acknowledged": True
            }
        ]

    def predict_reading(
        self,
        flow: float,
        pressure: float,
        tank_level: float,
        historical_consumption: float,
        timestamp: Optional[datetime] = None,
        zone_id: str = "zone-north",
        prev_pressure: Optional[float] = None,
        prev_flow: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Runs live feature extraction and inference through Isolation Forest + XGBoost."""
        now = timestamp or datetime.now(timezone.utc)
        feat = extract_features(
            flow=flow,
            pressure=pressure,
            tank_level=tank_level,
            historical_consumption=historical_consumption,
            timestamp=now,
            zone_id=zone_id,
            prev_pressure=prev_pressure,
            prev_flow=prev_flow,
        )

        iso_score, is_anomaly, severity, explanation = self.iso_forest.predict_score(feat)
        xgb_prob = self.xgb_model.predict_probability(feat)

        result = {
            "timestamp": now.isoformat(),
            "is_anomaly": is_anomaly,
            "anomaly_score": iso_score,
            "xgboost_probability": xgb_prob,
            "severity": severity,
            "explanation": explanation,
            "features_analyzed": {
                "flow_rate_m3h": flow,
                "pressure_bar": pressure,
                "tank_level_pct": tank_level,
                "historical_consumption": historical_consumption,
                "time_of_day_hour": round(now.hour + now.minute / 60.0, 2),
                "zone_id": zone_id,
            }
        }

        # If significant anomaly, log to stored events
        if severity in ["HIGH", "CRITICAL"]:
            new_event = {
                "id": f"anom-ev-{int(now.timestamp())}",
                "timestamp": "Just now",
                "sensor_id": f"SENS-{zone_id.replace('zone-', '').upper()}",
                "zone_id": zone_id,
                "anomaly_score": iso_score,
                "severity": severity,
                "category": "Live Telemetry Anomaly",
                "flow_rate_m3h": flow,
                "pressure_bar": pressure,
                "tank_level_pct": tank_level,
                "explanation": explanation,
                "acknowledged": False
            }
            self.stored_events.insert(0, new_event)
            if len(self.stored_events) > 50:
                self.stored_events.pop()

        return result

    def simulate_detection_example(self, example_type: str) -> Dict[str, Any]:
        """Executes one of the 5 requested detection archetypes."""
        now = datetime.now(timezone.utc)

        examples = {
            "unexpected_high_flow": {
                "flow": 680.0,
                "pressure": 3.6,
                "tank_level": 74.0,
                "hist": 320.0,
                "zone": "zone-south",
                "label": "1. Unexpectedly High Water Flow (Burst)"
            },
            "sudden_pressure_deviation": {
                "flow": 310.0,
                "pressure": 1.95,
                "tank_level": 78.0,
                "hist": 315.0,
                "zone": "zone-north",
                "prev_p": 4.8,
                "label": "2. Sudden Pressure Deviation (Pressure Wave)"
            },
            "unusual_overnight_consumption": {
                "flow": 460.0,
                "pressure": 4.5,
                "tank_level": 82.0,
                "hist": 140.0,
                "zone": "zone-east",
                "time": now.replace(hour=3, minute=15),
                "label": "3. Unusual Overnight Consumption Spike (03:15 AM)"
            },
            "rapid_tank_depletion": {
                "flow": 330.0,
                "pressure": 4.1,
                "tank_level": 24.5,
                "hist": 320.0,
                "zone": "zone-west",
                "label": "4. Tank Depletion Faster than Expected"
            },
            "abnormal_flow_pressure_relationship": {
                "flow": 120.0,
                "pressure": 1.85,
                "tank_level": 76.0,
                "hist": 320.0,
                "zone": "zone-south",
                "label": "5. Abnormal Flow-Pressure Relationship (Inverted Gradient)"
            }
        }

        cfg = examples.get(example_type, examples["unexpected_high_flow"])
        res = self.predict_reading(
            flow=cfg["flow"],
            pressure=cfg["pressure"],
            tank_level=cfg["tank_level"],
            historical_consumption=cfg["hist"],
            timestamp=cfg.get("time", now),
            zone_id=cfg["zone"],
            prev_pressure=cfg.get("prev_p", None)
        )
        res["example_title"] = cfg["label"]
        return res

    def get_evaluation_report(self) -> Dict[str, Any]:
        """Produces comprehensive model evaluation report."""
        return {
            "isolation_forest": self.iso_eval_metrics,
            "xgboost": self.xgb_model.evaluation_metrics,
            "dataset_metadata": self.dataset_meta,
            "features_evaluated": FEATURE_NAMES,
            "evaluation_notice": "Do not pretend that synthetic data produces real-world validated accuracy. These metrics evaluate algorithm convergence on synthetic diurnal water grid simulations."
        }

    def get_stored_events(self) -> List[Dict[str, Any]]:
        return self.stored_events

anomaly_detector = WaterAnomalyDetector()
