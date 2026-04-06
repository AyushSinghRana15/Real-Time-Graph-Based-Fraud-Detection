from contextlib import asynccontextmanager
import asyncio
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Literal, Optional, Any
from datetime import datetime
from .mock_data import graph_state
from .models import Alert
from .ml_service import ml_service
from .llm_service import generate_advice
from .crypto_service import crypto_service

alerts_cache = []
transactions_cache = []

FRONTEND_BUILD_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Forensic Lens API...")
    print(f"ML Model available: {ml_service.is_available()}")
    print(f"Graph nodes: {len(graph_state.nodes)}, Edges: {len(graph_state.edges)}")
    
    # Initialize with mock data first to ensure instant startup
    from .mock_data import MOCK_ALERTS
    alerts_cache.extend(MOCK_ALERTS)
    
    # Run live data fetch in background to avoid blocking the server startup
    async def fetch_background_data():
        try:
            print("Background: Fetching live crypto data from CoinGecko...")
            live_transactions = await crypto_service.get_transactions_for_fraud_detection(50)
            if live_transactions:
                transactions_cache.clear()
                transactions_cache.extend(live_transactions)
                raw_alerts = crypto_service.generate_alerts_from_transactions(live_transactions)
                
                # Update cache with valid Pydantic objects
                alerts_cache.clear()
                alerts_cache.extend([Alert(**a) for a in raw_alerts])
                print(f"Background: Loaded {len(transactions_cache)} live transactions, {len(alerts_cache)} alerts")
            else:
                print("Background: Using mock data (no live transactions).")
        except Exception as e:
            print(f"Background: Using mock data (CoinGecko unavailable: {type(e).__name__}).")

    asyncio.create_task(fetch_background_data())
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

# Serve frontend in production
@app.get("/")
async def serve_frontend():
    index_path = os.path.join(FRONTEND_BUILD_PATH, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not built. Run 'cd frontend && npm run build' first."}

# Mount static files
if os.path.exists(FRONTEND_BUILD_PATH):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_BUILD_PATH, "assets")), name="assets")


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
        return [alert.model_dump() if hasattr(alert, 'model_dump') else alert for alert in alerts_cache]
    from .mock_data import MOCK_ALERTS
    return [alert.model_dump() for alert in MOCK_ALERTS]


@app.get("/api/alerts/{alert_id}")
def get_alert(alert_id: str):
    for alert in alerts_cache:
        alert_id_val = alert.id if hasattr(alert, 'id') else alert.get('id')
        if alert_id_val == alert_id:
            return alert
    from .mock_data import MOCK_ALERTS
    for alert in MOCK_ALERTS:
        if alert.id == alert_id:
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")


@app.get("/api/transactions")
def get_transactions():
    from .db_models import TransactionRepository
    return TransactionRepository.get_recent_transactions(100)


@app.get("/api/nodes")
def get_nodes():
    from .db_models import UserRepository
    users = UserRepository.get_all()
    return [
        {
            "id": u["id"],
            "type": u["user_type"].lower(),
            "label": u["username"],
            "risk": u["risk_score"],
            "connections": []
        }
        for u in users
    ]


@app.get("/api/edges")
def get_edges():
    from .db_models import TransactionRepository
    txns = TransactionRepository.get_all()
    return [{"source": t["sender_id"], "target": t["receiver_id"], "amount": t["amount"]} for t in txns]


@app.get("/api/graph/state")
def get_graph_state():
    return ml_service.get_graph_state()


@app.get("/api/graph/analytics")
def get_graph_analytics():
    return ml_service.get_graph_analytics()


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
        raw_alerts = crypto_service.generate_alerts_from_transactions(transactions_cache)
        alerts_cache.extend([Alert(**a) for a in raw_alerts])
        return {
            "status": "success",
            "transactions_loaded": len(transactions_cache),
            "alerts_generated": len(alerts_cache)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


@app.post("/api/simulate-attack")
def simulate_attack():
    result = ml_service.simulate_attack_ring(num_nodes=8)
    return result


@app.post("/api/graph/reset")
def reset_graph():
    result = ml_service.reset_graph()
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
