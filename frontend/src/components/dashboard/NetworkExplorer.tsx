import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Activity, Info, ChevronLeft, ChevronRight, GitBranch, Network, Zap } from 'lucide-react';

interface GraphStats {
  total_nodes: number;
  total_edges: number;
  high_risk_nodes: number;
  network_avg_risk: number;
}

interface Cycle {
  path: string;
  nodes: string[];
  length: number;
  risk: number;
}

interface NodeAnalytics {
  id: string;
  label: string;
  degree: number;
  clustering: number;
  pagerank: number;
  risk: number;
  in_cycle: boolean;
}

interface GraphAnalytics {
  cycles: Cycle[];
  cycle_count: number;
  nodes_in_cycles: string[];
  top_hubs: NodeAnalytics[];
  top_clusters: NodeAnalytics[];
  network_density: number;
  total_nodes: number;
  total_edges: number;
}

interface NetworkExplorerProps {
  isActive: boolean;
  stats: GraphStats;
  riskThresholds: { label: string; color: string; minRisk: number }[];
  onClose: () => void;
}

export function NetworkExplorer({ isActive, stats, riskThresholds, onClose }: NetworkExplorerProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [analytics, setAnalytics] = useState<GraphAnalytics | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!isActive) return;
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/graph/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch {
        // Backend not reachable
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/30 pointer-events-none" />
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="absolute top-20 z-30 w-8 h-16 flex items-center justify-center rounded-r-xl pointer-events-auto"
            style={{
              background: 'rgba(24,24,27,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              left: isPanelOpen ? '340px' : '0',
              transition: 'left 0.3s ease',
            }}
          >
            {isPanelOpen ? <ChevronLeft className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
          </motion.button>

          <AnimatePresence>
            {isPanelOpen && (
              <motion.div
                initial={{ x: -360, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -360, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute left-4 top-20 bottom-6 w-80 overflow-y-auto pointer-events-auto"
              >
                <div 
                  className="h-full rounded-2xl p-5 space-y-4"
                  style={{
                    background: 'rgba(24,24,27,0.92)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-base font-bold text-zinc-200" style={{ letterSpacing: '0.1em' }}>GRAPH ANALYTICS</h2>
                    </div>
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className="px-2 py-1 rounded text-[10px] font-medium"
                      style={{
                        background: autoRotate ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${autoRotate ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        color: autoRotate ? '#818cf8' : '#71717a'
                      }}
                    >
                      {autoRotate ? 'ORBIT ON' : 'ORBIT OFF'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="text-2xl font-bold text-zinc-100">{stats.total_nodes}</div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Nodes</p>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="text-2xl font-bold text-zinc-100">{stats.total_edges}</div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Edges</p>
                    </div>
                  </div>

                  {analytics && analytics.cycle_count > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch className="w-4 h-4 text-red-400" />
                        <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Fraud Rings Detected</h3>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {analytics.cycles.slice(0, 5).map((cycle, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-3 rounded-xl"
                            style={{
                              background: 'rgba(239,68,68,0.1)',
                              border: '1px solid rgba(239,68,68,0.2)',
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-red-400">RING #{i + 1}</span>
                              <span className="text-[10px] font-mono text-red-300">{cycle.risk}% risk</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">{cycle.path}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[10px] text-zinc-500">{cycle.length} nodes</span>
                              <button
                                className="text-[10px] px-2 py-0.5 rounded"
                                style={{
                                  background: 'rgba(239,68,68,0.2)',
                                  color: '#fca5a5'
                                }}
                              >
                                Investigate
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analytics && analytics.top_hubs.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Network className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Top Hub Nodes</h3>
                      </div>
                      <div className="space-y-1">
                        {analytics.top_hubs.map((node, i) => (
                          <div
                            key={node.id}
                            className="flex items-center justify-between p-2 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.02)' }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-zinc-500 w-4">#{i + 1}</span>
                              <span className="text-xs text-zinc-300">{node.label}</span>
                              {node.in_cycle && (
                                <motion.span
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: '#ef4444' }}
                                />
                              )}
                            </div>
                            <span className="text-xs font-mono text-amber-400">{node.degree}°</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analytics && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Network Health</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="text-lg font-bold" style={{ color: stats.network_avg_risk > 50 ? '#ef4444' : '#22c55e' }}>
                            {stats.network_avg_risk.toFixed(1)}%
                          </div>
                          <p className="text-[9px] uppercase text-zinc-500">Avg Risk</p>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="text-lg font-bold text-zinc-200">
                            {analytics.network_density.toFixed(3)}
                          </div>
                          <p className="text-[9px] uppercase text-zinc-500">Density</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="absolute bottom-6 left-6 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl rounded-2xl p-4 space-y-4"
              style={{
                background: 'rgba(24,24,27,0.85)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Graph Legend</h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Node Size</p>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
                  <span className="text-xs text-zinc-400">Standard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                  <span className="text-xs text-zinc-400">High Risk</span>
                </div>
              </div>
              
              <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Risk Level</p>
                {riskThresholds.map((t) => (
                  <div key={t.label} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }} />
                    <span className="text-xs text-zinc-400">{t.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          <div className="absolute bottom-6 right-6 pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium backdrop-blur-xl"
              style={{
                background: 'rgba(24,24,27,0.85)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#a1a1aa'
              }}
            >
              Exit Network Explorer
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
