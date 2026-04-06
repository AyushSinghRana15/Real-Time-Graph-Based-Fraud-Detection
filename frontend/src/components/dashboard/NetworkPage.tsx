import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Activity, X, RefreshCw, GitBranch, AlertTriangle, 
  TrendingUp, Loader2, ArrowRight, Network as NetworkIcon
} from 'lucide-react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { riskColor } from '../../utils/colors';
import { useGraphAnalytics } from '../../hooks/useRealTime';

const TRANSACTION_TYPES = ['TRANSFER', 'CASH_OUT', 'PAYMENT', 'CASH_IN', 'DEBIT'] as const;

interface GraphNode {
  id: string;
  label: string;
  riskScore: number;
  isCycle: boolean;
  degree?: number;
}

interface GraphLink {
  source: string;
  target: string;
  isCycle: boolean;
}

interface PredictionResult {
  is_fraud: boolean;
  fraud_probability: number;
  graph_metrics: {
    degree: number;
    clustering: number;
    cycle_detected: boolean;
    base_confidence: number;
  };
}

const PROXY_NODES: GraphNode[] = [
  { id: 'user_1', label: 'user_1', riskScore: 0.3, isCycle: false, degree: 3 },
  { id: 'user_2', label: 'user_2', riskScore: 0.5, isCycle: false, degree: 2 },
  { id: 'user_3', label: 'user_3', riskScore: 0.8, isCycle: true, degree: 4 },
  { id: 'user_4', label: 'user_4', riskScore: 0.4, isCycle: false, degree: 1 },
  { id: 'user_5', label: 'user_5', riskScore: 0.6, isCycle: true, degree: 3 },
  { id: 'user_6', label: 'user_6', riskScore: 0.2, isCycle: false, degree: 2 },
  { id: 'user_7', label: 'user_7', riskScore: 0.7, isCycle: true, degree: 2 },
  { id: 'user_8', label: 'user_8', riskScore: 0.45, isCycle: false, degree: 1 },
];

const PROXY_LINKS: GraphLink[] = [
  { source: 'user_1', target: 'user_2', isCycle: false },
  { source: 'user_2', target: 'user_3', isCycle: false },
  { source: 'user_3', target: 'user_5', isCycle: true },
  { source: 'user_5', target: 'user_3', isCycle: true },
  { source: 'user_1', target: 'user_4', isCycle: false },
  { source: 'user_4', target: 'user_6', isCycle: false },
  { source: 'user_3', target: 'user_7', isCycle: true },
  { source: 'user_7', target: 'user_3', isCycle: true },
  { source: 'user_6', target: 'user_8', isCycle: false },
  { source: 'user_8', target: 'user_1', isCycle: false },
];

function createTextSprite(text: string, color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(text, 128, 32);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(12, 3, 1);
  return sprite;
}

