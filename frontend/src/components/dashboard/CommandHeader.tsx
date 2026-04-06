import { motion } from 'framer-motion';
import { Bell, Settings, User, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ArrowUpRight, Minus } from 'lucide-react';

export const NAV_ITEMS = ['Dashboard', 'Network', 'Sandbox', 'Archived'] as const;
export type NavItem = typeof NAV_ITEMS[number];

function LiveIndicator() {
  const { isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('/health');
      if (!res.ok) throw new Error('API error');
      return res.json();
    },
    refetchInterval: 10000,
    retry: 1,
  });

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-2 h-2 rounded-full"
          style={{ background: isError ? '#ef4444' : '#22c55e' }}
        />
        {!isLoading && !isError && (
          <div 
            className="absolute inset-0 w-2 h-2 rounded-full"
            style={{ background: '#22c55e', filter: 'blur(4px)' }}
          />
        )}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: isError ? '#ef4444' : '#22c55e' }}>
        {isLoading ? 'Connecting' : isError ? 'Offline' : 'Live'}
      </span>
    </div>
  );
}

function MiniMetric({ label, value, trend, color }: { label: string; value: string; trend: 'up' | 'down' | 'neutral'; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wider leading-none mb-0.5" style={{ color: '#52525b' }}>{label}</span>
        <span className="text-sm font-bold leading-none" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>{value}</span>
      </div>
      {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" style={{ color }} />}
      {trend === 'neutral' && <Minus className="w-3.5 h-3.5" style={{ color: '#52525b' }} />}
    </div>
  );
}

interface CommandHeaderProps {
  activeNav: NavItem;
  onNavChange: (n: NavItem) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  highRiskCount: number;
  totalAlerts?: number;
}

export function CommandHeader({ activeNav, onNavChange, onOpenSettings, onOpenProfile, highRiskCount, totalAlerts: _totalAlerts }: CommandHeaderProps) {
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const t = setInterval(() => setLatency(p => Math.max(1, p + (Math.random() - 0.5) * 6 | 0)), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 flex items-center justify-between px-6 shrink-0"
      style={{
        background: 'rgba(9,9,11,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" style={{ color: '#f43f5e' }} />
            <span className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: '#fafafa' }}>Forensic Lens</span>
          </div>
          <div className="h-5 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <LiveIndicator />
        </div>

        <nav className="flex items-center gap-6 ml-4">
          {NAV_ITEMS.map((item) => (
            <motion.button
              key={item}
              onClick={() => onNavChange(item)}
              className="relative py-1 group"
              whileTap={{ scale: 0.98 }}
            >
              <span 
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: activeNav === item ? '#fafafa' : '#52525b' }}
              >
                {item}
              </span>
              {activeNav === item && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-0.5 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, #f43f5e, transparent)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MiniMetric label="Volume" value="8.47M" trend="up" color="#10b981" />
          <MiniMetric label="High Risk" value={String(highRiskCount)} trend="up" color="#f43f5e" />
          <MiniMetric label="Latency" value={`${latency}ms`} trend="neutral" color="#f59e0b" />
        </div>

        <div className="h-6 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="flex items-center gap-1">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onOpenSettings} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: '#71717a' }}>
            <Settings className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-lg flex items-center justify-center relative" style={{ color: '#71717a' }}>
            <Bell className="w-4 h-4" />
            {highRiskCount > 0 && (
              <motion.span 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 right-2 w-2 h-2 rounded-full" 
                style={{ background: '#f43f5e' }} 
              />
            )}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={onOpenProfile} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <User className="w-4 h-4" style={{ color: '#a1a1aa' }} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
