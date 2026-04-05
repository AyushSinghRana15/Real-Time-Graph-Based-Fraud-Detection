import { useRef } from 'react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts';
import type { VelocityPoint } from '../../types';

interface TemporalVelocityProps {
  data: VelocityPoint[];
  isLoading: boolean;
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
}

export function TemporalVelocity({ data, isLoading }: TemporalVelocityProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (isLoading || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs text-zinc-500"
        >
          Initializing stream...
        </motion.div>
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    time: formatTime(d.timestamp),
  }));

  const latest = chartData[chartData.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">Temporal Velocity</h3>
          <p className="text-[10px] text-zinc-500">Real-time transaction stream (60s window)</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-zinc-500">TPS:</span>
            <motion.span 
              key={latest?.transactionsPerSecond}
              initial={{ scale: 1.2, color: '#ef4444' }}
              animate={{ scale: 1, color: '#fff' }}
              className="ml-1 font-medium text-white"
            >
              {latest?.transactionsPerSecond.toFixed(1)}
            </motion.span>
          </div>
          <div>
            <span className="text-zinc-500">Flagged:</span>
            <span className="ml-1 font-medium text-orange-400">{latest?.flaggedPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="h-[calc(100%-60px)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="flaggedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 9, fill: '#71717a' }} 
              axisLine={false} 
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 9, fill: '#71717a' }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#18181b', 
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#fff'
              }}
              labelStyle={{ color: '#71717a' }}
            />
            <Area
              type="monotone"
              dataKey="transactionsPerSecond"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#tpsGradient)"
              animationDuration={300}
            />
            <Area
              type="monotone"
              dataKey="flaggedPercentage"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#flaggedGradient)"
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
