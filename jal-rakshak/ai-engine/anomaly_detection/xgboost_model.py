"""XGBoost supervised anomaly classification & evaluation model."""
import numpy as np
import xgboost as xgb
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
from typing import Dict, Any, Tuple
from .features import FEATURE_NAMES

class XGBoostAnomalyClassifier:
    def __init__(self):
        self.model = xgb.XGBClassifier(
            n_estimators=80,
            max_depth=4,
            learning_rate=0.08,
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1
        )
        self.is_fitted = False
        self.evaluation_metrics: Dict[str, Any] = {}

    def fit_and_evaluate(self, X_train: np.ndarray, y_train: np.ndarray, X_test: np.ndarray, y_test: np.ndarray):
        """Trains on labeled dataset and calculates precision, recall, F1, and confusion matrix."""
        self.model.fit(X_train, y_train)
        self.is_fitted = True

        y_pred = self.model.predict(X_test)
        y_prob = self.model.predict_proba(X_test)[:, 1]

        precision = float(precision_score(y_test, y_pred, zero_division=0))
        recall = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        cm = confusion_matrix(y_test, y_pred).tolist()

        # Extract feature importances
        raw_importances = self.model.feature_importances_
        feature_importances = {
            FEATURE_NAMES[i]: round(float(raw_importances[i]), 4)
            for i in range(len(FEATURE_NAMES))
        }

        self.evaluation_metrics = {
            "model_type": "XGBoost Classifier (Supervised Evaluation)",
            "accuracy": round(float(np.mean(y_pred == y_test)), 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": {
                "true_negatives": cm[0][0],
                "false_positives": cm[0][1],
                "false_negatives": cm[1][0],
                "true_positives": cm[1][1],
            },
            "test_sample_size": len(y_test),
            "anomaly_sample_count": int(np.sum(y_test)),
            "feature_importances": feature_importances,
        }

    def predict_probability(self, feature_vector: np.ndarray) -> float:
        if not self.is_fitted:
            return 0.1
        if feature_vector.ndim == 1:
            X = feature_vector.reshape(1, -1)
        else:
            X = feature_vector
        prob = float(self.model.predict_proba(X)[0][1])
        return round(prob, 4)
