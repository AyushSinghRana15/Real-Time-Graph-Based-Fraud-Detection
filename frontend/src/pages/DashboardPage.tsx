import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import {
  AlertTriangle, X, Bot,
  Network, Search, Bell, Settings, User,
  Minus,
  ArrowUpRight, ArrowDownRight, Activity as ActivityIcon
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
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathData} L 100 100 L 0 100 Z`}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
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

// ─── KPI Card Component ───────────────────────────────────
interface KPICardProps {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
  sparkData: number[];
  delay?: number;
}

function KPICard({ label, value, trend, trendValue, color, sparkData, delay = 0 }: KPICardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative p-5 rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(24,24,27,0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Sparkline Background */}
      <div className="absolute inset-0 opacity-30">
        <Sparkline data={sparkData} color={color} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm mb-1" style={{ color: '#71717a' }}>{label}</p>
        <div className="flex items-end justify-between">
          <motion.p 
            className="text-2xl font-semibold"
            style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}
            animate={{ scale: isHovered ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {value}
          </motion.p>
          <div className="flex items-center gap-1">
            {trend === 'up' && <ArrowUpRight className="w-4 h-4" style={{ color }} />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4" style={{ color }} />}
            {trend === 'neutral' && <Minus className="w-4 h-4" style={{ color: '#71717a' }} />}
            <span className="text-xs font-medium" style={{ color }}>
              {trendValue}
            </span>
          </div>
        </div>
      </div>
      
      {/* Hover Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}10, transparent 70%)` }}
      />
    </motion.div>
  );
}

