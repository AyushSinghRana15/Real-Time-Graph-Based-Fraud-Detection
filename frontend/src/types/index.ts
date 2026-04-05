export interface TransactionNode {
  id: string;
  type: 'account' | 'merchant' | 'ip_address' | 'device';
  label: string;
  riskScore: number;
  transactionCount: number;
  totalVolume: number;
  firstSeen: string;
  lastSeen: string;
  country: string;
}

export interface TransactionLink {
  source: string;
  target: string;
  transactionId: string;
  amount: number;
  timestamp: string;
  isFlagged: boolean;
}

export interface GraphData {
  nodes: TransactionNode[];
  links: TransactionLink[];
}

export interface Alert {
  id: string;
  type: 'high_risk' | 'medium_risk' | 'low_risk' | 'info';
  title: string;
  description: string;
  aiVerdict: string;
  riskScore: number;
  timestamp: string;
  entityId: string;
  entityType: 'account' | 'merchant' | 'ip_address' | 'device';
  transactionCount: number;
  totalVolume: number;
  flagged: boolean;
}

export interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface VelocityPoint {
  timestamp: string;
  transactionsPerSecond: number;
  flaggedPercentage: number;
}

export interface PredictionResult {
  entityId: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  factors: string[];
  aiVerdict: string;
  recommendedAction: 'block' | 'review' | 'allow' | 'monitor';
}
