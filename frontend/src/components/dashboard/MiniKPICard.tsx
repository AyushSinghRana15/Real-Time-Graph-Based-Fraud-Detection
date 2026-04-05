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
    <svg className="w-full h-full absolute inset-0 opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ maskImage: 'linear-gradient(to bottom, white 0%, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, white 0%, transparent 80%)' }}>
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
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, delay }}
      className="relative px-4 py-3 rounded-xl overflow-hidden flex-1"
      style={{
        background: 'rgba(12,12,15,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.04)',
        minWidth: '130px',
      }}
    >
      <Sparkline data={sparkData} color={color} />
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#71717a' }}>{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold leading-none" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>{value}</span>
          <div className="flex items-center gap-0.5">
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 leading-none" style={{ color }} />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 leading-none" style={{ color }} />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 leading-none" style={{ color: '#71717a' }} />}
            <span className="text-xs font-medium leading-none" style={{ color }}>{trendValue}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
