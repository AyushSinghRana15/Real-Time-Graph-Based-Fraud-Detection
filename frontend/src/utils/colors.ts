export function riskColor(score: number) {
  if (score >= 0.85) return '#f43f5e'; // Critical -> Rose
  if (score >= 0.6)  return '#f59e0b'; // High -> Amber
  if (score >= 0.3)  return '#eab308'; // Medium -> Yellow
  return '#10b981'; // Low -> Emerald
}
