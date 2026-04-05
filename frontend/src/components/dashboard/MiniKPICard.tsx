import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pathData = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-full absolute inset-0 opacity-40 mix-blend-screen pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MiniKPICard({ 
  label, value, trend, trendValue, color, sparkData, delay = 0 
}: {
  label: string; value: string; trend: 'up' | 'down' | 'neutral';
  trendValue: string; color: string; sparkData: number[]; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      className="relative px-5 py-3 rounded-2xl overflow-hidden flex-1 backdrop-blur-3xl"
      style={{
        background: 'rgba(24,24,27,0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
      <Sparkline data={sparkData} color={color} />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#a1a1aa' }}>{label}</p>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>{value}</span>
          <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" style={{ color }} />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" style={{ color }} />}
            {trend === 'neutral' && <Minus className="w-3 h-3" style={{ color: '#71717a' }} />}
            <span className="text-xs font-semibold" style={{ color }}>{trendValue}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
