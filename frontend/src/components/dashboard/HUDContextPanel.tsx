import { motion } from 'framer-motion';
import { Shield, X, Activity, AlertTriangle, GitBranch, Zap, ChevronLeft } from 'lucide-react';
import type { Alert } from '../../types';

const REASON_ICONS: Record<string, typeof AlertTriangle> = {
  'Amount Anomaly': Zap,
  'Large Transaction': AlertTriangle,
  'Graph Cycle': GitBranch,
  'High Degree Node': GitBranch,
  'Elevated Degree': GitBranch,
  'Dense Cluster': AlertTriangle,
  'ML Model Alert': Activity,
  'ML Model Flag': Activity,
  'High Risk Account': Shield,
  'New Account': Activity,
  'Confirmed Fraud': AlertTriangle,
};

interface HUDContextPanelProps {
  alert: Alert | null;
  onClose: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function HUDContextPanel({ alert, onClose, isCollapsed, onToggle }: HUDContextPanelProps) {
  if (!alert) return null;

  const confidence = Math.round(alert.confidence);
  const riskLevel = alert.type === 'high_risk' ? 'critical' : alert.type === 'medium_risk' ? 'high' : alert.type === 'low_risk' ? 'medium' : 'low';

  const colors = {
    critical: { text: '#f43f5e', glow: 'rgba(244,63,94,0.4)' },
    high: { text: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
    medium: { text: '#eab308', glow: 'rgba(234,179,8,0.4)' },
    low: { text: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  }[riskLevel] || { text: '#f43f5e', glow: 'rgba(244,63,94,0.4)' };

  const reasons = (alert as Alert & { reasons?: Array<{ factor: string; detail: string; weight: number }> }).reasons || [
    { factor: 'Graph Cycle', detail: 'Circular fund flow detected', weight: 30 },
    { factor: 'Amount Anomaly', detail: '$12.4M exceeds $10M threshold', weight: 40 },
    { factor: 'High Degree Node', detail: 'Degree 7 exceeds hub threshold', weight: 10 },
  ];

  const maxWeight = Math.max(...reasons.map(r => r.weight));

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: 1, 
        width: isCollapsed ? 48 : 320,
        x: 0
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-[10%] h-[80%] flex flex-col overflow-hidden rounded-2xl"
      style={{
        right: 16,
        background: 'rgba(12,12,15,0.35)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}
    >
      {!isCollapsed ? (
        <>
          <div className="px-4 py-3 shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${colors.text}15` }}>
                <Shield className="w-3.5 h-3.5" style={{ color: colors.text }} />
              </div>
              <h2 className="text-sm font-medium" style={{ color: '#fafafa' }}>Entity Details</h2>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#71717a' }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#71717a' }}
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3" style={{ 
                  background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                }}>
                  <span className="text-3xl font-bold" style={{ color: colors.text, fontFamily: 'Space Grotesk, sans-serif' }}>{confidence}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: colors.text }}>Illicit Confidence</p>
              </div>

              <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors.text}10` }}>
                    <Shield className="w-5 h-5" style={{ color: colors.text }} />
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#71717a' }}>Institutional Account</p>
                    <h3 className="font-semibold text-sm" style={{ color: '#fafafa' }}>{alert.entityName}</h3>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: '#52525b' }}>{alert.entityId}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4">
              <h3 className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: '#71717a' }}>
                <span className="w-4 h-px" style={{ background: colors.text }} />
                Risk Factors
              </h3>
              <div className="space-y-3">
                {reasons.slice(0, 3).map((reason, i) => {
                  const Icon = REASON_ICONS[reason.factor] || AlertTriangle;
                  const weightPct = (reason.weight / maxWeight) * 100;
                  
                  return (
                    <div key={i} className="relative">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `${colors.text}10` }}>
                          <Icon className="w-2.5 h-2.5" style={{ color: colors.text }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: '#fafafa' }}>{reason.factor}</span>
                        <span className="text-[10px] ml-auto" style={{ color: '#52525b' }}>{reason.detail}</span>
                      </div>
                      <div className="h-1 rounded-full ml-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${weightPct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ 
                            background: colors.text,
                            boxShadow: `0 0 8px ${colors.text}50`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 pb-4">
              <h3 className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: '#71717a' }}>
                <Activity className="w-3.5 h-3.5" />
                Details
              </h3>
              <div className="space-y-1">
                {[
                  { label: 'Amount', value: `$${alert.amount.toLocaleString()}` },
                  { label: 'Time', value: new Date(alert.timestamp).toLocaleTimeString() },
                  { label: 'Type', value: alert.type.replace('_', ' ').toUpperCase() },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-xs" style={{ color: '#71717a' }}>{item.label}</span>
                    <span className="text-xs font-medium" style={{ color: '#fafafa' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 shrink-0 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <motion.button 
              whileHover={{ scale: 1.01, boxShadow: `0 0 20px ${colors.glow}` }} 
              whileTap={{ scale: 0.99 }} 
              className="w-full py-2.5 rounded-xl font-medium text-sm"
              style={{ background: colors.text, color: '#fff' }}
            >
              Quarantine Entity
            </motion.button>
            <div className="grid grid-cols-2 gap-2">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="py-2 rounded-xl text-xs font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.06)' }}>
                Whitelist
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="py-2 rounded-xl text-xs font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.06)' }}>
                Investigate
              </motion.button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center pt-4 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ 
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            }}>
              <span className="text-sm font-bold" style={{ color: colors.text }}>{confidence}</span>
            </div>
            <span className="text-[9px] uppercase mt-1" style={{ color: '#52525b' }}>Risk</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="w-10 h-10 rounded-xl flex items-center justify-center mt-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#71717a' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.aside>
  );
}
