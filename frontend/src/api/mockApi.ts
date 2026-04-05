import { faker } from '@faker-js/faker';
import type { Alert, TransactionNode } from '../types';

faker.seed(42);

const ENTITY_NAMES = [
  'Acme Holdings Ltd', 'Quantum Ventures', 'Nexus Capital', 'Vertex Solutions',
  'Meridian Trust Co', 'Atlas Enterprises', 'Pinnacle Finance', 'Horizon Partners'
];

const INDICATORS = [
  'Unusual transaction velocity', 'Cross-border routing detected', 'PEP association flagged',
  'Sanctions list proximity', 'Structuring pattern detected', 'Shell company network',
  'Rapid fund movement', 'Mismatched beneficiary data', 'Layering detected'
];

function generateAlert(): Alert {
  const r = Math.random();
  const type: Alert['type'] = r < 0.25 ? 'high_risk' : r < 0.5 ? 'medium_risk' : r < 0.8 ? 'low_risk' : 'info';
  const confidence = type === 'high_risk' ? 85 + Math.random() * 15 : type === 'medium_risk' ? 60 + Math.random() * 25 : type === 'low_risk' ? 30 + Math.random() * 30 : 10 + Math.random() * 20;
  const numIndicators = type === 'high_risk' ? 3 : type === 'medium_risk' ? 2 : 1;

  return {
    id: `ALT-${faker.string.numeric(4)}`,
    type,
    entityId: `ENT-${faker.string.numeric(3)}`,
    entityName: faker.helpers.arrayElement(ENTITY_NAMES),
    amount: Math.round((Math.random() * 500000 + 1000) * 100) / 100,
    timestamp: faker.date.recent({ days: 7 }).toISOString(),
    description: `Suspicious activity detected for this entity involving transaction patterns.`,
    indicators: faker.helpers.arrayElements(INDICATORS, numIndicators),
    confidence,
  };
}

function generateNode(): TransactionNode {
  const id = `ENT-${faker.string.numeric(3)}`;
  return {
    id,
    type: 'account',
    label: faker.helpers.arrayElement(ENTITY_NAMES),
    risk: Math.floor(Math.random() * 100),
    connections: [],
  };
}

export async function fetchAlerts(): Promise<Alert[]> {
  await new Promise(r => setTimeout(r, 300));
  return Array.from({ length: 15 }, generateAlert).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function fetchNodes(): Promise<TransactionNode[]> {
  await new Promise(r => setTimeout(r, 200));
  const nodes = Array.from({ length: 12 }, generateNode);
  nodes.forEach(node => {
    const numConnections = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numConnections; i++) {
      const target = nodes[Math.floor(Math.random() * nodes.length)];
      if (target.id !== node.id && !node.connections.includes(target.id)) {
        node.connections.push(target.id);
      }
    }
  });
  return nodes;
}
