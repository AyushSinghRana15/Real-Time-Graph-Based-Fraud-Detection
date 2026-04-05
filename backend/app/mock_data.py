import random
from datetime import datetime, timedelta
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
        
        alerts.append(Alert(
            id=f"ALT-{1000 + i}",
            type=alert_type,
            entityId=f"ENT-{100 + i:03d}",
            entityName=ENTITY_NAMES[i % len(ENTITY_NAMES)],
            amount=round(random.uniform(1000, 500000), 2),
            timestamp=timestamp.isoformat(),
            description=f"Suspicious activity detected for {ENTITY_NAMES[i % len(ENTITY_NAMES)]} involving transaction patterns consistent with {'known fraud schemes' if alert_type == 'high_risk' else 'atypical behavior'}.",
            indicators=random.sample(INDICATORS, num_indicators),
            confidence=round(confidence, 2)
        ))
    
    return sorted(alerts, key=lambda x: x.timestamp, reverse=True)

def generate_nodes() -> list[TransactionNode]:
    nodes = []
    for i, name in enumerate(ENTITY_NAMES):
        node_id = f"ENT-{100 + i:03d}"
        num_connections = random.randint(1, 3)
        connections = []
        
        for j in range(num_connections):
            target_idx = (i + j + 1) % len(ENTITY_NAMES)
            target_id = f"ENT-{100 + target_idx:03d}"
            if target_id not in connections:
                connections.append(target_id)
        
        nodes.append(TransactionNode(
            id=node_id,
            type="account",
            label=name,
            risk=random.randint(0, 100),
            connections=connections
        ))
    
    return nodes

MOCK_ALERTS = generate_alerts(20)
MOCK_NODES = generate_nodes()