// ─── Risk Gauge Component ─────────────────────────────────
function RiskGauge({ score }: { score: number }) {
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const displayValue = useTransform(springValue, (v) => Math.round(v * 100));
  
  useEffect(() => {
    springValue.set(score);
  }, [score, springValue]);

  const color = score >= 0.85 ? '#f43f5e' : score >= 0.6 ? '#f59e0b' : '#10b981';
  
  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background Arc */}
        <path
          d="M 10 80 A 40 40 0 1 1 90 80"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Colored Arc */}
        <motion.path
          d="M 10 80 A 40 40 0 1 1 90 80"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${score * 188} 188`}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-3xl font-bold"
          style={{ color, fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <motion.span>{displayValue}</motion.span>
          <span className="text-lg">%</span>
        </motion.span>
        <span className="text-xs" style={{ color: '#71717a' }}>Risk Score</span>
      </div>
    </div>
  );
}

// ─── TopBar Component ─────────────────────────────────────
function TopBar({ activeNav, onNavChange }: { activeNav: NavItem; onNavChange: (n: NavItem) => void }) {
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const t1 = setInterval(() => {
      setLatency(p => Math.max(1, p + (Math.random() - 0.5) * 6 | 0));
    }, 2000);
    return () => { clearInterval(t1); };
  }, []);

  const sparkVolume = [65, 72, 68, 75, 78, 82, 85, 88, 84, 90, 87, 92];
  const sparkPrevention = [98, 98.5, 99, 98.8, 99.2, 99, 99.3, 99.1, 99.4, 99.2, 99.5, 99.2];
  const sparkRisk = [15, 18, 22, 19, 25, 28, 24, 30, 27, 23, 28, 23];
  const sparkLatency = [10, 12, 11, 14, 13, 15, 12, 14, 16, 13, 15, 12];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 pt-4 pb-3"
      style={{ background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Logo & Nav Row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
            <span className="font-semibold text-sm" style={{ color: '#f43f5e', fontFamily: 'Space Grotesk, sans-serif' }}>FL</span>
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>Forensic Lens</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {NAV_ITEMS.map((item) => (
            <motion.button
              key={item}
              onClick={() => onNavChange(item)}
              className="px-5 py-2 text-sm font-medium rounded-lg transition-colors relative"
              style={{ color: activeNav === item ? '#fafafa' : '#71717a' }}
              whileTap={{ scale: 0.98 }}
            >
              {activeNav === item && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item}</span>
            </motion.button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#52525b' }} />
            <input
              className="w-56 h-10 pl-10 pr-4 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#fafafa' }}
              placeholder="Search transactions, nodes..."
            />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'transparent', color: '#71717a' }}>
            <Settings className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ background: 'transparent', color: '#f43f5e' }}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#f43f5e' }} />
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} className="w-10 h-10 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <User className="w-5 h-5" style={{ color: '#71717a' }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Transaction Volume"
          value="8.47M"
          trend="up"
          trendValue="+12.5%"
          color="#10b981"
          sparkData={sparkVolume}
          delay={0}
        />
        <KPICard
          label="Prevention Rate"
          value="99.2%"
          trend="up"
          trendValue="+0.3%"
          color="#10b981"
          sparkData={sparkPrevention}
          delay={0.1}
        />
        <KPICard
          label="Active High-Risk"
          value="23"
          trend="down"
          trendValue="+5"
          color="#f43f5e"
          sparkData={sparkRisk}
          delay={0.2}
        />
        <KPICard
          label="System Latency"
          value={`${latency}ms`}
          trend="neutral"
          trendValue="Normal"
          color="#f59e0b"
          sparkData={sparkLatency}
          delay={0.3}
        />
      </div>
    </header>
  );
}

// ─── Alert Card Component ─────────────────────────────────
function AlertCard({ alert, selected, onSelect }: { alert: Alert; selected: boolean; onSelect: () => void }) {
  const barColor = riskColor(alert.riskScore);
  const confidence = Math.round(alert.riskScore * 100);
  const typeLabel = alert.type === 'high_risk' ? 'Critical' : alert.type === 'medium_risk' ? 'Suspicious' : 'Flagged';

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left rounded-xl p-4 transition-all cursor-pointer"
      style={{
        background: selected ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${barColor}15`, color: barColor, border: `1px solid ${barColor}30` }}>
          {typeLabel}
        </span>
        <span className="text-xs" style={{ color: '#71717a' }}>
          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <h4 className="font-medium text-sm mb-1" style={{ color: '#fafafa' }}>{alert.title}</h4>
      <p className="text-xs mb-3 line-clamp-1" style={{ color: '#71717a' }}>{alert.description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: '#a1a1aa' }}>{alert.entityId}</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div 
              className="h-full rounded-full"
              style={{ background: barColor, width: `${confidence}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-sm font-semibold" style={{ color: barColor }}>{confidence}%</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Alert Sidebar Component ────────────────────────────────
function AlertSidebar({ alerts, selectedId, onSelect }: { alerts: Alert[]; selectedId: string | null; onSelect: (a: Alert) => void }) {
  const criticalAlerts = alerts.filter(a => a.type === 'high_risk');
  const suspiciousAlerts = alerts.filter(a => a.type === 'medium_risk');
  const flaggedAlerts = alerts.filter(a => a.type === 'low_risk' || a.type === 'info');

  const renderSection = (title: string, items: Alert[], colorClass: string) => {
    if (items.length === 0) return null;
    const color = colorClass === 'critical' ? '#f43f5e' : colorClass === 'suspicious' ? '#f59e0b' : '#71717a';
    return (
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-sm font-medium" style={{ color: '#a1a1aa' }}>{title}</span>
          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}>{items.length}</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                selected={selectedId === alert.id}
                onSelect={() => onSelect(alert)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <aside className="h-full flex flex-col overflow-hidden" style={{ background: '#18181b', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold" style={{ color: '#fafafa' }}>Alert Feed</h2>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>{alerts.length}</span>
        </div>
        <p className="text-sm" style={{ color: '#71717a' }}>Real-time fraud detection</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderSection('Critical Alerts', criticalAlerts, 'critical')}
        {renderSection('Suspicious Activity', suspiciousAlerts, 'suspicious')}
        {renderSection('Under Review', flaggedAlerts, 'flagged')}
      </div>

      <div className="p-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
        <motion.button whileHover={{ x: 4 }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: '#71717a', background: 'transparent' }}>
          <ActivityIcon className="w-4 h-4" />
          <span>System Health</span>
        </motion.button>
        <motion.button whileHover={{ x: 4 }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: '#71717a', background: 'transparent' }}>
          <AlertTriangle className="w-4 h-4" />
          <span>Support</span>
        </motion.button>
      </div>
    </aside>
  );
}

// ─── Graph Canvas Component ────────────────────────────────
function GraphCanvas({ entityId, maxTs, onNodeClick }: { entityId: string | null; maxTs: Date; onNodeClick: (n: TransactionNode) => void }) {
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: 600, h: 500 });
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

  if (isLoading && !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(244,63,94,0.2)', borderTopColor: '#f43f5e' }} />
          <p className="text-sm" style={{ color: '#71717a' }}>Loading network data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full relative" style={{ background: '#09090b' }}>
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />

      {/* Risk Indicator */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 right-6 z-10 p-5 rounded-2xl"
        style={{ background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <RiskGauge score={0.78} />
      </motion.div>

      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 rounded-2xl z-10"
        style={{ background: 'rgba(24,24,27,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {[
          { color: '#f43f5e', label: 'Critical' },
          { color: '#f59e0b', label: 'High' },
          { color: '#eab308', label: 'Medium' },
          { color: '#10b981', label: 'Low' },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}40` }} />
            <span className="text-xs" style={{ color: '#a1a1aa' }}>{item.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Graph */}
      <div id="graph-canvas-wrap" className="absolute inset-0">
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
            backgroundColor="#09090b"
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
            <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="text-center">
              <Network className="w-12 h-12 mx-auto mb-3" style={{ color: '#3f3f46' }} />
              <p className="text-sm" style={{ color: '#52525b' }}>Select an alert to view its network</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Context Panel Component ────────────────────────────────
