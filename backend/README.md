# Forensic Lens Backend API

FastAPI-based backend for the Forensic Lens fraud detection dashboard with integrated XGBoost ML model.

## Quick Start

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 3001
```

The API will be available at `http://localhost:3001`

## API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:3001/docs
- **ReDoc:** http://localhost:3001/redoc

## Endpoints

### Health Check
```
GET /health
```
Returns API status and ML model availability.

### Alerts
```
GET /api/alerts
```
Returns list of all fraud alerts sorted by timestamp.

```
GET /api/alerts/{alert_id}
```
Returns specific alert details.

### Transaction Nodes
```
GET /api/nodes
```
Returns all transaction graph nodes.

```
GET /api/nodes/{node_id}
```
Returns specific node details.

### ML Prediction (Core Feature)
```
POST /api/predict
```

Real-time fraud prediction using the XGBoost ML model.

**Request Body:**
```json
{
  "source": "ACC1",
  "destination": "ACC2",
  "amount": 99900,
  "type": "TRANSFER",
  "oldbalanceOrg": 100000,
  "newbalanceOrig": 100,
  "oldbalanceDest": 0,
  "newbalanceDest": 99900
}
```

**Response:**
```json
{
  "is_fraud": true,
  "fraud_probability": 79.47,
  "confidence": 95.2,
  "risk_level": "critical",
  "recommendation": "block"
}
```

**Transaction Types:** `TRANSFER`, `CASH_OUT`, `PAYMENT`, `CASH_IN`, `DEBIT`

## ML Model

The backend integrates a pre-trained XGBoost fraud detection model with 16 features:
- `step` - Transaction step/time
- `amount` - Transaction amount
- `oldbalanceOrg` / `newbalanceOrig` - Originator balance before/after
- `oldbalanceDest` / `newbalanceDest` - Destination balance before/after
- `isFlaggedFraud` - System flag for large transactions
- `orig_diff` / `dest_diff` - Balance change calculations
- `orig_zero` / `dest_zero` - Zero balance flags
- `isHighRiskType` - Flag for TRANSFER/CASH_OUT
- `type_CASH_OUT`, `type_DEBIT`, `type_PAYMENT`, `type_TRANSFER` - One-hot encoding

The model detects:
- Structuring (transactions just under reporting thresholds)
- Money laundering patterns
- Velocity anomalies
- High-risk transaction types

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app & endpoints
│   ├── models.py        # Pydantic models
│   ├── mock_data.py     # Mock alerts & nodes
│   └── ml_service.py    # ML prediction service
├── Model/               # ML model files (from parent dir)
│   ├── model.pkl
│   └── columns.pkl
├── venv/                # Virtual environment
├── requirements.txt
├── .gitignore
└── README.md
```

## Requirements

- Python 3.11+
- fastapi>=0.109.0
- uvicorn[standard]>=0.27.0
- pydantic>=2.5.0
- scikit-learn>=1.3.0
- pandas>=2.0.0
- xgboost>=2.0.0
