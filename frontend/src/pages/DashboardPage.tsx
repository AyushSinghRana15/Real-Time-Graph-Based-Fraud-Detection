import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import {
  AlertTriangle, X,
  Network, Search, Bell, Settings, User,
  Minus, Shield,
  ArrowUpRight, ArrowDownRight, Activity as ActivityIcon,
  ChevronRight
} from 'lucide-react';
import { useAlerts, useSubgraph, usePrediction } from '../hooks/useFraudDetection';
import type { Alert, TransactionNode, PredictionResult } from '../types';

const NAV_ITEMS = ['Dashboard', 'Network', 'Registry', 'Archived'] as const;
type NavItem = typeof NAV_ITEMS[number];

function riskColor(score: number) {
  if (score >= 0.85) return '#f43f5e';
  if (score >= 0.6)  return '#f59e0b';
  if (score >= 0.3)  return '#eab308';
  return '#10b981';
}

// ─── Sparkline Component ─────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const pathData = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-full absolute inset-0 opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Mini KPI Card Component ───────────────────────────────────
function MiniKPICard({ label, value, trend, trendValue, color, sparkData, delay = 0 }: {
  label: string; value: string; trend: 'up' | 'down' | 'neutral';
  trendValue: string; color: string; sparkData: number[]; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative px-4 py-3 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(24,24,27,0.5)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        minWidth: '140px',
      }}
    >
      <Sparkline data={sparkData} color={color} />
      <div className="relative z-10">
        <p className="text-xs mb-0.5" style={{ color: '#71717a' }}>{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold" style={{ color: '#fafafa' }}>{value}</span>
          <div className="flex items-center gap-0.5">
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" style={{ color }} />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" style={{ color }} />}
            {trend === 'neutral' && <Minus className="w-3 h-3" style={{ color: '#71717a' }} />}
            <span className="text-xs" style={{ color }}>{trendValue}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Floating TopBar Component ─────────────────────────────────────
function FloatingTopBar({ activeNav, onNavChange }: { activeNav: NavItem; onNavChange: (n: NavItem) => void }) {
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const t1 = setInterval(() => setLatency(p => Math.max(1, p + (Math.random() - 0.5) * 6 | 0)), 2000);
    return () => { clearInterval(t1); };
  }, []);

  const sparkVolume = [65, 72, 68, 75, 78, 82, 85, 88, 84, 90, 87, 92];
  const sparkPrevention = [98, 98.5, 99, 98.8, 99.2, 99, 99.3, 99.1, 99.4, 99.2, 99.5, 99.2];
  const sparkRisk = [15, 18, 22, 19, 25, 28, 24, 30, 27, 23, 28, 23];
  const sparkLatency = [10, 12, 11, 14, 13, 15, 12, 14, 16, 13, 15, 12];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 left-6 right-6 z-50"
    >
      <div 
        className="flex items-center justify-between px-5 py-3 rounded-2xl"
        style={{ background: 'rgba(9,9,11,0.7)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.25)' }}>
            <span className="font-bold text-sm" style={{ color: '#f43f5e' }}>FL</span>
          </div>
          <span className="text-base font-semibold" style={{ color: '#fafafa' }}>Forensic Lens</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {NAV_ITEMS.map((item) => (
            <motion.button
              key={item}
              onClick={() => onNavChange(item)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg relative"
              style={{ color: activeNav === item ? '#fafafa' : '#71717a' }}
              whileTap={{ scale: 0.98 }}
            >
              {activeNav === item && (
                <motion.div layoutId="nav-bg" className="absolute inset-0 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10">{item}</span>
            </motion.button>
          ))}
        </nav>

        {/* KPI Row */}
        <div className="flex items-center gap-3">
          <MiniKPICard label="Volume" value="8.47M" trend="up" trendValue="+12.5%" color="#10b981" sparkData={sparkVolume} delay={0.1} />
          <MiniKPICard label="Prevention" value="99.2%" trend="up" trendValue="+0.3%" color="#10b981" sparkData={sparkPrevention} delay={0.15} />
          <MiniKPICard label="High-Risk" value="23" trend="down" trendValue="+5" color="#f43f5e" sparkData={sparkRisk} delay={0.2} />
          <MiniKPICard label="Latency" value={`${latency}ms`} trend="neutral" trendValue="OK" color="#f59e0b" sparkData={sparkLatency} delay={0.25} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#52525b' }} />
            <input
              className="w-44 h-9 pl-9 pr-4 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#fafafa' }}
              placeholder="Search..."
            />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color: '#71717a' }}>
            <Settings className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ color: '#f43f5e' }}>
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#f43f5e' }} />
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} className="w-9 h-9 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <User className="w-4 h-4" style={{ color: '#71717a' }} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

