import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Activity, ChevronRight } from 'lucide-react';
import { usePrediction } from '../../hooks/useFraudDetection';
import type { Alert, PredictionResult } from '../../types';

export function FloatingContextPanel({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const prediction = usePrediction(alert.entityId);
  useEffect(() => { prediction.mutate(); }, [alert.entityId]);
  
  const pred = prediction.data as PredictionResult | undefined;
  const confidence = pred ? Math.round(pred.confidence * 100) : Math.round(alert.riskScore * 100);
  const riskLevel = pred?.riskLevel || (alert.riskScore >= 0.85 ? 'critical' : alert.riskScore >= 0.6 ? 'high' : alert.riskScore >= 0.3 ? 'medium' : 'low');

  const colors = {
    critical: { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', text: '#f43f5e', shadow: 'rgba(244,63,94,0.2)' },
    high: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', shadow: 'rgba(245,158,11,0.2)' },
    medium: { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', text: '#eab308', shadow: 'rgba(234,179,8,0.2)' },
    low: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10b981', shadow: 'rgba(16,185,129,0.2)' },
  }[riskLevel] || { bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', text: '#f43f5e', shadow: 'rgba(244,63,94,0.2)' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-28 right-6 z-40 w-[400px] max-h-[calc(100vh-140px)] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
      style={{ 
        background: 'rgba(24,24,27,0.75)', 
        backdropFilter: 'blur(40px)', 
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)'
      }}
    >
      <div className="px-6 py-5 relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${colors.text}, transparent)` }} />
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden" 
              style={{ background: colors.bg, border: `1px solid ${colors.border}`, boxShadow: `0 0 20px ${colors.shadow}` }}
            >
              <div className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(circle at center, ${colors.text}, transparent)` }} />
              <Shield className="w-6 h-6 relative z-10" style={{ color: colors.text }} />
            </motion.div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: '#a1a1aa' }}>Institutional Account</p>
              <h2 className="font-bold text-lg" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>{alert.entityId}</h2>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 bg-white/5 border border-white/10 transition-colors">
            <X className="w-4 h-4" />
          </motion.button>
        </div>
        
        <motion.div className="mt-5 p-5 rounded-2xl text-center relative overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${colors.border}` }}>
          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(45deg, transparent, ${colors.bg}, transparent)` }} />
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: colors.text }}>Illicit Confidence</p>
          <div className="flex items-baseline justify-center gap-1">
            <p className="text-4xl font-extrabold" style={{ color: colors.text, fontFamily: 'Space Grotesk, sans-serif' }}>{confidence}</p>
            <span className="text-xl font-bold" style={{ color: colors.text }}>%</span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#fafafa' }}>
            <ChevronRight className="w-4 h-4 text-rose-500" />
            Transaction Details
          </h3>
          <div className="space-y-2">
            {[
              { label: 'IP Address', value: '192.168.10.4 (VPN)' },
              { label: 'Device ID', value: 'AX-990-PRO-MAX' },
              { label: 'Time', value: new Date(alert.timestamp).toLocaleTimeString() },
              { label: 'Transactions', value: alert.transactionCount.toLocaleString() },
              { label: 'Volume', value: `$${alert.totalVolume.toLocaleString()}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-xs font-semibold" style={{ color: '#a1a1aa' }}>{item.label}</span>
                <span className="text-xs font-bold font-mono" style={{ color: '#fafafa' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
           <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#fafafa' }}>
            <Activity className="w-4 h-4 text-amber-500" />
            Recent Behavior
          </h3>
          <div className="space-y-2.5">
            {[
              { type: 'OUTBOUND', amount: '-$45,000.00', color: '#f43f5e' },
              { type: 'TRANSFER', amount: '-$12,400.00', color: '#f59e0b' },
              { type: 'INBOUND', amount: '+$88,200.00', color: '#10b981' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-xs font-bold tracking-wide" style={{ color: '#a1a1aa' }}>{tx.type}</span>
                <span className="text-xs font-bold font-mono" style={{ color: tx.color }}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3 bg-black/40 border-t border-white/10 backdrop-blur-md">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase text-white shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 transition-transform group-hover:scale-105" />
          <span className="relative z-10">Quarantine Entity</span>
        </motion.button>
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.98 }} className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 bg-white/5 border border-white/10">
            Whitelist
          </motion.button>
          <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.98 }} className="py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 bg-white/5 border border-white/10">
            Investigate
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
