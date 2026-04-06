import pickle
from pathlib import Path
from typing import Optional
import pandas as pd
import networkx as nx
from collections import deque
import random
from .mock_data import graph_state
from .db_models import init_db, seed_database, UserRepository, TransactionRepository

MODEL_PATH = Path(__file__).parent.parent.parent / "Model"
MODEL_FILE = MODEL_PATH / "model.pkl"
COLUMNS_FILE = MODEL_PATH / "columns.pkl"


class MLService:
    def __init__(self):
        self.model: Optional[object] = None
        self.feature_columns: list = []
        self.graph = nx.DiGraph()
        self.node_risk_scores: dict[str, float] = {}
        self.username_map: dict[str, str] = {}
        self._load_model()
        init_db()
        seed_database()
        self._initialize_graph_from_db()

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

    def _initialize_graph_from_db(self):
        graph_data = TransactionRepository.get_graph_data()
        
        for user in graph_data["users"]:
            node_id = user["id"]
            username = user["username"]
            self.graph.add_node(node_id, label=username, type=user["user_type"])
            self.node_risk_scores[node_id] = user["risk_score"] / 100
            self.username_map[node_id] = username
        
        for tx in graph_data["transactions"]:
            self.graph.add_edge(tx["source"], tx["target"], amount=tx["amount"])
        
        if self.graph.number_of_nodes() == 0:
            self._initialize_graph_from_state()
        
        print(f"Graph initialized with {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} edges from database")

    def is_available(self) -> bool:
        return self.model is not None

    def predict(self, transaction_data: dict) -> dict:
        sender = transaction_data.get("sender_id", transaction_data.get("source", "UNKNOWN"))
        receiver = transaction_data.get("receiver_id", transaction_data.get("destination", "UNKNOWN"))
        amount = transaction_data.get("amount", 0)
        tx_type = transaction_data.get("type", "TRANSFER")

        sender, sender_info = UserRepository.get_or_create(sender, "User", 50.0)
        receiver, receiver_info = UserRepository.get_or_create(receiver, "User", 50.0)

        self.graph.add_node(sender, label=sender_info["username"] if sender_info else sender, type="account")
        self.graph.add_node(receiver, label=receiver_info["username"] if receiver_info else receiver, type="account")
        self.graph.add_edge(sender, receiver, amount=amount)
        
        if sender_info:
            self.username_map[sender] = sender_info["username"]
        if receiver_info:
            self.username_map[receiver] = receiver_info["username"]

        ml_prob = self._get_ml_probability(transaction_data)
        graph_metrics = self._calculate_graph_metrics(sender, receiver)
        
        self._propagate_risk(sender, receiver)
        
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
        
        self.node_risk_scores[sender] = self.node_risk_scores.get(sender, 0) * 0.8 + (risk / 100) * 0.2
        self.node_risk_scores[receiver] = self.node_risk_scores.get(receiver, 0) * 0.8 + (risk / 100) * 0.2
        
        tx_id = TransactionRepository.create(
            sender_id=sender,
            receiver_id=receiver,
            amount=amount,
            transaction_type=tx_type,
            is_flagged=is_fraud,
            fraud_probability=final_probability
        )

        graph_metrics["amount_boost"] = amount_boost
        graph_metrics["total_boost"] = round(graph_metrics["total_boost"] + amount_boost, 1)

        reasons = self._generate_reasons(transaction_data, ml_prob, graph_metrics)
        
        return {
            "is_fraud": is_fraud,
            "fraud_probability": round(final_probability, 2),
            "confidence": round(max(ml_prob, graph_metrics["base_confidence"]) * 100 / final_probability if final_probability > 0 else 0, 2),
            "risk_level": self._get_risk_level(final_probability),
            "recommendation": "block" if is_fraud else "allow",
            "reasons": reasons,
            "graph_metrics": graph_metrics,
            "transaction": {
                "sender": sender,
                "sender_name": self.username_map.get(sender, sender),
                "receiver": receiver,
                "receiver_name": self.username_map.get(receiver, receiver),
                "amount": amount,
                "tx_id": tx_id
            }
        }

    def _detect_money_muling(self, sender: str, receiver: str) -> dict:
        if sender not in self.graph or receiver not in self.graph:
            return {"detected": False, "chain_length": 0, "pattern": None}
        
        max_hops = 4
        try:
            undirected = self.graph.to_undirected()
            
            if nx.has_path(undirected, sender, receiver):
                path = nx.shortest_path(undirected, sender, receiver)
                if len(path) > 2:
                    return {
                        "detected": True,
                        "chain_length": len(path),
                        "pattern": "money_mule_chain",
                        "path": path
                    }
            
            paths_to_sink = 0
            if receiver in undirected:
                neighbors = list(undirected.neighbors(receiver))
                for neighbor in neighbors:
                    if neighbor != sender and nx.has_path(undirected, neighbor, receiver):
                        paths_to_sink += 1
            
            if paths_to_sink >= 3:
                return {
                    "detected": True,
                    "fan_in_count": paths_to_sink,
                    "pattern": "fan_in_sink",
                    "sink": receiver
                }
                
        except nx.NetworkXError:
            pass
        
        return {"detected": False, "chain_length": 0, "pattern": None}

    def _propagate_risk(self, sender: str, receiver: str, iterations: int = 2) -> None:
        if not self.graph.has_node(sender):
            self.node_risk_scores[sender] = 0.0
        if not self.graph.has_node(receiver):
            self.node_risk_scores[receiver] = 0.0
        
        sender_risk = self.node_risk_scores.get(sender, 0.0)
        receiver_risk = self.node_risk_scores.get(receiver, 0.0)
        
        for _ in range(iterations):
            risk_changes = {}
            
            for node in self.graph.nodes():
                if node in [sender, receiver]:
                    continue
                    
                neighbors = list(self.graph.neighbors(node))
                if not neighbors:
                    continue
                
                neighbor_risks = [self.node_risk_scores.get(n, 0.0) for n in neighbors]
                avg_neighbor_risk = sum(neighbor_risks) / len(neighbor_risks)
                
                current_risk = self.node_risk_scores.get(node, 0.0)
                propagated = current_risk * 0.7 + avg_neighbor_risk * 0.3
                risk_changes[node] = propagated
            
            for node, new_risk in risk_changes.items():
                self.node_risk_scores[node] = new_risk

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
        mule_boost = 0.0
        fan_in_boost = 0.0
        
        if sender in self.graph:
            sender_degree = self.graph.out_degree(sender) + self.graph.in_degree(sender)
        else:
            sender_degree = 0
        if receiver in self.graph:
            receiver_degree = self.graph.out_degree(receiver) + self.graph.in_degree(receiver)
        else:
            receiver_degree = 0
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
        cycle_nodes = []
        if new_edge_creates_cycle:
            cycle_boost = 30.0
            try:
                for cycle in nx.simple_cycles(self.graph):
                    if sender in cycle and receiver in cycle and len(cycle) >= 2:
                        cycle_nodes = cycle
                        break
            except:
                pass
        
        mule_detection = self._detect_money_muling(sender, receiver)
        if mule_detection["detected"]:
            if mule_detection["pattern"] == "money_mule_chain":
                mule_boost = 35.0
            elif mule_detection["pattern"] == "fan_in_sink":
                fan_in_boost = 25.0
        
        eigen_risk = 0.0
        if sender in self.node_risk_scores:
            eigen_risk += self.node_risk_scores[sender]
        if receiver in self.node_risk_scores:
            eigen_risk += self.node_risk_scores[receiver]
        eigen_boost = eigen_risk * 15
        
        return {
            "degree_boost": round(degree_boost, 1),
            "clustering_boost": round(clustering_boost, 1),
            "cycle_boost": round(cycle_boost, 1),
            "mule_boost": round(mule_boost, 1),
            "fan_in_boost": round(fan_in_boost, 1),
            "eigen_risk_boost": round(eigen_boost, 1),
            "total_boost": round(degree_boost + clustering_boost + cycle_boost + mule_boost + fan_in_boost + eigen_boost, 1),
            "degree": max_degree,
            "clustering": round(clustering_coef * 100, 1),
            "cycle_detected": cycle_boost > 0,
            "cycle_nodes": cycle_nodes if cycle_nodes else [],
            "mule_detected": mule_detection["detected"],
            "mule_pattern": mule_detection.get("pattern"),
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

    def _generate_reasons(self, data: dict, ml_prob: float, graph_metrics: dict) -> list:
        reasons = []
        
        amount = data.get("amount", 0)
        if amount > 10_000_000:
            reasons.append({"factor": "Amount Anomaly", "detail": f"${amount:,.0f} exceeds $10M threshold", "weight": 40})
        elif amount > 1_000_000:
            reasons.append({"factor": "Amount Anomaly", "detail": f"${amount:,.0f} exceeds $1M threshold", "weight": 20})
        elif amount > 250_000:
            reasons.append({"factor": "Large Transaction", "detail": f"${amount:,.0f} exceeds $250K", "weight": 10})
            
        if graph_metrics.get("cycle_detected"):
            reasons.append({"factor": "Graph Cycle", "detail": "Circular fund flow detected", "weight": 30})
            
        if graph_metrics.get("mule_detected"):
            pattern = graph_metrics.get("mule_pattern")
            if pattern == "money_mule_chain":
                reasons.append({"factor": "Money Mule Chain", "detail": "Long chain of intermediaries detected", "weight": 35})
            elif pattern == "fan_in_sink":
                reasons.append({"factor": "Fan-In Pattern", "detail": "Multiple sources funneling to single sink", "weight": 25})
            
        if graph_metrics.get("degree_boost", 0) >= 10:
            reasons.append({"factor": "High Degree Node", "detail": f"Degree {graph_metrics.get('degree')} exceeds hub threshold", "weight": 10})
        elif graph_metrics.get("degree_boost", 0) >= 5:
            reasons.append({"factor": "Elevated Degree", "detail": f"Degree {graph_metrics.get('degree')} above average", "weight": 5})
            
        if graph_metrics.get("clustering_boost", 0) >= 10:
            reasons.append({"factor": "Dense Cluster", "detail": f"{graph_metrics.get('clustering')}% clustering - fraud ring pattern", "weight": 10})
        
        eigen_boost = graph_metrics.get("eigen_risk_boost", 0)
        if eigen_boost > 10:
            reasons.append({"factor": "Eigen-Risk Propagation", "detail": "Connected to high-risk nodes in network", "weight": eigen_boost})
            
        if ml_prob > 70:
            reasons.append({"factor": "ML Model Alert", "detail": f"{ml_prob:.1f}% probability from trained model", "weight": ml_prob * 0.7})
        elif ml_prob > 50:
            reasons.append({"factor": "ML Model Flag", "detail": f"{ml_prob:.1f}% model suspicion", "weight": ml_prob * 0.5})
            
        reasons.sort(key=lambda x: x["weight"], reverse=True)
        return reasons[:4]
    
    def _get_risk_level(self, fraud_prob: float) -> str:
        if fraud_prob >= 75:
            return "critical"
        elif fraud_prob >= 50:
            return "high"
        elif fraud_prob >= 25:
            return "medium"
        return "low"

    def get_graph_state(self) -> dict:
        graph_data = TransactionRepository.get_graph_data()
        
        nodes = []
        for user in graph_data["users"]:
            nodes.append({
                "id": user["id"],
                "type": user["user_type"].lower(),
                "label": user["username"],
                "risk": user["risk_score"],
                "is_system": user.get("is_system", 0) == 1,
                "tooltip": f"0x{user['id'][2:]}" if user["id"].startswith("0x") else user["id"]
            })
        
        edges = []
        for tx in graph_data["transactions"]:
            edges.append({
                "source": tx["source"],
                "target": tx["target"],
                "amount": tx["amount"],
                "isFlagged": tx["is_flagged"] == 1
            })
        
        return {
            "nodes": nodes,
            "edges": edges,
            "node_risks": {k: round(v, 3) for k, v in self.node_risk_scores.items()},
            "stats": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "high_risk_nodes": sum(1 for user in graph_data["users"] if user["risk_score"] > 70),
                "network_avg_risk": round(sum(user["risk_score"] for user in graph_data["users"]) / max(len(graph_data["users"]), 1), 1)
            }
        }

    def get_graph_analytics(self) -> dict:
        graph_data = TransactionRepository.get_graph_data()
        
        self.graph = nx.DiGraph()
        for user in graph_data["users"]:
            self.graph.add_node(user["id"], label=user["username"], type=user["user_type"])
        for tx in graph_data["transactions"]:
            self.graph.add_edge(tx["source"], tx["target"], amount=tx["amount"])
        
        cycles = []
        cycle_nodes = set()
        try:
            undirected = self.graph.to_undirected()
            for cycle in nx.simple_cycles(self.graph):
                if len(cycle) >= 2:
                    cycle_labels = [self.username_map.get(n, n) for n in cycle]
                    cycle_path = " -> ".join(cycle_labels[:4])
                    if len(cycle) > 4:
                        cycle_path += f" -> ... ({len(cycle)} nodes)"
                    else:
                        cycle_path += f" -> {cycle_labels[0]}"
                    cycles.append({
                        "path": cycle_path,
                        "nodes": cycle,
                        "length": len(cycle),
                        "risk": round(sum(self.node_risk_scores.get(n, 0.5) for n in cycle) / len(cycle) * 100, 1)
                    })
                    cycle_nodes.update(cycle)
        except Exception as e:
            print(f"Cycle detection error: {e}")
        
        node_analytics = []
        undirected = self.graph.to_undirected()
        for node in self.graph.nodes():
            degree = self.graph.degree(node)
            try:
                clustering = nx.clustering(undirected, node)
            except:
                clustering = 0
            try:
                pagerank = nx.pagerank(self.graph, alpha=0.85).get(node, 0)
            except:
                pagerank = 0
            
            node_analytics.append({
                "id": node,
                "label": self.username_map.get(node, node),
                "degree": degree,
                "clustering": round(clustering * 100, 1),
                "pagerank": round(pagerank * 1000, 2),
                "risk": round(self.node_risk_scores.get(node, 0.5) * 100, 1),
                "in_cycle": node in cycle_nodes
            })
        
        node_analytics.sort(key=lambda x: x["degree"], reverse=True)
        top_hubs = node_analytics[:5]
        top_clusters = sorted(node_analytics, key=lambda x: x["clustering"], reverse=True)[:5]
        
        try:
            density = nx.density(self.graph.to_undirected())
        except:
            density = 0
        
        return {
            "cycles": cycles,
            "cycle_count": len(cycles),
            "nodes_in_cycles": list(cycle_nodes),
            "top_hubs": top_hubs,
            "top_clusters": top_clusters,
            "network_density": round(density, 4),
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges()
        }

    def simulate_attack_ring(self, num_nodes: int = 8) -> dict:
        prefix = f"0x{random.randint(0, 16**8):08x}"
        nodes = []
        edges = []
        
        for i in range(num_nodes):
            node_id = UserRepository.create(
                f"Fraud Node {i+1}",
                "Fraudulent",
                random.randint(70, 99)
            )
            label = f"Fraud Node {i+1}"
            risk_score = random.randint(70, 99)
            nodes.append({"id": node_id, "label": label, "risk": risk_score})
            self.node_risk_scores[node_id] = risk_score / 100
            self.username_map[node_id] = label
            self.graph.add_node(node_id, label=label, type="fraud")
        
        patterns = ["cycle", "hub", "fan_in"]
        pattern = random.choice(patterns)
        
        for i in range(num_nodes):
            if pattern == "cycle":
                next_i = (i + 1) % num_nodes
                edge_source, edge_target = nodes[i]["id"], nodes[next_i]["id"]
            elif pattern == "hub":
                hub_idx = num_nodes // 2
                if i != hub_idx:
                    edge_source, edge_target = nodes[i]["id"], nodes[hub_idx]["id"]
                else:
                    continue
            else:
                sink_idx = num_nodes - 1
                if i != sink_idx:
                    edge_source, edge_target = nodes[i]["id"], nodes[sink_idx]["id"]
                else:
                    continue
            
            amount = random.randint(50000, 500000)
            edges.append({"source": edge_source, "target": edge_target, "amount": amount})
            self.graph.add_edge(edge_source, edge_target, amount=amount)
            
            TransactionRepository.create(
                sender_id=edge_source,
                receiver_id=edge_target,
                amount=amount,
                transaction_type="TRANSFER",
                is_flagged=True,
                fraud_probability=risk_score
            )
        
        return {
            "pattern": pattern,
            "nodes_created": len(nodes),
            "edges_created": len(edges),
            "risk_score": random.randint(75, 99),
            "description": f"Simulated {pattern.replace('_', ' ')} attack ring with {num_nodes} nodes"
        }

    def reset_graph(self) -> dict:
        from .db_models import TransactionRepository, UserRepository
        
        self.graph = nx.DiGraph()
        self.node_risk_scores = {}
        self.username_map = {}
        
        try:
            TransactionRepository.clear_all()
            UserRepository.clear_non_seed()
        except Exception as e:
            print(f"Error clearing database: {e}")
        
        seed_database()
        self._initialize_graph_from_db()
        
        return {
            "status": "success",
            "message": "Graph reset successfully"
        }


ml_service = MLService()
