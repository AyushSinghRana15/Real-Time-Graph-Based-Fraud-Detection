import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { Alert } from '../../types';
import { riskColor } from '../../utils/colors';

function AlertCard({ alert, selected, onSelect }: { alert: Alert; selected: boolean; onSelect: () => void }) {
  const barColor = riskColor(alert.riskScore);
  const confidence = Math.round(alert.riskScore * 100);
  const typeLabel = alert.type === 'high_risk' ? 'Critical' : alert.type === 'medium_risk' ? 'Suspicious' : 'Flagged';

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onSelect}
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.06)' }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-xl p-3 transition-all cursor-pointer relative overflow-hidden group"
      style={{
        background: selected ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      {selected && <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent" />}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase" style={{ background: `${barColor}15`, color: barColor }}>
            {typeLabel}
          </span>
          <span className="text-[10px] font-medium" style={{ color: '#71717a' }}>
            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <h4 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: '#f4f4f5' }}>{alert.title}</h4>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: '#a1a1aa' }}>{alert.entityId.slice(0, 12)}...</span>
          <span className="text-xs font-bold" style={{ color: barColor }}>{confidence}%</span>
        </div>
      </div>
    </motion.button>
  );
}

export function FloatingAlertSidebar({ alerts, selectedId, onSelect }: { alerts: Alert[]; selectedId: string | null; onSelect: (a: Alert) => void }) {
  const criticalAlerts = alerts.filter(a => a.type === 'high_risk');
  const suspiciousAlerts = alerts.filter(a => a.type === 'medium_risk');
  const otherAlerts = alerts.filter(a => a.type === 'low_risk' || a.type === 'info');

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-28 left-6 z-40 w-[340px] max-h-[calc(100vh-140px)] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
      style={{ 
        background: 'rgba(24,24,27,0.6)', 
        backdropFilter: 'blur(30px)', 
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)'
      }}
    >
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-semibold text-zinc-100 tracking-wide uppercase">Alert Feed</h2>
        </div>
        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{alerts.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {criticalAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Critical Threats</span>
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
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Suspicious</span>
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
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Review Required</span>
            </div>
            <div className="space-y-2">
              {otherAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} selected={selectedId === alert.id} onSelect={() => onSelect(alert)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
