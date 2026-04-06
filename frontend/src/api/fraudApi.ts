const API_BASE = 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

export async function fetchAlerts() {
  const response = await fetch(`${API_BASE}/alerts`);
  return handleResponse<import('../types').Alert[]>(response);
}

export async function fetchAlertById(id: string) {
  const response = await fetch(`${API_BASE}/alerts/${id}`);
  return handleResponse<import('../types').Alert>(response);
}

export async function fetchNodes() {
  const response = await fetch(`${API_BASE}/nodes`);
  return handleResponse<import('../types').TransactionNode[]>(response);
}

export async function fetchNodeById(id: string) {
  const response = await fetch(`${API_BASE}/nodes/${id}`);
  return handleResponse<import('../types').TransactionNode>(response);
}

export async function fetchGraphState() {
  const response = await fetch(`${API_BASE}/graph/state`);
  return handleResponse<{
    nodes: import('../types').TransactionNode[];
    edges: import('../types').TransactionLink[];
    node_risks?: Record<string, number>;
    stats: {
      total_nodes: number;
      total_edges: number;
      high_risk_nodes?: number;
      network_avg_risk?: number;
    };
  }>(response);
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return handleResponse<{
    status: string;
    timestamp: string;
    ml_model_available: boolean;
    graph_nodes: number;
    graph_edges: number;
    live_data_source: string;
  }>(response);
}

export async function simulateAttack() {
  const response = await fetch(`${API_BASE}/simulate-attack`, {
    method: 'POST',
  });
  return handleResponse<{
    pattern: string;
    nodes_created: number;
    edges_created: number;
    risk_score: number;
    description: string;
  }>(response);
}

export async function resetGraph() {
  const response = await fetch(`${API_BASE}/graph/reset`, {
    method: 'POST',
  });
  return handleResponse<{
    status: string;
    message: string;
  }>(response);
}

export async function addTransaction(transaction: {
  sender_id: string;
  receiver_id: string;
  amount: number;
  type: string;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  oldbalanceDest: number;
  newbalanceDest: number;
}) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  return handleResponse<{
    is_fraud: boolean;
    fraud_probability: number;
    transaction: {
      sender: string;
      receiver: string;
      sender_name: string;
      receiver_name: string;
    };
  }>(response);
}

export async function fetchGraphAnalytics() {
  const response = await fetch(`${API_BASE}/graph/analytics`);
  return handleResponse<import('../hooks/useRealTime').GraphAnalytics>(response);
}
