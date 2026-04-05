import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MetricData } from '../../types';

interface MetricCardsProps {
  metrics: MetricData[];
  isLoading: boolean;
}

export function MetricCards({ metrics, isLoading }: MetricCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
        >
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{metric.label}</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold text-white tabular-nums">
              {typeof metric.value === 'number' && metric.value > 1000
                ? metric.value.toLocaleString()
                : metric.value}
            </span>
            <div className={`flex items-center gap-1 text-xs ${
              metric.trend === 'up' && metric.change > 0 ? 'text-red-400' :
              metric.trend === 'up' && metric.change < 0 ? 'text-green-400' :
              metric.trend === 'down' && metric.change < 0 ? 'text-red-400' :
              metric.trend === 'down' && metric.change > 0 ? 'text-green-400' :
              'text-zinc-400'
            }`}>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : metric.trend === 'down' ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {Math.abs(metric.change).toFixed(1)}%
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
