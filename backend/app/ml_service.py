import pickle
from pathlib import Path
from typing import Optional
import pandas as pd
import numpy as np

MODEL_PATH = Path(__file__).parent.parent.parent / "Model"
MODEL_FILE = MODEL_PATH / "model.pkl"
COLUMNS_FILE = MODEL_PATH / "columns.pkl"

class MLService:
    def __init__(self):
        self.model: Optional[object] = None
        self.feature_columns: list[str] = []
        self._load_model()

    def _load_model(self):
        try:
            with open(MODEL_FILE, 'rb') as f:
                self.model = pickle.load(f)
            with open(COLUMNS_FILE, 'rb') as f:
                self.feature_columns = pickle.load(f)
            print(f"ML model loaded successfully with {len(self.feature_columns)} features")
        except Exception as e:
            print(f"Warning: Could not load ML model: {e}")
            self.model = None
            self.feature_columns = []

    def is_available(self) -> bool:
        return self.model is not None

    def predict(self, transaction_data: dict) -> dict:
        if not self.is_available():
            return self._mock_predict(transaction_data)

        df = self._prepare_features(transaction_data)
        proba = self.model.predict_proba(df)[0]
        prediction = self.model.predict(df)[0]

        fraud_probability = float(proba[1]) * 100
        is_fraud = bool(prediction)

        return {
            "is_fraud": is_fraud,
            "fraud_probability": round(fraud_probability, 2),
            "confidence": round(max(proba) * 100, 2),
            "risk_level": self._get_risk_level(fraud_probability),
            "recommendation": "block" if is_fraud else "allow"
        }

    def _prepare_features(self, data: dict) -> pd.DataFrame:
        features = {}
        trans_type = data.get("type", "TRANSFER").upper()
        amount = data.get("amount", 0)
        oldbalanceOrg = data.get("oldbalanceOrg", 0)
        newbalanceOrig = data.get("newbalanceOrig", 0)
        oldbalanceDest = data.get("oldbalanceDest", 0)
        newbalanceDest = data.get("newbalanceDest", 0)

        features['step'] = [data.get('step', 10)]
        features['amount'] = [amount]
        features['oldbalanceOrg'] = [oldbalanceOrg]
        features['newbalanceOrig'] = [newbalanceOrig]
        features['oldbalanceDest'] = [oldbalanceDest]
        features['newbalanceDest'] = [newbalanceDest]
        features['isFlaggedFraud'] = [1 if amount > 200000 else 0]
        features['orig_diff'] = [oldbalanceOrg - newbalanceOrig]
        features['dest_diff'] = [newbalanceDest - oldbalanceDest]
        features['orig_zero'] = [1 if oldbalanceOrg == 0 else 0]
        features['dest_zero'] = [1 if oldbalanceDest == 0 else 0]
        features['isHighRiskType'] = [1 if trans_type in ['TRANSFER', 'CASH_OUT'] else 0]
        features['type_CASH_OUT'] = [1 if trans_type == 'CASH_OUT' else 0]
        features['type_DEBIT'] = [1 if trans_type == 'DEBIT' else 0]
        features['type_PAYMENT'] = [1 if trans_type == 'PAYMENT' else 0]
        features['type_TRANSFER'] = [1 if trans_type == 'TRANSFER' else 0]

        df = pd.DataFrame(features)
        return df[self.feature_columns]

    def _mock_predict(self, transaction_data: dict) -> dict:
        amount = transaction_data.get("amount", 0)
        base_prob = min(amount / 100000 * 50, 95)
        fraud_prob = round(base_prob + (hash(transaction_data.get("source", "")) % 30), 2)
        fraud_prob = max(5, min(99, fraud_prob))

        return {
            "is_fraud": fraud_prob > 50,
            "fraud_probability": fraud_prob,
            "confidence": round(75 + fraud_prob % 20, 2),
            "risk_level": self._get_risk_level(fraud_prob),
            "recommendation": "block" if fraud_prob > 50 else "allow"
        }

    def _get_risk_level(self, fraud_prob: float) -> str:
        if fraud_prob >= 75:
            return "critical"
        elif fraud_prob >= 50:
            return "high"
        elif fraud_prob >= 25:
            return "medium"
        return "low"

ml_service = MLService()
