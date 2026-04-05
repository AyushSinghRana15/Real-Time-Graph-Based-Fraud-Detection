import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Alert } from '../../types';
import { riskColor } from '../../utils/colors';

function AlertCard({ alert, selected, onSelect }: { alert: Alert; selected: boolean; onSelect: () => void }) {
  const barColor = riskColor(alert.confidence / 100);
  const confidence = Math.round(alert.confidence);
  const typeLabel = alert.type === 'high_risk' ? 'Critical' : alert.type === 'medium_risk' ? 'Suspicious' : 'Flagged';

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.04)' }}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left rounded-lg px-3 py-2.5 transition-all cursor-pointer"
      style={{
        background: selected ? 'rgba(244,63,94,0.08)' : 'transparent',
        borderLeft: `2px solid ${selected ? barColor : 'transparent'}`,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: barColor }} />
          <span className="text-[10px] font-medium" style={{ color: '#71717a' }}>{typeLabel}</span>
        </div>
        <span className="text-[10px] leading-none shrink-0" style={{ color: '#52525b' }}>
          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <h4 className="font-medium text-xs leading-snug mb-1 line-clamp-1" style={{ color: selected ? '#fafafa' : '#a1a1aa' }}>{alert.entityName}</h4>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono leading-none truncate" style={{ color: '#52525b' }}>{alert.entityId.slice(0, 14)}</span>
        <span className="text-xs font-medium leading-none shrink-0" style={{ color: barColor }}>{confidence}%</span>
      </div>
    </motion.button>
  );
}

interface CollapsibleAlertSidebarProps {
  alerts: Alert[];
  selectedId: string | null;
  onSelect: (a: Alert) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function CollapsibleAlertSidebar({ alerts, selectedId, onSelect, isCollapsed, onToggle }: CollapsibleAlertSidebarProps) {
  const criticalAlerts = alerts.filter(a => a.type === 'high_risk');
  const suspiciousAlerts = alerts.filter(a => a.type === 'medium_risk');
  const otherAlerts = alerts.filter(a => a.type === 'low_risk' || a.type === 'info');

  return (
    <AnimatePresence mode="wait">
      {!isCollapsed ? (
        <motion.aside
          key="sidebar-expanded"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 280 }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full flex flex-col overflow-hidden"
          style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="px-4 py-3 shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#f43f5e' }} />
              <h2 className="text-sm font-medium" style={{ color: '#fafafa' }}>Alert Feed</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>{alerts.length}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {criticalAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#f43f5e' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#f43f5e' }}>Critical ({criticalAlerts.length})</span>
                </div>
                <div className="space-y-0.5">
                  {criticalAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} selected={selectedId === alert.id} onSelect={() => onSelect(alert)} />
                  ))}
                </div>
              </div>
            )}
            {suspiciousAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#f59e0b' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>Suspicious ({suspiciousAlerts.length})</span>
                </div>
                <div className="space-y-0.5">
                  {suspiciousAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} selected={selectedId === alert.id} onSelect={() => onSelect(alert)} />
                  ))}
                </div>
              </div>
            )}
            {otherAlerts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#71717a' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#71717a' }}>Review ({otherAlerts.length})</span>
                </div>
                <div className="space-y-0.5">
                  {otherAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} selected={selectedId === alert.id} onSelect={() => onSelect(alert)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      ) : (
        <motion.div
          key="sidebar-collapsed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full flex flex-col items-center pt-4"
          style={{ width: 48 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#f43f5e' }} />
            <span className="text-[10px] font-medium" style={{ color: '#71717a' }}>{criticalAlerts.length}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