export function NetworkPage({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [nodes, setNodes] = useState<GraphNode[]>(PROXY_NODES);
  const [links, setLinks] = useState<GraphLink[]>(PROXY_LINKS);
  const [currentEdges, setCurrentEdges] = useState<string[]>(PROXY_LINKS.map(l => `${l.source} → ${l.target}`));
  const [cycleNodes, setCycleNodes] = useState<string[]>(['user_3', 'user_5', 'user_7']);
  const [cycles, setCycles] = useState<string[][]>([['user_3', 'user_5'], ['user_3', 'user_7']]);
  const [initialized, setInitialized] = useState(false);

  const [formData, setFormData] = useState({
    sender_id: 1,
    receiver_id: 2,
    step: 10,
    type: 'TRANSFER' as typeof TRANSACTION_TYPES[number],
    amount: 50000,
    oldbalanceOrg: 100000,
    newbalanceOrig: 50000,
    oldbalanceDest: 0,
    newbalanceDest: 50000,
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const { analytics } = useGraphAnalytics(true, 5000);

  useEffect(() => {
    if (analytics && analytics.cycles.length > 0) {
      setCycles(analytics.cycles.map(c => c.nodes));
      setCycleNodes(analytics.nodes_in_cycles || []);
    }
  }, [analytics]);

  useEffect(() => {
    const handleResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3001/api/graph/state');
      const data = await res.json();
      
      if (data.nodes && data.nodes.length > 0) {
        const nodeDegreeMap: Record<string, number> = {};
        data.edges.forEach((e: any) => {
          nodeDegreeMap[e.source] = (nodeDegreeMap[e.source] || 0) + 1;
          nodeDegreeMap[e.target] = (nodeDegreeMap[e.target] || 0) + 1;
        });

        const newNodes: GraphNode[] = data.nodes.map((n: any) => ({
          id: n.id,
          label: n.label || n.id,
          riskScore: n.risk / 100,
          isCycle: cycleNodes.includes(n.id),
          degree: nodeDegreeMap[n.id] || 0,
        }));

        const validIds = new Set(newNodes.map(n => n.id));
        const newLinks: GraphLink[] = data.edges
          .filter((l: any) => validIds.has(l.source) && validIds.has(l.target))
          .map((l: any) => ({
            source: l.source,
            target: l.target,
            isCycle: cycleNodes.includes(l.source) && cycleNodes.includes(l.target),
          }));

        setNodes(newNodes);
        setLinks(newLinks);
        setCurrentEdges(newLinks.map(l => `${l.source} → ${l.target}`));
        setInitialized(true);
      }
    } catch (error) {
      console.error('Error fetching graph:', error);
    }
  }, [cycleNodes]);

  useEffect(() => {
    if (!initialized) {
      fetchGraph();
    }
    const interval = setInterval(() => {
      if (!initialized) fetchGraph();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchGraph, initialized]);

  const handlePredict = async () => {
    const sender = `user_${formData.sender_id}`;
    const receiver = `user_${formData.receiver_id}`;

    if (sender === receiver) {
      alert('Sender and Receiver cannot be same!');
      return;
    }

    setIsPredicting(true);
    setShowResult(false);

    try {
      const response = await fetch('http://localhost:3001/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: sender,
          receiver_id: receiver,
          amount: formData.amount,
          type: formData.type,
          oldbalanceOrg: formData.oldbalanceOrg,
          newbalanceOrig: formData.newbalanceOrig,
          oldbalanceDest: formData.oldbalanceDest,
          newbalanceDest: formData.newbalanceDest,
        }),
      });

      const data = await response.json();
      setPrediction(data);

      await fetchGraph();
      queryClient.invalidateQueries({ queryKey: ['graphState'] });
      queryClient.invalidateQueries({ queryKey: ['graphAnalytics'] });

      setShowResult(true);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset graph? This will clear all transactions.')) return;
    setIsResetting(true);
    try {
      await fetch('http://localhost:3001/api/graph/reset', { method: 'POST' });
      setPrediction(null);
      setShowResult(false);
      setCurrentEdges([]);
      setCycles([]);
      setCycleNodes([]);
      setNodes([]);
      setLinks([]);
      setInitialized(false);
      await fetchGraph();
      queryClient.invalidateQueries({ queryKey: ['graphState'] });
      queryClient.invalidateQueries({ queryKey: ['graphAnalytics'] });
    } catch (error) {
      console.error('Reset failed:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const nodeObj = useCallback((node: any) => {
    const isCycle = cycleNodes.includes(node.id) || node.isCycle;
    const baseColor = isCycle ? '#ef4444' : riskColor(node.riskScore);
    const g = new THREE.Group();

    const degree = node.degree || 1;
    const nodeSize = isCycle ? 8 : Math.max(3, Math.min(6, 2 + degree * 0.8));

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(nodeSize, 24, 24),
      new THREE.MeshPhongMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.95,
        emissive: baseColor,
        emissiveIntensity: isCycle ? 0.8 : 0.3,
      }),
    );
    g.add(mesh);

    if (isCycle) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(nodeSize + 3, nodeSize + 4.5, 32),
        new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
      );
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    }

    const labelColor = isCycle ? '#ef4444' : '#60a5fa';
    const sprite = createTextSprite(node.label, labelColor);
    sprite.position.y = nodeSize + 4;
    g.add(sprite);

    return g;
  }, [cycleNodes]);

  const linkColor = useCallback((link: any) => {
    if (link.isCycle) return 'rgba(239, 68, 68, 0.7)';
    return 'rgba(255,255,255,0.15)';
  }, []);

  const linkWidth = useCallback((link: any) => {
    return link.isCycle ? 3 : 1.5;
  }, []);

  const sender = `user_${formData.sender_id}`;
  const receiver = `user_${formData.receiver_id}`;
  const prob = prediction ? prediction.fraud_probability / 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
      style={{ background: '#09090b' }}
    >
      {/* 3D Graph Background */}
      <div className="absolute inset-0">
        {nodes.length > 0 && (
          <ForceGraph3D
            ref={graphRef}
            graphData={{ nodes, links }}
            nodeId="id"
            nodeLabel={(node: any) => `${node.label} (${(node.riskScore * 100).toFixed(0)}%)`}
            nodeThreeObject={nodeObj}
            nodeThreeObjectExtend={false}
            linkWidth={linkWidth}
            linkColor={linkColor}
            linkDirectionalParticles={3}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => '#f59e0b'}
            linkDirectionalParticleSpeed={0.008}
            cooldownTicks={150}
            onEngineStop={() => graphRef.current?.zoomToFit(600, 40)}
            backgroundColor="#09090b"
            width={dims.w}
            height={dims.h}
            showNavInfo={false}
            controlType="orbit"
          />
        )}
      </div>

      {/* Header */}
      <div 
        className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between px-6 py-4 rounded-2xl"
        style={{
          background: 'rgba(24,24,27,0.92)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(244,63,94,0.05) 100%)',
              border: '1px solid rgba(244,63,94,0.3)',
            }}
          >
            <NetworkIcon className="w-5 h-5" style={{ color: '#f43f5e' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>
              AI Fraud Detection with Graph Intelligence
            </h1>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#71717a' }}>
              <span className="flex items-center gap-1">
                <span style={{ color: '#22c55e' }}>✓</span> Manual Transaction Flow
              </span>
              <span className="flex items-center gap-1">
                <span style={{ color: '#22c55e' }}>✓</span> Graph Network Tracking
              </span>
              <span className="flex items-center gap-1">
                <span style={{ color: '#22c55e' }}>✓</span> Cycle Detection (Fraud Rings)
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#71717a' }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Left Panel - Transaction Input */}
      <div 
        className="absolute top-24 left-4 bottom-4 w-80 overflow-y-auto z-40 rounded-2xl p-5 space-y-4"
        style={{
          background: 'rgba(24,24,27,0.92)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: '#a1a1aa' }}>TRANSACTION DETAILS</h2>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Reset
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>Sender ID</label>
              <input
                type="number"
                value={formData.sender_id}
                onChange={(e) => setFormData({ ...formData, sender_id: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>Receiver ID</label>
              <input
                type="number"
                value={formData.receiver_id}
                onChange={(e) => setFormData({ ...formData, receiver_id: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>Step</label>
            <input
              type="number"
              value={formData.step}
              onChange={(e) => setFormData({ ...formData, step: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>Transaction Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof TRANSACTION_TYPES[number] })}
              className="w-full h-10 px-3 rounded-lg text-sm cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>Old Balance Orig</label>
              <input
                type="number"
                value={formData.oldbalanceOrg}
                onChange={(e) => setFormData({ ...formData, oldbalanceOrg: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>New Balance Orig</label>
              <input
                type="number"
                value={formData.newbalanceOrig}
                onChange={(e) => setFormData({ ...formData, newbalanceOrig: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>Old Balance Dest</label>
              <input
                type="number"
                value={formData.oldbalanceDest}
                onChange={(e) => setFormData({ ...formData, oldbalanceDest: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>New Balance Dest</label>
              <input
                type="number"
                value={formData.newbalanceDest}
                onChange={(e) => setFormData({ ...formData, newbalanceDest: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fafafa' }}
              />
            </div>
          </div>
        </div>

        <motion.button
          onClick={handlePredict}
          disabled={isPredicting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
            boxShadow: '0 4px 20px rgba(244,63,94,0.4)',
          }}
        >
          {isPredicting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Predict
            </>
          )}
        </motion.button>

        {/* Transaction Flow */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#52525b' }}>Transaction Flow</p>
            <p className="text-sm font-mono" style={{ color: '#a1a1aa' }}>
              {sender} <ArrowRight className="inline w-4 h-4 mx-1" /> {receiver}
            </p>
          </motion.div>
        )}

        {/* Current Edges */}
        {currentEdges.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: '#52525b' }}>Current Edges ({currentEdges.length})</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {currentEdges.slice(0, 10).map((edge, i) => (
                <p key={i} className="text-[10px] font-mono truncate" style={{ color: '#71717a' }}>{edge}</p>
              ))}
              {currentEdges.length > 10 && (
                <p className="text-[10px]" style={{ color: '#52525b' }}>...and {currentEdges.length - 10} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Results */}
      <AnimatePresence>
        {showResult && prediction && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute top-24 right-4 bottom-4 w-96 overflow-y-auto z-40 rounded-2xl p-5 space-y-4"
            style={{
              background: 'rgba(24,24,27,0.92)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2 className="text-sm font-bold" style={{ color: '#a1a1aa' }}>PREDICTION RESULT</h2>

            {/* Alert Banner */}
            <div 
              className="p-4 rounded-xl text-center"
              style={{
                background: prediction.is_fraud ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                border: `1px solid ${prediction.is_fraud ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              }}
            >
              <p className="text-lg font-bold" style={{ color: prediction.is_fraud ? '#ef4444' : '#22c55e' }}>
                {prediction.is_fraud ? '🚨 Fraud Detected!' : '✅ Safe Transaction'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-2xl font-bold" style={{ color: riskColor(prob) }}>{(prob * 100).toFixed(1)}%</p>
                <p className="text-[10px] uppercase" style={{ color: '#52525b' }}>Probability</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{prediction.graph_metrics.degree}</p>
                <p className="text-[10px] uppercase" style={{ color: '#52525b' }}>Degree</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-2xl font-bold" style={{ color: '#818cf8' }}>{prediction.graph_metrics.clustering.toFixed(2)}</p>
                <p className="text-[10px] uppercase" style={{ color: '#52525b' }}>Clustering</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-2xl font-bold" style={{ color: prediction.graph_metrics.cycle_detected ? '#ef4444' : '#22c55e' }}>
                  {prediction.graph_metrics.cycle_detected ? 'YES' : 'NO'}
                </p>
                <p className="text-[10px] uppercase" style={{ color: '#52525b' }}>Cycle</p>
              </div>
            </div>

            {/* Fraud Probability Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#71717a' }}>Safe</span>
                <span className="text-xs" style={{ color: '#71717a' }}>Fraud</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div 
                  className="h-full"
                  style={{ width: `${(1 - prob) * 100}%`, background: '#22c55e' }}
                />
                <div 
                  className="h-full"
                  style={{ width: `${prob * 100}%`, background: '#ef4444' }}
                />
              </div>
            </div>

            {/* Cycle Warning */}
            {prediction.graph_metrics.cycle_detected && (
              <div 
                className="p-4 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <GitBranch className="w-6 h-6" style={{ color: '#ef4444' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#ef4444' }}>Fraud Cycle Detected!</p>
                  <p className="text-xs" style={{ color: '#fca5a5' }}>Circular fund flow pattern identified</p>
                </div>
              </div>
            )}

            {/* Detected Cycles */}
            {cycles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: '#ef4444' }}>
                  <AlertTriangle className="w-4 h-4" />
                  Detected Cycles ({cycles.length})
                </h3>
                <div className="space-y-2">
                  {cycles.slice(0, 5).map((cycle, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <p className="text-[10px] font-bold mb-1" style={{ color: '#ef4444' }}>CYCLE #{i + 1}</p>
                      <p className="text-xs font-mono" style={{ color: '#a1a1aa' }}>
                        {cycle.join(' → ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Graph Features */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: '#818cf8' }}>
                <Activity className="w-4 h-4" />
                Graph Features
              </h3>
              <div className="p-3 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#71717a' }}>Base Confidence</span>
                  <span className="text-xs font-mono" style={{ color: '#fafafa' }}>
                    {(prediction.graph_metrics.base_confidence).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-6 px-6 py-3 rounded-full"
        style={{
          background: 'rgba(24,24,27,0.92)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }} />
          <span className="text-xs" style={{ color: '#71717a' }}>Standard Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
          <span className="text-xs" style={{ color: '#71717a' }}>Fraud Ring</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5" style={{ background: '#ef4444' }} />
          <span className="text-xs" style={{ color: '#71717a' }}>Cycle Edge</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
          <div className="w-7 h-7 rounded-full border-2 border-red-400" style={{ marginLeft: -16 }} />
          <span className="text-xs" style={{ color: '#71717a' }}>High Degree</span>
        </div>
      </div>
    </motion.div>
  );
}