// ─── Alert Card Component ─────────────────────────────────
function AlertCard({ alert, selected, onSelect }: { alert: Alert; selected: boolean; onSelect: () => void }) {
  const barColor = riskColor(alert.riskScore);
  const confidence = Math.round(alert.riskScore * 100);
  const typeLabel = alert.type === 'high_risk' ? 'Critical' : alert.type === 'medium_risk' ? 'Suspicious' : 'Flagged';

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onSelect}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left rounded-xl p-3 transition-all cursor-pointer"
      style={{
        background: selected ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? 'rgba(244,63,94,0.35)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${barColor}15`, color: barColor }}>
          {typeLabel}
        </span>
        <span className="text-[10px]" style={{ color: '#71717a' }}>
          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <h4 className="font-medium text-xs mb-1 truncate" style={{ color: '#fafafa' }}>{alert.title}</h4>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono" style={{ color: '#71717a' }}>{alert.entityId.slice(0, 12)}...</span>
        <span className="text-xs font-semibold" style={{ color: barColor }}>{confidence}%</span>
      </div>
    </motion.button>
  );
}

// ─── Floating Alert Sidebar ────────────────────────────────
function FloatingAlertSidebar({ alerts, selectedId, onSelect }: { alerts: Alert[]; selectedId: string | null; onSelect: (a: Alert) => void }) {
  const criticalAlerts = alerts.filter(a => a.type === 'high_risk');
  const suspiciousAlerts = alerts.filter(a => a.type === 'medium_risk');
  const otherAlerts = alerts.filter(a => a.type === 'low_risk' || a.type === 'info');

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-[132px] left-6 z-40 w-80 max-h-[calc(100vh-180px)] flex flex-col rounded-2xl overflow-hidden"
      style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: '#f43f5e' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#fafafa' }}>Alert Feed</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}>{alerts.length}</span>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {criticalAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f43f5e' }} />
              <span className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Critical</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}>{criticalAlerts.length}</span>
            </div>
            <div className="space-y-2">
              {criticalAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} selected={selectedId === alert.id} onSelect={() => onSelect(alert)} />
              ))}
            </div>
          </div>
        )}
        {suspiciousAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
              <span className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Suspicious</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}>{suspiciousAlerts.length}</span>
            </div>
            <div className="space-y-2">
              {suspiciousAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} selected={selectedId === alert.id} onSelect={() => onSelect(alert)} />
              ))}
            </div>
          </div>
        )}
        {otherAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#71717a' }} />
              <span className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Under Review</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}>{otherAlerts.length}</span>
            </div>
            <div className="space-y-2">
              {otherAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} selected={selectedId === alert.id} onSelect={() => onSelect(alert)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
        <span className="text-[10px]" style={{ color: '#71717a' }}>System monitoring active</span>
      </div>
    </motion.aside>
  );
}

