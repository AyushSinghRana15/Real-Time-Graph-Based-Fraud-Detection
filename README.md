# Forensic Lens - Fraud Detection Command Center

A premium enterprise-grade fraud detection system with a structured "Command Center" layout. Combines ML predictions, graph intelligence, and LLM-powered investigation in an immersive 3D visualization interface.

## Architecture

### Frontend - Command Center Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COMMAND HEADER                               │
│  [Logo] [Live] │ Dashboard │ Network │ Sandbox │ Archived  │ [KPIs] [User] │
├──────────────┬──────────────────────────────────────┬───────────────┤
│              │                                      │               │
│   ALERT      │                                      │   CONTEXT     │
│   FEED       │          3D GRAPH CANVAS            │   PANEL       │
│              │                                      │               │
│  - Critical  │     ┌─────────────────────┐         │  - Entity     │
│  - Suspicious│     │    ForceGraph3D    │         │  - Confidence │
│  - Review    │     │   Transaction Net  │         │  - Reasons    │
│              │     └─────────────────────┘         │  - Actions    │
│              │                                      │               │
└──────────────┴──────────────────────────────────────┴───────────────┘
```

### Backend - Hybrid Inference Engine

```
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │ ML Service  │ │ LLM Service │ │  Graph Service      │  │
│  │  (XGBoost)  │ │ (OpenRouter)│ │   (NetworkX)        │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│        │               │                   │                 │
│        ▼               ▼                   ▼                 │
│  ┌─────────┐    ┌───────────┐      ┌────────────┐        │
│  │ model.pkl│   │ OpenRouter│      │  DiGraph   │        │
│  │(16 feats)│   │   API     │      │(cycle det) │        │
│  └─────────┘    └───────────┘      └────────────┘        │
│        │                                 │                  │
│        └─────────────┬───────────────────┘                  │
│                      ▼                                       │
│              ┌─────────────────┐                             │
│              │  Risk Reasons   │                             │
│              │  Justification  │                             │
│              └─────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Command Center Layout
- **Pinned Alert Feed** - Left glass pillar with categorized alerts (Critical/Suspicious/Review)
- **3D Graph Canvas** - Full-bleed immersive transaction network visualization
- **Context Panel** - Right column with entity details, risk justification, and action buttons
- **Command Header** - Integrated navigation + KPIs in cohesive header bar

### Hybrid Intelligence
- **XGBoost ML** - Pre-trained fraud detection model with 16 features
- **Graph Analysis** - NetworkX for cycle detection, clustering, degree centrality
- **LLM Forensics** - OpenRouter-powered investigation and analysis reports

### Risk Justification
Each alert displays top 3 contributing factors with:
- Semantic naming (Amount Anomaly, Graph Cycle, High Risk Account)
- Weight bars showing relative importance
- Detailed explanations for compliance review

### Neural Sandbox (Focus Mode)
Full-screen workspace when in Sandbox tab:
- LLM Chat interface for forensic analysis
- ML Diagnostics with feature importance charts
- Quick actions for simulation and analysis

### Live Data
- Fetches real-time crypto transaction data from CoinGecko API
- Generates risk indicators based on transaction patterns
- `/api/refresh-data` endpoint for manual refresh

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Framer Motion, Three.js (ForceGraph3D) |
| Backend | FastAPI, Python 3.10+ |
| ML | XGBoost, scikit-learn |
| Graph | NetworkX (cycle detection, clustering) |
| LLM | OpenRouter API (claude-3-haiku) |
| Data | CoinGecko API (live crypto data) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Hybrid ML + Graph fraud prediction |
| `/api/advice` | POST | LLM forensic analysis |
| `/api/alerts` | GET | Recent fraud alerts (from CoinGecko) |
| `/api/transactions` | GET | Live crypto transactions |
| `/api/nodes` | GET | Graph nodes |
| `/api/edges` | GET | Graph edges |
| `/api/graph/state` | GET | Full graph state |
| `/api/refresh-data` | POST | Refresh live data from CoinGecko |
| `/health` | GET | Health check |

## Prediction Engine

### Hybrid Scoring Formula
```
final_score = ml_probability * 0.7 + graph_boost * 0.3 + amount_boost
```

### Graph Boosts
| Condition | Boost |
|-----------|-------|
| Degree > 3 | +5% |
| Degree > 5 | +10% |
| Clustering > 0.4 | +10% |
| Cycle Detected | +30% |

### Amount Thresholds
| Amount | Boost |
|--------|-------|
| > $250K | +10% |
| > $1M | +20% |
| > $10M | +40% |

### Fraud Threshold
Score ≥ 70% triggers high-risk alert.

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- OpenRouter API key

### Backend Setup

```bash
cd backend
cp .env.example .env  # Add your OPENROUTER_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Model Files
Place trained model files in:
- `backend/Model/model.pkl` - XGBoost model
- `backend/Model/columns.pkl` - Feature column names

## Environment Variables

```bash
# backend/.env
OPENROUTER_API_KEY=sk-or-v1-...
```
