import { motion, AnimatePresence } from 'framer-motion';
import { Globe, AlertTriangle, TrendingUp, Activity, Circle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GraphStats {
  total_nodes: number;
  total_edges: number;
  high_risk_nodes: number;
  network_avg_risk: number;
}

interface NetworkExplorerProps {
  isActive: boolean;
  stats: GraphStats;
  riskThresholds: { label: string; color: string; minRisk: number }[];
  onClose: () => void;
}

export function NetworkExplorer({ isActive, stats, riskThresholds, onClose }: NetworkExplorerProps) {
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/50 pointer-events-none" />
          
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
          
          <div className="absolute top-20 right-6 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl rounded-2xl p-5 space-y-4"
              style={{
                background: 'rgba(24,24,27,0.85)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Network Stats</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="text-2xl font-bold text-zinc-100"
                  >
                    {stats.total_nodes}
                  </motion.div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Nodes</p>
                </div>
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="text-2xl font-bold text-zinc-100"
                  >
                    {stats.total_edges}
                  </motion.div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Edges</p>
                </div>
              </div>
              
              <div className="pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-zinc-400">High Risk Nodes</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm font-bold text-red-400"
                  >
                    {stats.high_risk_nodes}
                  </motion.span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-zinc-400">Avg Risk</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm font-bold"
                    style={{
                      color: stats.network_avg_risk > 50 ? '#ef4444' : 
                             stats.network_avg_risk > 25 ? '#eab308' : '#22c55e'
                    }}
                  >
                    {stats.network_avg_risk.toFixed(1)}%
                  </motion.span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAutoRotate(!autoRotate)}
                className="w-full mt-2 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: autoRotate ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${autoRotate ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: autoRotate ? '#818cf8' : '#71717a'
                }}
              >
                {autoRotate ? 'Auto-Orbit: ON' : 'Auto-Orbit: OFF'}
              </motion.button>
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
