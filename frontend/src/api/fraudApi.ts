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
