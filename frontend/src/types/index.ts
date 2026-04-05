export interface TransactionNode {
  id: string;
  type: 'account' | 'transaction' | 'entity';
  label: string;
  risk: number;
  connections: string[];
}

export interface TransactionLink {
  source: string;
  target: string;
  transactionId?: string;
  amount?: number;
  timestamp?: string;
  isFlagged?: boolean;
}

export interface GraphData {
  nodes: TransactionNode[];
  links: TransactionLink[];
}

export interface AlertReason {
  factor: string;
  detail: string;
  weight: number;
}

export interface Alert {
  id: string;
  type: 'high_risk' | 'medium_risk' | 'low_risk' | 'info';
  entityId: string;
  entityName: string;
  amount: number;
  timestamp: string;
  description: string;
  indicators: string[];
  confidence: number;
  reasons?: AlertReason[];
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
