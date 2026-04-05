import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { Alert } from '../../types';
import { riskColor } from '../../utils/colors';

function AlertCard({ alert, selected, onSelect }: { alert: Alert; selected: boolean; onSelect: () => void }) {
  const barColor = riskColor(alert.confidence / 100);
  const confidence = Math.round(alert.confidence);
  const typeLabel = alert.type === 'high_risk' ? 'Critical' : alert.type === 'medium_risk' ? 'Suspicious' : 'Flagged';

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onSelect}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left rounded-xl transition-all cursor-pointer"
      style={{
        background: selected ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${selected ? 'rgba(244,63,94,0.25)' : 'rgba(255,255,255,0.04)'}`,
        padding: '12px',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium leading-none" style={{ background: `${barColor}10`, color: barColor }}>
          {typeLabel}
        </span>
        <span className="text-[10px] leading-none shrink-0" style={{ color: '#52525b' }}>
          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <h4 className="font-medium text-xs leading-snug mb-2 line-clamp-2" style={{ color: '#fafafa' }}>{alert.entityName}</h4>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono leading-none truncate" style={{ color: '#71717a' }}>{alert.entityId.slice(0, 16)}</span>
        <span className="text-xs font-medium leading-none shrink-0" style={{ color: barColor }}>{confidence}%</span>
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
      className="fixed top-[180px] left-6 z-40 w-[320px] max-h-[calc(100vh-220px)] flex flex-col rounded-2xl overflow-hidden"
      style={{ 
        background: 'rgba(12,12,15,0.85)', 
        backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255,255,255,0.04)'
      }}
    >
      <div className="px-4 py-3 shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" style={{ color: '#f43f5e' }} />
          <h2 className="text-sm font-medium" style={{ color: '#fafafa' }}>Alert Feed</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>{alerts.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {criticalAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#f43f5e' }} />
              <span className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Critical</span>
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#f59e0b' }} />
              <span className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Suspicious</span>
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#71717a' }} />
              <span className="text-xs font-medium" style={{ color: '#a1a1aa' }}>Under Review</span>
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
