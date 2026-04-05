import { faker } from '@faker-js/faker';
import type { Alert, GraphData, MetricData, PredictionResult, VelocityPoint } from '../types';

faker.seed(42);

const RISK_SCENARIOS = [
  { title: 'Coordinated Sybil Attack', verdict: 'Multiple accounts sharing identical device fingerprints and IP patterns suggest coordinated fraud ring activity. Velocity anomalies detected across 47 linked accounts.', actions: ['freeze_accounts', 'escalate_investigation'] },
  { title: 'Money Laundering Cycle', verdict: 'Structured transactions with near-threshold amounts moving through layered accounts with minimal commercial justification. 89% probability of layering stage.', actions: ['file_sar', 'preserve_evidence'] },
  { title: 'Account Takeover', verdict: 'Login from unusual geographic location followed by immediate high-value transactions. Device fingerprint mismatch detected at checkout.', actions: ['lock_account', 'notify_customer'] },
  { title: 'Synthetic Identity', verdict: 'New account with fabricated history markers. Email domain associated with 23 flagged entities. Initial transactions below AML thresholds.', actions: ['enhanced_kyc', 'link_analysis'] },
  { title: 'Collusion Network', verdict: 'Merchant-account loop with circular transactions inflating volume. 12 entities form closed payment loop siphoning $2.3M annually.', actions: ['network_analysis', 'legal_hold'] },
  { title: 'Mule Account Activity', verdict: 'High-velocity transfers with immediate withdrawal patterns. Consistent with money mule behavior profile. 94% confidence.', actions: ['contact_account_holder', 'limit_transfers'] },
  { title: 'Bust-Out Fraud', verdict: 'Long信用 history followed by rapid credit utilization and disappearing payments. Pre-bankruptcy fraud pattern detected.', actions: ['freeze_credit', 'collections_prep'] },
  { title: 'API Exploitation', verdict: 'Automated scraping detected. Rate limiting bypass attempts. 15,000 requests/minute from distributed botnet.', actions: ['rate_limit', 'ip_block'] },
  { title: 'Friendly Fraud', verdict: 'Chargeback pattern from verified customer. False claims detected via device fingerprint correlation with dispute history.', actions: ['manual_review', 'fraud_report'] },
  { title: 'Cross-Border Smurfing', verdict: 'Multiple small transactions below reporting thresholds from foreign accounts. Geographic velocity impossible for human operators.', actions: ['ctr_filing', 'geolocation_review'] },
];

const ENTITY_TYPES = ['account', 'merchant', 'ip_address', 'device'] as const;
const COUNTRIES = ['US', 'UK', 'DE', 'CN', 'RU', 'NG', 'BR', 'IN', 'JP', 'SG'];

function generateRiskScore(): number {
  const r = Math.random();
  if (r < 0.15) return faker.number.float({ min: 0.85, max: 1.0, fractionDigits: 2 });
  if (r < 0.35) return faker.number.float({ min: 0.6, max: 0.84, fractionDigits: 2 });
  if (r < 0.60) return faker.number.float({ min: 0.3, max: 0.59, fractionDigits: 2 });
  return faker.number.float({ min: 0, max: 0.29, fractionDigits: 2 });
}

function generateAlert(): Alert {
  const scenario = faker.helpers.arrayElement(RISK_SCENARIOS);
  const riskScore = generateRiskScore();
  const alertType = riskScore >= 0.85 ? 'high_risk' : riskScore >= 0.6 ? 'medium_risk' : riskScore >= 0.3 ? 'low_risk' : 'info';

  return {
    id: faker.string.uuid(),
    type: alertType,
    title: scenario.title,
    description: `${faker.helpers.arrayElement(ENTITY_TYPES)} ${faker.string.alphanumeric(8).toUpperCase()} flagged for ${scenario.title.toLowerCase()}`,
    aiVerdict: scenario.verdict,
    riskScore,
    timestamp: faker.date.recent({ days: 1 }).toISOString(),
    entityId: faker.string.alphanumeric(12).toUpperCase(),
    entityType: faker.helpers.arrayElement(ENTITY_TYPES),
    transactionCount: faker.number.int({ min: 1, max: 500 }),
    totalVolume: faker.number.float({ min: 100, max: 500000, fractionDigits: 2 }),
    flagged: riskScore >= 0.6,
  };
}

