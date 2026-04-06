export const API_BASE = '/api';
export const HEALTH_ENDPOINT = '/health';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
