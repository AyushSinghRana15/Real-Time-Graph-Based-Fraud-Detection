import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, ChevronDown, ChevronRight, MapPin, Clock, DollarSign, Activity, Network, AlertTriangle } from 'lucide-react';
import type { Alert, PredictionResult, GraphData } from '../../types';
import { useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

interface AlertSlideOverProps {
  alert: Alert | null;
  prediction: PredictionResult | undefined;
  subgraph: GraphData | undefined;
  isLoadingPrediction: boolean;
  isLoadingSubgraph: boolean;
  onClose: () => void;
  onInvestigate: () => void;
}

const riskColors = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
};

const actionColors = {
  block: 'bg-red-500',
  review: 'bg-orange-500',
  allow: 'bg-green-500',
  monitor: 'bg-blue-500',
};

export function AlertSlideOver({ 
  alert, 
  prediction, 
  subgraph,
  isLoadingPrediction,
  isLoadingSubgraph,
  onClose, 
  onInvestigate 
}: AlertSlideOverProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['verdict', 'subgraph']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getNodeColor = (score: number) => {
    if (score >= 0.85) return '#ef4444';
    if (score >= 0.6) return '#f97316';
    if (score >= 0.3) return '#eab308';
    return '#22c55e';
  };

  const nodeThreeObject = (node: any) => {
    const sphereGeom = new THREE.SphereGeometry(2, 16, 16);
    const sphereMat = new THREE.MeshPhongMaterial({ 
      color: getNodeColor(node.riskScore ?? 0),
      transparent: true,
      opacity: 0.9,
      emissive: getNodeColor(node.riskScore ?? 0),
      emissiveIntensity: 0.3,
    });
    return new THREE.Mesh(sphereGeom, sphereMat);
  };

  if (!alert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-screen w-[420px] bg-black/95 backdrop-blur-xl border-l border-zinc-800/50 flex flex-col z-50"
      >
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <h3 className="text-sm font-mono font-semibold text-white tracking-wider">XAI INVESTIGATOR</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                alert.type === 'high_risk' ? 'bg-red-500/20 text-red-400' :
                alert.type === 'medium_risk' ? 'bg-orange-500/20 text-orange-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {alert.type.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                RISK: {(alert.riskScore * 100).toFixed(0)}%
              </span>
            </div>
            <h2 className="text-base font-mono font-bold text-white mb-1 cyber-text">
              {alert.title}
            </h2>
            <p className="text-xs text-zinc-400 font-mono">{alert.description}</p>
          </div>

          <div className="p-4 border-b border-zinc-800/50">
            <button
              onClick={() => toggleSection('verdict')}
              className="w-full flex items-center justify-between py-2 text-zinc-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono tracking-wider">AI VERDICT</span>
              </div>
              {expandedSections.includes('verdict') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('verdict') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-xs text-zinc-300 font-mono leading-relaxed bg-zinc-900/50 p-3 rounded border border-zinc-800/50">
                  {alert.aiVerdict}
                </p>
                
                {isLoadingPrediction && (
                  <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded border border-zinc-800/50">
                    <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-xs text-cyan-400 font-mono">DEEP ANALYSIS RUNNING...</span>
                  </div>
                )}

                {prediction && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-3 rounded border border-zinc-800/50">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded font-mono text-xs font-semibold border ${riskColors[prediction.riskLevel].bg} ${riskColors[prediction.riskLevel].border} ${riskColors[prediction.riskLevel].text}`}>
                          {prediction.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">
                          CONF: {(prediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        {prediction.factors.map((factor, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 font-mono">
                            <span className="text-cyan-400">›</span>
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded border border-zinc-800/50">
                      <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Action</span>
                      <span className={`px-3 py-1 rounded font-mono text-xs font-semibold ${actionColors[prediction.recommendedAction]}`}>
                        {prediction.recommendedAction.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          <div className="p-4 border-b border-zinc-800/50">
            <button
              onClick={() => toggleSection('metadata')}
              className="w-full flex items-center justify-between py-2 text-zinc-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono tracking-wider">METADATA</span>
              </div>
              {expandedSections.includes('metadata') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('metadata') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="grid grid-cols-2 gap-2"
              >
                <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800/50">
                  <div className="flex items-center gap-1 text-zinc-500 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] font-mono uppercase">Entity</span>
                  </div>
                  <p className="text-xs font-mono text-lime-400">{alert.entityId}</p>
                </div>
                <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800/50">
                  <div className="flex items-center gap-1 text-zinc-500 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-mono uppercase">Time</span>
                  </div>
                  <p className="text-xs font-mono text-white">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800/50">
                  <div className="flex items-center gap-1 text-zinc-500 mb-1">
                    <Activity className="w-3 h-3" />
                    <span className="text-[10px] font-mono uppercase">Txns</span>
                  </div>
                  <p className="text-xs font-mono text-white">{alert.transactionCount.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800/50">
                  <div className="flex items-center gap-1 text-zinc-500 mb-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-[10px] font-mono uppercase">Volume</span>
                  </div>
                  <p className="text-xs font-mono text-white">${alert.totalVolume.toLocaleString()}</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4">
            <button
              onClick={() => toggleSection('subgraph')}
              className="w-full flex items-center justify-between py-2 text-zinc-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono tracking-wider">SUBGRAPH ISOLATION</span>
              </div>
              {expandedSections.includes('subgraph') ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {expandedSections.includes('subgraph') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-2"
              >
                <div className="h-[250px] bg-black/50 rounded border border-zinc-800/50 overflow-hidden relative">
                  {isLoadingSubgraph ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    </div>
                  ) : subgraph ? (
                    <ForceGraph3D
                      graphData={subgraph}
                      nodeId="id"
                      nodeThreeObject={nodeThreeObject}
                      linkDirectionalParticles={2}
                      linkDirectionalParticleColor={() => '#f97316'}
                      cooldownTicks={50}
                      backgroundColor="#000000"
                      width={380}
                      height={250}
                      showNavInfo={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-zinc-500 font-mono text-xs">NO SUBGRAPH DATA</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800/50">
          <button
            onClick={onInvestigate}
            disabled={isLoadingPrediction}
            className="w-full py-3 rounded bg-lime-500/20 hover:bg-lime-500/30 disabled:bg-zinc-800/50 border border-lime-500/50 disabled:border-zinc-700/50 text-lime-400 disabled:text-zinc-500 text-sm font-mono font-semibold tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            {isLoadingPrediction ? (
              <>
                <div className="w-4 h-4 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin" />
                ANALYZING...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                RUN XAI ANALYSIS
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
