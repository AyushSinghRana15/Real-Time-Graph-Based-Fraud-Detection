import random
from datetime import datetime, timedelta
from typing import Optional
from .models import Alert, TransactionNode

ENTITY_NAMES = [
    "Acme Holdings Ltd", "Quantum Ventures", "Nexus Capital", "Vertex Solutions",
    "Meridian Trust Co", "Atlas Enterprises", "Pinnacle Finance", "Horizon Partners",
    "Summit Group", "Eclipse Holdings", "Sterling Corp", "Vanguard Services"
]

INDICATORS = [
    "Unusual transaction velocity", "Cross-border routing detected", "PEP association flagged",
    "Sanctions list proximity", "Structuring pattern detected", "Shell company network",
    "Rapid fund movement", "Mismatched beneficiary data", "Layering detected",
    "High-risk jurisdiction origin", "Frequency anomaly", "Amount threshold breach"
]

class GraphState:
    def __init__(self):
        self.nodes: list[TransactionNode] = []
        self.edges: dict[tuple[str, str], dict] = {}
        self._initialize_from_entities()
    
    def _initialize_from_entities(self):
        for i, name in enumerate(ENTITY_NAMES):
            node_id = f"ENT-{100 + i:03d}"
            num_connections = random.randint(1, 3)
            connections = []
            
            for j in range(num_connections):
                target_idx = (i + j + 1) % len(ENTITY_NAMES)
                target_id = f"ENT-{100 + target_idx:03d}"
                if target_id not in connections:
                    connections.append(target_id)
                    self.edges[(node_id, target_id)] = {"amount": round(random.uniform(1000, 100000), 2)}
            
            self.nodes.append(TransactionNode(
                id=node_id,
                type="account",
                label=name,
                risk=random.randint(0, 100),
                connections=connections
            ))
    
    def add_edge(self, source_id: str, target_id: str, amount: float, risk: int = 50) -> tuple[TransactionNode, TransactionNode]:
        if not any(n.id == source_id for n in self.nodes):
            self.nodes.append(TransactionNode(
                id=source_id,
                type="account",
                label=source_id,
                risk=risk,
                connections=[]
            ))
        
        if not any(n.id == target_id for n in self.nodes):
            self.nodes.append(TransactionNode(
                id=target_id,
                type="account",
                label=target_id,
                risk=risk,
                connections=[]
            ))
        
        for node in self.nodes:
            if node.id == source_id and target_id not in node.connections:
                node.connections.append(target_id)
        
        self.edges[(source_id, target_id)] = {"amount": amount}
        
        source_node = next(n for n in self.nodes if n.id == source_id)
        target_node = next(n for n in self.nodes if n.id == target_id)
        
        return source_node, target_node
    
    def get_edges_for_graph(self) -> list[dict]:
        return [
            {"source": s, "target": t, **data}
            for (s, t), data in self.edges.items()
        ]
    
    def reset(self):
        self.nodes = []
        self.edges = {}
        self._initialize_from_entities()


graph_state = GraphState()


def generate_alerts(count: int = 20) -> list[Alert]:
    alerts = []
    for i in range(count):
        rand = random.random()
        alert_type = "high_risk" if rand < 0.25 else "medium_risk" if rand < 0.5 else "low_risk" if rand < 0.8 else "info"
        
        confidence = (
            random.uniform(85, 100) if alert_type == "high_risk"
            else random.uniform(60, 85) if alert_type == "medium_risk"
            else random.uniform(30, 60) if alert_type == "low_risk"
            else random.uniform(10, 30)
        )
        
        num_indicators = 3 if alert_type == "high_risk" else 2 if alert_type == "medium_risk" else 1
        
        days_ago = random.randint(0, 7)
        hours_ago = random.randint(0, 23)
        timestamp = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        
        reasons = []
        if alert_type == "high_risk":
            reasons = [
                {"factor": "Large Transaction", "detail": f"${round(random.uniform(100000, 500000), 0):,.0f} exceeds $100K threshold", "weight": 40},
                {"factor": "Unusual Velocity", "detail": "Multiple high-value transactions in short timeframe", "weight": 30},
                {"factor": "Pattern Match", "detail": "Matches known fraud scheme patterns", "weight": 25}
            ]
        elif alert_type == "medium_risk":
            reasons = [
                {"factor": "Velocity Anomaly", "detail": "Transaction frequency exceeds baseline", "weight": 25},
                {"factor": "Amount Threshold", "detail": f"${round(random.uniform(50000, 100000), 0):,.0f} exceeds typical range", "weight": 20}
            ]
        
        alerts.append(Alert(
            id=f"ALT-{1000 + i}",
            type=alert_type,
            entityId=f"ENT-{100 + i:03d}",
            entityName=ENTITY_NAMES[i % len(ENTITY_NAMES)],
            amount=round(random.uniform(1000, 500000), 2),
            timestamp=timestamp.isoformat(),
            description=f"Suspicious activity detected for {ENTITY_NAMES[i % len(ENTITY_NAMES)]} involving transaction patterns consistent with {'known fraud schemes' if alert_type == 'high_risk' else 'atypical behavior'}.",
            indicators=random.sample(INDICATORS, num_indicators),
            confidence=round(confidence, 2),
            reasons=reasons
        ))
    
    return sorted(alerts, key=lambda x: x.timestamp, reverse=True)


MOCK_ALERTS = generate_alerts(20)
MOCK_NODES = graph_state.nodes
