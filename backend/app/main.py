from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from .mock_data import MOCK_ALERTS, MOCK_NODES
from .models import Alert, TransactionNode

app = FastAPI(title="Forensic Lens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4173",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/alerts", response_model=list[Alert])
def get_alerts():
    return MOCK_ALERTS

@app.get("/api/alerts/{alert_id}", response_model=Alert)
def get_alert(alert_id: str):
    for alert in MOCK_ALERTS:
        if alert.id == alert_id:
            return alert
    return {"error": "Alert not found"}

@app.get("/api/nodes", response_model=list[TransactionNode])
def get_nodes():
    return MOCK_NODES

@app.get("/api/nodes/{node_id}", response_model=TransactionNode)
def get_node(node_id: str):
    for node in MOCK_NODES:
        if node.id == node_id:
            return node
    return {"error": "Node not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
