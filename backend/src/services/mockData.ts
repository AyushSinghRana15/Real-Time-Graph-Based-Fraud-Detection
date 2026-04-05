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
}

export interface TransactionNode {
  id: string;
  label: string;
  type: 'account' | 'transaction' | 'entity';
  risk: number;
  connections: string[];
}

const ALERT_TYPES: Alert['type'][] = ['high_risk', 'medium_risk', 'low_risk', 'info'];
const ENTITY_NAMES = [
  'Acme Holdings Ltd', 'Quantum Ventures', 'Nexus Capital', 'Vertex Solutions',
  'Meridian Trust Co', 'Atlas Enterprises', 'Pinnacle Finance', 'Horizon Partners',
  'Summit Group', 'Eclipse Holdings', 'Sterling Corp', 'Vanguard Services'
];

const INDICATORS = [
  'Unusual transaction velocity', 'Cross-border routing detected', 'PEP association flagged',
  'Sanctions list proximity', 'Structuring pattern detected', 'Shell company network',
  'Rapid fund movement', 'Mismatched beneficiary data', 'Layering detected',
  'High-risk jurisdiction origin', 'Frequency anomaly', 'Amount threshold breach'
];

function randomDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date.toISOString();
}

function generateAlerts(count: number): Alert[] {
  return Array.from({ length: count }, (_, i) => {
    const typeIndex = Math.random() < 0.25 ? 0 : Math.random() < 0.5 ? 1 : Math.random() < 0.8 ? 2 : 3;
    const type = ALERT_TYPES[typeIndex];
    const numIndicators = type === 'high_risk' ? 3 : type === 'medium_risk' ? 2 : 1;
    
    return {
      id: `ALT-${String(1000 + i).padStart(4, '0')}`,
      type,
      entityId: `ENT-${String(100 + i).padStart(3, '0')}`,
      entityName: ENTITY_NAMES[i % ENTITY_NAMES.length],
      amount: Math.round((Math.random() * 500000 + 1000) * 100) / 100,
      timestamp: randomDate(7),
      description: `Suspicious activity detected for ${ENTITY_NAMES[i % ENTITY_NAMES.length]} involving transaction patterns consistent with ${type === 'high_risk' ? 'known fraud schemes' : 'atypical behavior'}.`,
      indicators: INDICATORS.slice(0, numIndicators).sort(() => Math.random() - 0.5),
      confidence: type === 'high_risk' ? 85 + Math.random() * 15 : 
                  type === 'medium_risk' ? 60 + Math.random() * 25 : 
                  type === 'low_risk' ? 30 + Math.random() * 30 : 10 + Math.random() * 20,
    };
  });
}

function generateNodes(): TransactionNode[] {
  const nodes: TransactionNode[] = ENTITY_NAMES.map((name, i) => ({
    id: `ENT-${String(100 + i).padStart(3, '0')}`,
    label: name,
    type: 'account' as const,
    risk: Math.floor(Math.random() * 100),
    connections: [],
  }));

  nodes.forEach((node, i) => {
    const numConnections = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numConnections; j++) {
      const targetIndex = (i + j + 1) % nodes.length;
      if (!node.connections.includes(nodes[targetIndex].id)) {
        node.connections.push(nodes[targetIndex].id);
      }
    }
  });

  return nodes;
}

export const mockAlerts = generateAlerts(20);
export const mockNodes = generateNodes();
