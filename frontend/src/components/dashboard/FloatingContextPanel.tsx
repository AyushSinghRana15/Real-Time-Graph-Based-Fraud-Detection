import { motion } from 'framer-motion';
import { Shield, X, Activity } from 'lucide-react';
import type { Alert } from '../../types';

export function FloatingContextPanel({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const confidence = Math.round(alert.confidence);
  const riskLevel = alert.type === 'high_risk' ? 'critical' : alert.type === 'medium_risk' ? 'high' : alert.type === 'low_risk' ? 'medium' : 'low';

  const colors = {
    critical: { text: '#f43f5e' },
    high: { text: '#f59e0b' },
    medium: { text: '#eab308' },
    low: { text: '#10b981' },
  }[riskLevel] || { text: '#f43f5e' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-[180px] right-6 z-40 w-96 max-h-[calc(100vh-220px)] flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(12,12,15,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.04)'
      }}
    >
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors.text}15` }}>
              <Shield className="w-5 h-5" style={{ color: colors.text }} />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] leading-none mb-1" style={{ color: '#71717a' }}>Institutional Account</p>
              <h2 className="font-semibold text-sm leading-tight" style={{ color: '#fafafa' }}>{alert.entityName}</h2>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}>
            <X className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.text }}>Illicit Confidence</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold leading-none" style={{ color: colors.text, fontFamily: 'Space Grotesk, sans-serif' }}>{confidence}</span>
            <span className="text-sm font-medium leading-none" style={{ color: colors.text }}>%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div>
          <h3 className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: '#a1a1aa' }}>
            <span className="w-3 h-px" style={{ background: colors.text }} />
            Transaction Details
          </h3>
          <div className="space-y-0.5">
            {[
              { label: 'Entity ID', value: alert.entityId },
              { label: 'Time', value: new Date(alert.timestamp).toLocaleTimeString() },
              { label: 'Amount', value: `$${alert.amount.toLocaleString()}` },
              { label: 'Confidence', value: `${Math.round(alert.confidence)}%` },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-xs leading-none" style={{ color: '#71717a' }}>{item.label}</span>
                <span className="text-xs font-medium font-mono leading-none" style={{ color: '#fafafa' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium mb-3 flex items-center gap-2" style={{ color: '#a1a1aa' }}>
            <Activity className="w-3 h-3" style={{ color: '#f59e0b' }} />
            Recent Transactions
          </h3>
          <div className="space-y-0.5">
            {[
              { type: 'OUTBOUND', amount: '-$45,000.00', color: '#f43f5e' },
              { type: 'TRANSFER', amount: '-$12,400.00', color: '#f59e0b' },
              { type: 'INBOUND', amount: '+$88,200.00', color: '#10b981' },
            ].map((tx, i) => (
              <div key={i} className="flex justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-xs font-medium leading-none" style={{ color: '#71717a' }}>{tx.type}</span>
                <span className="text-xs font-medium leading-none" style={{ color: tx.color }}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full py-2.5 rounded-xl font-medium text-sm leading-none" style={{ background: '#f43f5e', color: '#fff' }}>
          Quarantine Entity
        </motion.button>
        <div className="grid grid-cols-2 gap-2">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="py-2 rounded-xl text-xs font-medium leading-none" style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.06)' }}>
            Whitelist
          </motion.button>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="py-2 rounded-xl text-xs font-medium leading-none" style={{ background: 'rgba(255,255,255,0.04)', color: '#fafafa', border: '1px solid rgba(255,255,255,0.06)' }}>
            Investigate
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