function generateNode(index: number): import('../types').TransactionNode {
  const riskScore = generateRiskScore();
  return {
    id: `node_${index}`,
    type: faker.helpers.arrayElement(ENTITY_TYPES),
    label: `${faker.helpers.arrayElement(['ACC', 'MER', 'IP', 'DEV'])}-${faker.string.alphanumeric(6).toUpperCase()}`,
    riskScore,
    transactionCount: faker.number.int({ min: 10, max: 10000 }),
    totalVolume: faker.number.float({ min: 1000, max: 10000000, fractionDigits: 2 }),
    firstSeen: faker.date.past({ years: 2 }).toISOString(),
    lastSeen: faker.date.recent({ days: 7 }).toISOString(),
    country: faker.helpers.arrayElement(COUNTRIES),
  };
}

function generateLink(nodes: import('../types').TransactionNode[]): import('../types').TransactionLink {
  const source = faker.helpers.arrayElement(nodes);
  let target = faker.helpers.arrayElement(nodes);
  while (target.id === source.id) {
    target = faker.helpers.arrayElement(nodes);
  }
  return {
    source: source.id,
    target: target.id,
    transactionId: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
    amount: faker.number.float({ min: 10, max: 50000, fractionDigits: 2 }),
    timestamp: faker.date.recent({ days: 2 }).toISOString(),
    isFlagged: Math.random() < 0.3,
  };
}

export async function fetchAlerts(): Promise<Alert[]> {
  await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
  return Array.from({ length: 15 }, generateAlert).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function fetchSubgraph(_entityId: string): Promise<GraphData> {
  await new Promise(r => setTimeout(r, 200 + Math.random() * 400));
  const nodeCount = faker.number.int({ min: 20, max: 50 });
  const nodes = Array.from({ length: nodeCount }, (_, i) => generateNode(i));
  const linkCount = faker.number.int({ min: nodeCount, max: nodeCount * 2 });
  const links = Array.from({ length: linkCount }, () => generateLink(nodes));
  return { nodes, links };
}

export async function fetchMetrics(): Promise<MetricData[]> {
  await new Promise(r => setTimeout(r, 150 + Math.random() * 300));
  return [
    { label: 'Total Transactions', value: faker.number.int({ min: 100000, max: 500000 }), change: faker.number.float({ min: -5, max: 15, fractionDigits: 1 }), trend: 'up' },
    { label: 'Flagged Rate', value: faker.number.float({ min: 1, max: 5, fractionDigits: 2 }), change: faker.number.float({ min: -2, max: 2, fractionDigits: 1 }), trend: Math.random() > 0.5 ? 'down' : 'up' },
    { label: 'Avg Response Time', value: faker.number.float({ min: 50, max: 200, fractionDigits: 0 }), change: faker.number.float({ min: -10, max: 5, fractionDigits: 1 }), trend: 'down' },
    { label: 'Active Alerts', value: faker.number.int({ min: 50, max: 200 }), change: faker.number.float({ min: -10, max: 20, fractionDigits: 1 }), trend: 'up' },
  ];
}

export async function fetchVelocityStream(): Promise<VelocityPoint[]> {
  await new Promise(r => setTimeout(r, 100));
  const now = Date.now();
  return Array.from({ length: 60 }, (_, i) => ({
    timestamp: new Date(now - (59 - i) * 1000).toISOString(),
    transactionsPerSecond: faker.number.float({ min: 10, max: 150, fractionDigits: 1 }),
    flaggedPercentage: faker.number.float({ min: 1, max: 15, fractionDigits: 1 }),
  }));
}

export async function predictFraud(entityId: string): Promise<PredictionResult> {
  await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
  const riskLevel = faker.helpers.arrayElement(['critical', 'high', 'medium', 'low'] as const);
  const scenario = faker.helpers.arrayElement(RISK_SCENARIOS);
  return {
    entityId,
    riskLevel,
    confidence: faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 2 }),
    factors: [
      faker.helpers.arrayElement(['High transaction velocity', 'Unusual geolocation', 'Device fingerprint anomaly', 'Known fraud ring association', 'Below-threshold structuring']),
      faker.helpers.arrayElement(['Cross-border activity', 'New account behavior', 'Round-amount transactions', 'IP reputation score', 'Behavioral biometrics mismatch']),
      faker.helpers.arrayElement(['Network centrality score', 'Account age vs activity', 'Payment method diversity', 'Time-zone inconsistency', 'Merchant category anomalies']),
    ],
    aiVerdict: scenario.verdict,
    recommendedAction: faker.helpers.arrayElement(['block', 'review', 'allow', 'monitor'] as const),
  };
}
