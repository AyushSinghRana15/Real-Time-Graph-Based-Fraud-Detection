# Forensic Lens - Real-Time Fraud Detection System

A premium enterprise-grade fraud detection system with a **Forensic Lab UI**. Combines ML predictions, graph intelligence, and LLM-powered investigation in an immersive 3D visualization interface.

![Forensic Lens](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![React](https://img.shields.io/badge/React-18-blue)

## Architecture

### Frontend - Forensic Lab Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MAGNETIC FLOATING ISLAND                            │
│  [FORENSIC LENS ●LIVE] │ DASHBOARD │ NETWORK │ SANDBOX │ ABOUT │ [KPIs] │
├──────────────┬────────────────────────────────────────┬─────────────────┤
│              │                                        │                 │
│   ALERT      │                                        │   CONTEXT       │
│   FEED       │          3D GRAPH CANVAS               │   PANEL         │
│              │                                        │                 │
│  - Critical  │     ┌─────────────────────┐           │  - Entity       │
│  - High      │     │   ForceGraph3D      │           │  - Risk Score   │
│  - Medium    │     │  Transaction Network │           │  - Reasons      │
│  - Info      │     │  + Cycle Highlight  │           │  - Actions      │
│              │     └─────────────────────┘           │                 │
└──────────────┴────────────────────────────────────────┴─────────────────┘
```

### Backend - Hybrid Inference Engine

```
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │ ML Service  │ │ LLM Service │ │   DB Service        │  │
│  │  (XGBoost) │ │ (OpenRouter)│ │   (SQLite)          │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│        │               │                   │                 │
│        ▼               ▼                   ▼                 │
│  ┌─────────┐    ┌───────────┐      ┌────────────┐        │
│  │ model.pkl│   │ Gemma 3B  │      │  DiGraph   │        │
│  │(16 feats)│   │   API     │      │(cycle det) │        │
│  └─────────┘    └───────────┘      └────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 3D Graph Visualization
- **ForceGraph3D** - Immersive 3D transaction network with auto-rotate
- **Cycle Node Highlighting** - Red glowing nodes indicate fraud ring members
- **Risk-Based Sizing** - Higher risk = larger nodes with glowing effects
- **Link Directionality** - Animated particles showing transaction flow

### Graph Analytics Panel
- **Fraud Ring Detection** - Identifies and displays circular fund flow patterns
- **Hub Node Leaderboard** - Top connected entities in the network
- **Network Health Metrics** - Density, average risk, and topology stats
- **Transaction Flow List** - Real-time edge visualization

### Neural Sandbox (Forensic Lab)
Full-screen workspace with:
- **ML Diagnostics** - Transaction parameter inputs with risk sliders
- **LLM Analysis** - AI-powered forensic investigation chat
- **Attack Simulation** - Generate synthetic fraud patterns
- **Real-time Prediction** - Hybrid ML + Graph scoring

### Hybrid Intelligence
- **XGBoost ML** - Pre-trained fraud detection model with 16 features
- **Graph Analysis** - NetworkX for cycle detection, clustering, degree centrality
- **LLM Forensics** - OpenRouter Gemma 3B for investigation reports
- **Risk Propagation** - Graph-based risk spreading across network

### Persistence
- **SQLite Database** - Persistent storage for users and transactions
- **Seed Data** - Pre-populated realistic entities (Aditya Sharma, GFX Exchange, etc.)
- **Graph Reset** - Clear all transactions and start fresh

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Framer Motion, Three.js (ForceGraph3D) |
| Backend | FastAPI, Python 3.10+ |
| ML | XGBoost, scikit-learn |
| Graph | NetworkX (cycle detection, clustering, pagerank) |
| LLM | OpenRouter API (Gemma 3B, free tier) |
| Database | SQLite with aiosqlite |
| Data | CoinGecko API (live crypto data) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/predict` | POST | Hybrid ML + Graph fraud prediction |
| `POST /api/advice` | POST | LLM forensic analysis |
| `GET /api/graph/state` | GET | Full graph state with nodes/edges |
| `GET /api/graph/analytics` | GET | Cycle detection, hub analysis, network metrics |
| `POST /api/graph/reset` | POST | Reset graph to seed state |
| `POST /api/simulate-attack` | POST | Generate synthetic fraud pattern |
| `GET /api/alerts` | GET | Recent fraud alerts |
| `GET /api/transactions` | GET | Transaction history |
| `GET /api/nodes` | GET | Graph nodes |
| `GET /api/edges` | GET | Graph edges |
| `GET /health` | GET | Health check |

## Prediction Engine

### Hybrid Scoring Formula
```
final_probability = ml_probability + graph_boosts + amount_boost
```

### Graph Boosts
| Condition | Boost |
|-----------|-------|
| Degree > 3 | +5% |
| Degree > 5 | +10% |
| Clustering > 0.4 | +10% |
| Cycle Detected | +30% |
| Money Mule Chain | +35% |
| Fan-In Pattern | +25% |

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
- OpenRouter API key (free tier available)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Add your API key
echo "OPENROUTER_API_KEY=sk-or-v1-your-key" > .env

# Start the server
uvicorn app.main:app --reload --port 3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Model Files
Place trained model files in `Model/`:
- `model.pkl` - XGBoost model
- `columns.pkl` - Feature column names

## Environment Variables

```bash
# backend/.env
OPENROUTER_API_KEY=sk-or-v1-...    # Required for LLM features
```

## Navigation

| Tab | Description |
|-----|-------------|
| **DASHBOARD** | Main view with alert feed, 3D graph, and context panel |
| **NETWORK** | Graph Analytics panel with cycle detection and fraud rings |
| **SANDBOX** | Forensic Lab for manual transaction analysis and LLM chat |
| **ABOUT** | System information, 3D glass stack, and mini graph |

## Project Structure

```
Real-Time-Graph-Based-Fraud-Detection/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── GraphCanvas.tsx      # 3D Force Graph
│   │   │   │   ├── NetworkExplorer.tsx  # Graph Analytics
│   │   │   │   ├── FocusSandbox.tsx     # Forensic Lab
│   │   │   │   ├── HUDHeader.tsx        # Navigation
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useRealTime.ts          # Graph & analytics polling
│   │   │   └── ...
│   │   ├── api/
│   │   │   └── fraudApi.ts             # API client
│   │   └── pages/
│   │       └── DashboardPage.tsx       # Main page
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app
│   │   ├── ml_service.py               # ML predictions & graph
│   │   ├── llm_service.py              # OpenRouter integration
│   │   ├── db_models.py                # SQLite repositories
│   │   └── crypto_service.py           # CoinGecko data
│   └── requirements.txt
├── Model/
│   ├── model.pkl                       # XGBoost model
│   └── columns.pkl                      # Feature columns
└── README.md
```

## License

MIT License - See LICENSE file for details.
