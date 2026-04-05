import { motion } from 'framer-motion';
import { Shield, X, Activity, AlertTriangle, GitBranch, Zap } from 'lucide-react';
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

interface PinnedContextPanelProps {
  alert: Alert | null;
  onClose: () => void;
}

export function PinnedContextPanel({ alert, onClose }: PinnedContextPanelProps) {
  if (!alert) return null;

  const confidence = Math.round(alert.confidence);
  const riskLevel = alert.type === 'high_risk' ? 'critical' : alert.type === 'medium_risk' ? 'high' : alert.type === 'low_risk' ? 'medium' : 'low';

  const colors = {
    critical: { text: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
    high: { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    medium: { text: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    low: { text: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  }[riskLevel] || { text: '#f43f5e', bg: 'rgba(244,63,94,0.1)' };

  const reasons = (alert as Alert & { reasons?: Array<{ factor: string; detail: string; weight: number }> }).reasons || [
    { factor: 'Graph Cycle', detail: 'Circular fund flow detected', weight: 30 },
    { factor: 'Amount Anomaly', detail: '$12.4M exceeds $10M threshold', weight: 40 },
    { factor: 'High Degree Node', detail: 'Degree 7 exceeds hub threshold', weight: 10 },
  ];

  const maxWeight = Math.max(...reasons.map(r => r.weight));

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 h-full flex flex-col shrink-0"
      style={{ borderLeft: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: colors.text }} />
          <h2 className="text-sm font-medium" style={{ color: '#fafafa' }}>Entity Details</h2>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="text-center mb-4">
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: colors.text }}>Illicit Confidence</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold leading-none" style={{ color: colors.text, fontFamily: 'Space Grotesk, sans-serif' }}>{confidence}</span>
              <span className="text-lg font-medium leading-none" style={{ color: colors.text }}>%</span>
            </div>
          </div>

          <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: colors.bg }}>
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
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#71717a' }}>
            <span className="w-3 h-px" style={{ background: colors.text }} />
            Risk Justification
          </h3>
          <div className="space-y-2">
            {reasons.slice(0, 3).map((reason, i) => {
              const Icon = REASON_ICONS[reason.factor] || AlertTriangle;
              const weightPct = (reason.weight / maxWeight) * 100;
              
              return (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.text}${Math.round((weightPct / 100) * 25).toString(16).padStart(2, '0')}` }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: `${colors.text}15` }}>
                      <Icon className="w-2.5 h-2.5" style={{ color: colors.text }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: '#fafafa' }}>{reason.factor}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#71717a' }}>{reason.detail}</p>
                    </div>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${weightPct}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: colors.text }}
                    />
                  </div>
                  <p className="text-[10px] mt-1 text-right" style={{ color: '#52525b' }}>{reason.weight}% weight</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#71717a' }}>
            <Activity className="w-3 h-3" />
            Transaction Details
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
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full py-2.5 rounded-xl font-medium text-sm" style={{ background: colors.text, color: '#fff' }}>
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
    </motion.aside>
  );
}
