import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, Clock } from 'lucide-react';
import type { Alert } from '../../types';

interface AlertQueueProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  selectedAlertId: string | null;
}

const typeStyles = {
  high_risk: 'border-red-500/30 bg-red-500/5',
  medium_risk: 'border-orange-500/30 bg-orange-500/5',
  low_risk: 'border-yellow-500/30 bg-yellow-500/5',
  info: 'border-zinc-500/30 bg-zinc-500/5',
};

const typeBadge = {
  high_risk: 'bg-red-500/20 text-red-400',
  medium_risk: 'bg-orange-500/20 text-orange-400',
  low_risk: 'bg-yellow-500/20 text-yellow-400',
  info: 'bg-zinc-500/20 text-zinc-400',
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function AlertQueue({ alerts, onSelectAlert, selectedAlertId }: AlertQueueProps) {
  return (
    <div className="h-full flex flex-col bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-medium text-white">Alert Queue</h3>
        </div>
        <span className="text-xs text-zinc-500">{alerts.length} active</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence initial={false}>
          {alerts.map((alert, i) => (
            <motion.button
              key={alert.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              onClick={() => onSelectAlert(alert)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                typeStyles[alert.type]
              } ${selectedAlertId === alert.id ? 'ring-2 ring-red-500/50' : ''} hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeBadge[alert.type]}`}>
                  {alert.type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Clock className="w-3 h-3" />
                  {formatTime(alert.timestamp)}
                </span>
              </div>
              <h4 className="text-xs font-medium text-white mb-1 line-clamp-1">{alert.title}</h4>
              <p className="text-[11px] text-zinc-400 line-clamp-1">{alert.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-500">Risk: {(alert.riskScore * 100).toFixed(0)}%</span>
                <ChevronRight className="w-3 h-3 text-zinc-500" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
