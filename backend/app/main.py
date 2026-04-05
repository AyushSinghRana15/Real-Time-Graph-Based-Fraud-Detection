from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime
from .mock_data import MOCK_ALERTS, MOCK_NODES
from .models import Alert, TransactionNode
from .ml_service import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Forensic Lens API...")
    print(f"ML Model available: {ml_service.is_available()}")
    print(f"Graph nodes: {ml_service.graph.number_of_nodes()}")
    yield
    print("Shutting down Forensic Lens API...")


app = FastAPI(title="Forensic Lens API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TransactionPredict(BaseModel):
    sender_id: str
    receiver_id: str
    amount: float
    type: Literal["TRANSFER", "CASH_OUT", "PAYMENT", "CASH_IN", "DEBIT"]
    oldbalanceOrg: Optional[float] = 0
    newbalanceOrig: Optional[float] = 0
    oldbalanceDest: Optional[float] = 0
    newbalanceDest: Optional[float] = 0


class PredictionResult(BaseModel):
    is_fraud: bool
    fraud_probability: float
    confidence: float
    risk_level: str
    recommendation: str
    graph_metrics: dict
    transaction: dict


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "ml_model_available": ml_service.is_available(),
        "graph_nodes": ml_service.graph.number_of_nodes(),
        "graph_edges": ml_service.graph.number_of_edges()
    }


@app.get("/api/alerts", response_model=list[Alert])
def get_alerts():
    return MOCK_ALERTS


@app.get("/api/alerts/{alert_id}", response_model=Alert)
def get_alert(alert_id: str):
    for alert in MOCK_ALERTS:
        if alert.id == alert_id:
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")


@app.get("/api/nodes", response_model=list[TransactionNode])
def get_nodes():
    return MOCK_NODES


@app.get("/api/nodes/{node_id}", response_model=TransactionNode)
def get_node(node_id: str):
    for node in MOCK_NODES:
        if node.id == node_id:
            return node
    raise HTTPException(status_code=404, detail="Node not found")


@app.post("/api/predict", response_model=PredictionResult)
def predict_fraud(transaction: TransactionPredict):
    transaction_dict = transaction.model_dump()
    result = ml_service.predict(transaction_dict)
    return result


@app.get("/api/graph/state")
def get_graph_state():
    return ml_service.get_graph_state()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