// ─── Graph Canvas Component ────────────────────────────────
function GraphCanvas({ entityId, maxTs, onNodeClick }: { entityId: string | null; maxTs: Date; onNodeClick: (n: TransactionNode) => void }) {
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const { data, isLoading } = useSubgraph(entityId ?? 'default');

  useEffect(() => {
    const el = document.getElementById('graph-canvas-wrap');
    if (!el) return;
    const obs = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge')?.strength(-120);
      graphRef.current.d3Force('link')?.distance(60);
    }
  }, [data]);

  const filteredData = data ? {
    nodes: data.nodes.filter(n => new Date(n.lastSeen) <= maxTs),
    links: data.links.filter(l => new Date(l.timestamp) <= maxTs),
  } : { nodes: [], links: [] };

  const nodeObj = useCallback((node: any) => {
    const score = node.riskScore ?? 0;
    const color = riskColor(score);
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(score >= 0.6 ? 4 : 2.5, 16, 16),
      new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.9, emissive: color, emissiveIntensity: score >= 0.6 ? 0.4 : 0.15 }),
    );
    g.add(mesh);
    if (score >= 0.6) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(7, 7.5, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
      );
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    }
    return g;
  }, []);

  return (
    <div id="graph-canvas-wrap" className="absolute inset-0" style={{ background: '#09090b' }}>
      {isLoading && !data && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(244,63,94,0.2)', borderTopColor: '#f43f5e' }} />
            <p className="text-sm" style={{ color: '#71717a' }}>Loading network...</p>
          </motion.div>
        </div>
      )}
      {filteredData.nodes.length > 0 && (
        <ForceGraph3D
          ref={graphRef}
          graphData={filteredData}
          nodeId="id"
          nodeLabel="label"
          nodeThreeObject={nodeObj}
          nodeThreeObjectExtend={false}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1}
          linkDirectionalParticleColor={() => '#f59e0b'}
          linkDirectionalParticleSpeed={0.008}
          onNodeClick={(n: any) => onNodeClick(n as TransactionNode)}
          cooldownTicks={120}
          backgroundColor="transparent"
          width={dims.w}
          height={dims.h}
          showNavInfo={false}
          enableNodeDrag
          enableNavigationControls
          controlType="orbit"
        />
      )}
      {filteredData.nodes.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="text-center">
            <Network className="w-16 h-16 mx-auto mb-4" style={{ color: '#27272a' }} />
            <p className="text-sm" style={{ color: '#3f3f46' }}>Select an alert to visualize its network</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Floating Context Panel ────────────────────────────────
function FloatingContextPanel({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const prediction = usePrediction(alert.entityId);
  useEffect(() => { prediction.mutate(); }, [alert.entityId]);

  const pred = prediction.data as PredictionResult | undefined;
  const confidence = pred ? Math.round(pred.confidence * 100) : Math.round(alert.riskScore * 100);
  const riskLevel = pred?.riskLevel || (alert.riskScore >= 0.85 ? 'critical' : alert.riskScore >= 0.6 ? 'high' : alert.riskScore >= 0.3 ? 'medium' : 'low');

  const colors = {
    critical: { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)', text: '#f43f5e' },
    high: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
    medium: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)', text: '#eab308' },
    low: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', text: '#10b981' },
  }[riskLevel] || { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)', text: '#f43f5e' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-[132px] right-6 z-40 w-96 max-h-[calc(100vh-180px)] flex flex-col rounded-2xl overflow-hidden"
      style={{ background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
              <Shield className="w-5 h-5" style={{ color: colors.text }} />
            </motion.div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: '#fafafa' }}>{alert.entityId}</h2>
              <p className="text-xs" style={{ color: '#71717a' }}>Institutional Account</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: '#71717a', background: 'rgba(255,255,255,0.04)' }}>
            <X className="w-4 h-4" />
          </motion.button>
        </div>
        <motion.div className="mt-4 p-4 rounded-xl text-center" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
          <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: colors.text }}>Illicit Confidence</p>
          <p className="text-3xl font-bold" style={{ color: colors.text, fontFamily: 'Space Grotesk, sans-serif' }}>{confidence}%</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Transaction Details */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#fafafa' }}>
            <ChevronRight className="w-4 h-4" style={{ color: '#f43f5e' }} />
            Transaction Details
          </h3>
          <div className="space-y-1">
            {[
              { label: 'IP Address', value: '192.168.10.4 (VPN)' },
              { label: 'Device ID', value: 'AX-990-PRO-MAX' },
              { label: 'Time', value: new Date(alert.timestamp).toLocaleTimeString() },
              { label: 'Transactions', value: alert.transactionCount.toLocaleString() },
              { label: 'Volume', value: `$${alert.totalVolume.toLocaleString()}` },
            ].map((item, i) => (
              <motion.div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-xs" style={{ color: '#71717a' }}>{item.label}</span>
                <span className="text-xs font-medium font-mono" style={{ color: '#fafafa' }}>{item.value}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#fafafa' }}>
            <ActivityIcon className="w-4 h-4" style={{ color: '#f59e0b' }} />
            Recent Transactions
          </h3>
          <div className="space-y-1">
            {[
              { type: 'OUTBOUND', amount: '-$45,000.00', color: '#f43f5e' },
              { type: 'TRANSFER', amount: '-$12,400.00', color: '#f59e0b' },
              { type: 'INBOUND', amount: '+$88,200.00', color: '#10b981' },
            ].map((tx, i) => (
              <motion.div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-xs font-medium" style={{ color: '#71717a' }}>{tx.type}</span>
                <span className="text-xs font-medium" style={{ color: tx.color }}>{tx.amount}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-2.5 rounded-xl font-semibold text-sm" style={{ background: '#f43f5e', color: '#fff' }}>
          Quarantine Account
        </motion.button>
        <div className="grid grid-cols-2 gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="py-2 rounded-xl text-xs font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>
            Whitelist
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="py-2 rounded-xl text-xs font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>
            Investigate
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Legend Component ────────────────────────────────
function FloatingLegend() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-6 px-6 py-3 rounded-2xl"
      style={{ background: 'rgba(9,9,11,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {[
        { color: '#f43f5e', label: 'Critical' },
        { color: '#f59e0b', label: 'High' },
        { color: '#eab308', label: 'Medium' },
        { color: '#10b981', label: 'Low' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}40` }} />
          <span className="text-xs" style={{ color: '#a1a1aa' }}>{item.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Dashboard Page Component ─────────────────────────────
export function DashboardPage() {
  const { data: alerts = [] } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [maxTs] = useState(new Date());
  const [activeNav, setActiveNav] = useState<NavItem>('Dashboard');

  const handleNodeClick = useCallback((node: TransactionNode) => {
    const a = alerts.find(al => al.entityId === node.id);
    if (a) setSelectedAlert(a);
  }, [alerts]);

  useEffect(() => {
    if (alerts.length > 0 && !selectedAlert) {
      const high = alerts.find(a => a.type === 'high_risk');
      if (high) setSelectedAlert(high);
    }
  }, [alerts]);

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: '#09090b' }}>
      {/* Full-Bleed Graph Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <GraphCanvas entityId={selectedAlert?.entityId ?? null} maxTs={maxTs} onNodeClick={handleNodeClick} />
      </div>

      {/* Floating HUD Elements */}
      <FloatingTopBar activeNav={activeNav} onNavChange={setActiveNav} />
      <FloatingAlertSidebar alerts={alerts} selectedId={selectedAlert?.id ?? null} onSelect={setSelectedAlert} />
      
      <AnimatePresence>
        {selectedAlert && (
          <FloatingContextPanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        )}
      </AnimatePresence>
      
      <FloatingLegend />
    </div>
  );
}
