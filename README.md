# Forensic Lens - Real-Time Fraud Detection System

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A premium enterprise-grade fraud detection system with a **Forensic Lab UI**. Combines ML predictions, graph intelligence, and LLM-powered investigation in an immersive 3D visualization interface.

---

## Overview

Forensic Lens detects financial fraud through coordinated transaction network analysis. It uses XGBoost machine learning, NetworkX graph algorithms, and LLM-powered forensic analysis to identify suspicious patterns like:

- 🔄 **Cycle Rings** - Circular fund flows between accounts
- 🕸️ **Hub Patterns** - Single nodes connecting to many
- ⛓️ **Money Mules** - Long chains of intermediaries

---

## Architecture

### Frontend - Forensic Lab Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     MAGNETIC FLOATING ISLAND                            │
│  [FORENSIC LENS ●LIVE] │ DASHBOARD │ NETWORK │ SANDBOX │ ABOUT │    │
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
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │ ML Service  │ │ LLM Service │ │   DB Service        │ │
│  │  (XGBoost) │ │ (OpenRouter)│ │   (SQLite)          │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
│        │               │                   │               │
│        ▼               ▼                   ▼               │
│  ┌─────────┐    ┌───────────┐      ┌────────────┐        │
│  │ model.pkl│   │ Qwen 3B   │      │  DiGraph   │        │
│  │(16 feats)│   │   API     │      │(cycle det) │        │
│  └─────────┘    └───────────┘      └────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### 🎨 Premium UI/UX Design

- **Glassmorphism** - Frosted glass panels with backdrop blur
- **Gradient Accents** - Subtle gradient borders and glows
- **Micro-animations** - Smooth transitions and hover effects
- **Dark Theme** - Professional zinc-based color palette
- **3D Visualization** - Immersive ForceGraph3D experience

### 📊 3D Graph Visualization

| Feature | Description |
|---------|-------------|
| **ForceGraph3D** | Immersive 3D transaction network with orbit controls |
| **Cycle Highlighting** | Red glowing nodes indicate fraud ring members |
| **Risk-Based Sizing** | Higher risk = larger nodes with glowing effects |
| **Link Directionality** | Animated particles showing transaction flow |
| **Text Labels** | Canvas-based sprite labels for node identification |

### 🧠 Hybrid Intelligence

| Component | Technology | Purpose |
|-----------|------------|---------|
| **ML Model** | XGBoost | Transaction classification (16 features) |
| **Graph Analysis** | NetworkX | Cycle detection, clustering, PageRank |
| **LLM Analysis** | OpenRouter | Forensic investigation reports |
| **Risk Propagation** | Custom | Graph-based risk spreading |

### 📈 Prediction Engine

**Hybrid Scoring Formula:**
```
final_probability = ml_probability + graph_boosts + amount_boost
```

**Graph Boosts:**
| Condition | Boost |
|-----------|-------|
| Degree > 3 | +5% |
| Degree > 5 | +10% |
| Clustering > 0.4 | +10% |
| Cycle Detected | +30% |
| Money Mule Chain | +35% |

**Amount Thresholds:**
| Amount | Boost |
|--------|-------|
| > $250K | +10% |
| > $1M | +20% |
| > $10M | +40% |

**Fraud Threshold:** Score ≥ 70% triggers high-risk alert

### 🔍 Graph Analysis Algorithms

1. **Cycle Detection** - Identifies circular fund flows
2. **Clustering Coefficient** - Measures local density patterns
3. **PageRank** - Identifies central/important nodes
4. **Risk Propagation** - Spreads risk across network
5. **Money Mule Detection** - Chain, Fan-In, and Cycle patterns

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Framer Motion, Three.js, Tailwind CSS |
| **Backend** | FastAPI, Python 3.10+ |
| **ML** | XGBoost, scikit-learn |
| **Graph** | NetworkX (cycle detection, clustering, pagerank) |
| **LLM** | OpenRouter API (Qwen 3, free tier) |
| **Database** | SQLite with aiosqlite |
| **Data** | CoinGecko API (live crypto data) |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/predict` | POST | Hybrid ML + Graph fraud prediction |
| `POST /api/advice` | POST | LLM forensic analysis |
| `GET /api/graph/state` | GET | Full graph state with nodes/edges |
| `GET /api/graph/analytics` | GET | Cycle detection, hub analysis, metrics |
| `POST /api/graph/reset` | POST | Reset graph to seed state |
| `POST /api/simulate-attack` | POST | Generate synthetic fraud pattern |
| `GET /api/alerts` | GET | Recent fraud alerts |
| `GET /api/transactions` | GET | Transaction history |
| `GET /api/nodes` | GET | Graph nodes |
| `GET /api/edges` | GET | Graph edges |
| `GET /health` | GET | Health check |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- OpenRouter API key (free tier at [openrouter.ai](https://openrouter.ai))

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/AyushSinghRana15/Real-Time-Graph-Based-Fraud-Detection
cd Real-Time-Graph-Based-Fraud-Detection

# 2. Setup Backend
cd backend
pip install -r requirements.txt
echo "OPENROUTER_API_KEY=sk-or-v1-your-key" > .env
uvicorn app.main:app --reload --port 3001

# 3. Setup Frontend (new terminal)
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Model Files

Place trained model files in `Model/`:
- `model.pkl` - XGBoost model
- `columns.pkl` - Feature column names

---

## Deployment

### Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign up
2. Connect your GitHub repository
3. Create a new project → Deploy from GitHub
4. Add environment variable: `OPENROUTER_API_KEY`
5. Railway auto-detects and deploys

### Docker

```bash
# Build image
docker build -t forensic-lens .

# Run container
docker run -p 8000:8000 \
  -e OPENROUTER_API_KEY=sk-or-v1-your-key \
  forensic-lens
```

### Manual Production Build

```bash
# Build frontend
cd frontend
npm install
npm run build

# Backend serves the built frontend automatically
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM |
| `PORT` | No | Server port (Railway auto-sets) |
| `DATABASE_PATH` | No | SQLite file location |

---

## Navigation

| Tab | Description |
|-----|-------------|
| **DASHBOARD** | Main view with alert feed, 3D graph, context panel |
| **NETWORK** | Full network analysis with transaction input |
| **SANDBOX** | Forensic Lab for manual analysis and LLM chat |
| **ABOUT** | System info, tech stack, contributors |

---

## Contributors

| Name | Role |
|------|------|
| Ayush Singh Rana | Lead Developer |
| Aditya Singh | Contributor |
| Bipin Kumar | Contributor |
| Ashutosh Kumar | Contributor |

---

## Project Structure

```
Real-Time-Graph-Based-Fraud-Detection/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       ├── GraphCanvas.tsx      # 3D Force Graph
│   │   │       ├── NetworkPage.tsx      # Network analysis
│   │   │       ├── FocusSandbox.tsx     # Forensic Lab
│   │   │       ├── HUDHeader.tsx        # Navigation
│   │   │       └── AboutPage.tsx        # System info
│   │   ├── hooks/
│   │   │   └── useRealTime.ts          # Data polling
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
│   ├── model.pkl                        # XGBoost model
│   └── columns.pkl                     # Feature columns
├── Dockerfile
├── railway.json
├── explanation.txt                      # Technical documentation
└── README.md
```

---

## License

MIT License - See LICENSE file for details.

---

## Star History

If this project helps you, please give it a ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=AyushSinghRana15/Real-Time-Graph-Based-Fraud-Detection&type=Timeline)](https://star-history.com/#AyushSinghRana15/Real-Time-Graph-Based-Fraud-Detection&Timeline)
