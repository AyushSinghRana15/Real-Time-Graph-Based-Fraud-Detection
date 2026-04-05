from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime
from .mock_data import graph_state
from .models import Alert
from .ml_service import ml_service
from .llm_service import generate_advice
from .crypto_service import crypto_service

alerts_cache = []
transactions_cache = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Forensic Lens API...")
    print(f"ML Model available: {ml_service.is_available()}")
    print(f"Graph nodes: {len(graph_state.nodes)}, Edges: {len(graph_state.edges)}")
    
    try:
        print("Fetching live crypto data from CoinGecko...")
        transactions_cache.extend(await crypto_service.get_transactions_for_fraud_detection(100))
        alerts_cache.extend(crypto_service.generate_alerts_from_transactions(transactions_cache))
        print(f"Loaded {len(transactions_cache)} transactions, {len(alerts_cache)} alerts")
    except Exception as e:
        print(f"Warning: Could not fetch live data: {e}")
        print("Using fallback mock data")
        from .mock_data import MOCK_ALERTS
        alerts_cache.extend(MOCK_ALERTS)
    
    yield
    
    await crypto_service.close()
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
    reasons: list
    graph_metrics: dict
    transaction: dict


class AdviceRequest(BaseModel):
    transaction: dict
    ml_result: dict


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "ml_model_available": ml_service.is_available(),
        "graph_nodes": len(graph_state.nodes),
        "graph_edges": len(graph_state.edges),
        "live_data_source": "coingecko" if transactions_cache else "mock"
    }


@app.get("/api/alerts", response_model=list[dict])
def get_alerts():
    if alerts_cache:
        return alerts_cache
    from .mock_data import MOCK_ALERTS
    return MOCK_ALERTS


@app.get("/api/alerts/{alert_id}")
def get_alert(alert_id: str):
    for alert in alerts_cache:
        if alert.id == alert_id:
            return alert
    from .mock_data import MOCK_ALERTS
    for alert in MOCK_ALERTS:
        if alert.id == alert_id:
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")


@app.get("/api/transactions")
def get_transactions():
    return transactions_cache


@app.get("/api/nodes")
def get_nodes():
    return graph_state.nodes


@app.get("/api/edges")
def get_edges():
    return graph_state.get_edges_for_graph()


@app.get("/api/graph/state")
def get_graph_state():
    return ml_service.get_graph_state()


@app.get("/api/nodes/{node_id}")
def get_node(node_id: str):
    for node in graph_state.nodes:
        if node.id == node_id:
            return node
    raise HTTPException(status_code=404, detail="Node not found")


@app.post("/api/predict", response_model=PredictionResult)
def predict_fraud(transaction: TransactionPredict):
    transaction_dict = transaction.model_dump()
    result = ml_service.predict(transaction_dict)
    return result


@app.post("/api/advice")
def get_advice(request: AdviceRequest):
    advice = generate_advice(request.transaction, request.ml_result)
    return {"advice": advice}


@app.post("/api/refresh-data")
async def refresh_live_data():
    global alerts_cache, transactions_cache
    transactions_cache = []
    alerts_cache = []
    
    try:
        transactions_cache.extend(await crypto_service.get_transactions_for_fraud_detection(100))
        alerts_cache.extend(crypto_service.generate_alerts_from_transactions(transactions_cache))
        return {
            "status": "success",
            "transactions_loaded": len(transactions_cache),
            "alerts_generated": len(alerts_cache)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