function ContextPanel({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const prediction = usePrediction(alert.entityId);

  useEffect(() => { prediction.mutate(); }, [alert.entityId]);

  const pred = prediction.data as PredictionResult | undefined;
  const confidence = pred ? Math.round(pred.confidence * 100) : Math.round(alert.riskScore * 100);
  const riskLevel = pred?.riskLevel || (alert.riskScore >= 0.85 ? 'critical' : alert.riskScore >= 0.6 ? 'high' : alert.riskScore >= 0.3 ? 'medium' : 'low');

  const colors = {
    critical: { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', text: '#f43f5e' },
    high: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
    medium: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', text: '#eab308' },
    low: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  }[riskLevel] || { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', text: '#f43f5e' };

  return (
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-full flex flex-col overflow-hidden"
      style={{ background: '#18181b', borderLeft: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Header */}
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
              animate={{ boxShadow: [`0 0 20px ${colors.text}20`, `0 0 40px ${colors.text}30`, `0 0 20px ${colors.text}20`] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: colors.text }} />
            </motion.div>
            <div>
              <h2 className="font-semibold" style={{ color: '#fafafa' }}>{alert.entityId}</h2>
              <p className="text-sm" style={{ color: '#71717a' }}>Institutional Account</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: '#71717a', background: 'transparent' }}>
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Confidence Badge */}
        <motion.div 
          className="p-4 rounded-xl text-center"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: colors.text }}>Illicit Confidence</p>
          <p className="text-3xl font-bold" style={{ color: colors.text, fontFamily: 'Space Grotesk, sans-serif' }}>{confidence}%</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* AI Insight */}
        <motion.div 
          className="p-4 rounded-xl"
          style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.1)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4" style={{ color: '#38bdf8' }} />
            <span className="text-sm font-medium" style={{ color: '#fafafa' }}>AI Analysis</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{alert.aiVerdict}</p>
        </motion.div>

        {/* Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium" style={{ color: '#fafafa' }}>Transaction Details</h3>
          {[
            { label: 'IP Address', value: '192.168.10.4 (VPN)' },
            { label: 'Device ID', value: 'AX-990-PRO-MAX' },
            { label: 'Time', value: new Date(alert.timestamp).toLocaleTimeString() },
            { label: 'Transactions', value: alert.transactionCount.toLocaleString() },
            { label: 'Volume', value: `$${alert.totalVolume.toLocaleString()}` },
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <span className="text-sm" style={{ color: '#71717a' }}>{item.label}</span>
              <span className="text-sm font-medium font-mono" style={{ color: '#fafafa' }}>{item.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium" style={{ color: '#fafafa' }}>Recent Transactions</h3>
          {[
            { type: 'OUTBOUND', amount: '-$45,000.00', color: '#f43f5e' },
            { type: 'TRANSFER', amount: '-$12,400.00', color: '#f59e0b' },
            { type: 'INBOUND', amount: '+$88,200.00', color: '#10b981' },
          ].map((tx, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)' }}
              whileHover={{ x: 4 }}
            >
              <span className="text-xs font-medium" style={{ color: '#71717a' }}>{tx.type}</span>
              <span className="text-sm font-medium" style={{ color: tx.color }}>{tx.amount}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 rounded-xl font-semibold text-sm" style={{ background: '#f43f5e', color: '#fff' }}>
          Quarantine Account
        </motion.button>
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>
            Whitelist
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.08)' }}>
            Investigate
          </motion.button>
        </div>
      </div>
    </motion.aside>
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
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#09090b' }}>
      <TopBar activeNav={activeNav} onNavChange={setActiveNav} />

      <main className="flex-1 mt-[192px] flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-96 shrink-0 overflow-hidden">
          <AlertSidebar alerts={alerts} selectedId={selectedAlert?.id ?? null} onSelect={setSelectedAlert} />
        </div>

        {/* Center Graph */}
        <div className="flex-1 relative overflow-hidden">
          <GraphCanvas entityId={selectedAlert?.entityId ?? null} maxTs={maxTs} onNodeClick={handleNodeClick} />
        </div>

        {/* Right Panel */}
        <AnimatePresence>
          {selectedAlert && (
            <div className="w-[420px] shrink-0 overflow-hidden">
              <ContextPanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
