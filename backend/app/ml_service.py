import pickle
from pathlib import Path
from typing import Optional
import pandas as pd
import networkx as nx
from .mock_data import graph_state

MODEL_PATH = Path(__file__).parent.parent.parent / "Model"
MODEL_FILE = MODEL_PATH / "model.pkl"
COLUMNS_FILE = MODEL_PATH / "columns.pkl"


class MLService:
    def __init__(self):
        self.model: Optional[object] = None
        self.feature_columns: list = []
        self.graph = nx.DiGraph()
        self._load_model()
        self._initialize_graph_from_state()

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

    def _initialize_graph_from_state(self):
        for node in graph_state.nodes:
            self.graph.add_node(node.id, label=node.label, type=node.type)
        
        for node in graph_state.nodes:
            for conn in node.connections:
                if self.graph.has_node(conn):
                    self.graph.add_edge(node.id, conn)
        
        print(f"Graph initialized with {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} edges")

    def is_available(self) -> bool:
        return self.model is not None

    def predict(self, transaction_data: dict) -> dict:
        sender = transaction_data.get("sender_id", transaction_data.get("source", "UNKNOWN"))
        receiver = transaction_data.get("receiver_id", transaction_data.get("destination", "UNKNOWN"))
        amount = transaction_data.get("amount", 0)

        ml_prob = self._get_ml_probability(transaction_data)
        graph_metrics = self._calculate_graph_metrics(sender, receiver)
        
        # Heavy Flat Sum Override
        amount_boost = 0.0
        if amount > 10_000_000:
            amount_boost = 40.0
        elif amount > 1_000_000:
            amount_boost = 20.0
        elif amount > 250_000:
            amount_boost = 10.0
            
        final_probability = min(99.9, ml_prob + graph_metrics["total_boost"] + amount_boost)
        is_fraud = final_probability >= 70

        risk = int(final_probability)
        source_node, target_node = graph_state.add_edge(sender, receiver, amount, risk)
        
        self.graph.add_node(sender, label=sender, type="account")
        self.graph.add_node(receiver, label=receiver, type="account")
        self.graph.add_edge(sender, receiver, amount=amount)

        # Update metrics to include amount boost
        graph_metrics["amount_boost"] = amount_boost
        graph_metrics["total_boost"] = round(graph_metrics["total_boost"] + amount_boost, 1)

        return {
            "is_fraud": is_fraud,
            "fraud_probability": round(final_probability, 2),
            "confidence": round(max(ml_prob, graph_metrics["base_confidence"]) * 100 / final_probability if final_probability > 0 else 0, 2),
            "risk_level": self._get_risk_level(final_probability),
            "recommendation": "block" if is_fraud else "allow",
            "graph_metrics": graph_metrics,
            "transaction": {
                "sender": sender,
                "receiver": receiver,
                "amount": amount
            }
        }

    def _get_ml_probability(self, data: dict) -> float:
        if not self.is_available():
            amount = data.get("amount", 0)
            return min(amount / 100000 * 50, 95)

        df = self._prepare_features(data)
        proba = self.model.predict_proba(df)[0]
        return float(proba[1]) * 100

    def _calculate_graph_metrics(self, sender: str, receiver: str) -> dict:
        degree_boost = 0.0
        clustering_boost = 0.0
        cycle_boost = 0.0
        
        sender_degree = self.graph.out_degree(sender) + self.graph.in_degree(sender)
        receiver_degree = self.graph.out_degree(receiver) + self.graph.in_degree(receiver)
        max_degree = max(sender_degree, receiver_degree)
        
        if max_degree > 5:
            degree_boost = 10.0
        elif max_degree > 3:
            degree_boost = 5.0
        
        try:
            clustering_coef = nx.average_clustering(self.graph.to_undirected())
            if clustering_coef > 0.6:
                clustering_boost = 15.0
            elif clustering_coef > 0.4:
                clustering_boost = 10.0
        except:
            clustering_coef = 0.0
        
        new_edge_creates_cycle = (
            sender in self.graph and 
            receiver in self.graph and 
            nx.has_path(self.graph, receiver, sender)
        )
        if new_edge_creates_cycle:
            cycle_boost = 30.0
        return {
            "degree_boost": round(degree_boost, 1),
            "clustering_boost": round(clustering_boost, 1),
            "cycle_boost": round(cycle_boost, 1),
            "total_boost": round(degree_boost + clustering_boost + cycle_boost, 1),
            "degree": max_degree,
            "clustering": round(clustering_coef * 100, 1),
            "cycle_detected": cycle_boost > 0,
            "base_confidence": 75.0
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

    def _get_risk_level(self, fraud_prob: float) -> str:
        if fraud_prob >= 75:
            return "critical"
        elif fraud_prob >= 50:
            return "high"
        elif fraud_prob >= 25:
            return "medium"
        return "low"

    def get_graph_state(self) -> dict:
        return {
            "nodes": graph_state.nodes,
            "edges": graph_state.get_edges_for_graph(),
            "stats": {
                "total_nodes": len(graph_state.nodes),
                "total_edges": len(graph_state.edges)
            }
        }


ml_service = MLService()
