# Forensic Lens Backend API

FastAPI-based backend for the Forensic Lens fraud detection dashboard.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running

```bash
uvicorn app.main:app --reload --port 3001
```

## Endpoints

- `GET /health` - Health check
- `GET /api/alerts` - Get all fraud alerts
- `GET /api/alerts/{id}` - Get specific alert
- `GET /api/nodes` - Get all graph nodes
- `GET /api/nodes/{id}` - Get specific node

## API Docs

Once running, visit:
- Swagger UI: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc
