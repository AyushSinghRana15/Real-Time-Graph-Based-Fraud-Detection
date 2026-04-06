import { motion } from 'framer-motion';
import { Bell, Settings, User, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export const NAV_ITEMS = [
  { id: 'Dashboard', label: 'DASHBOARD' },
  { id: 'Network', label: 'NETWORK' },
  { id: 'Sandbox', label: 'SANDBOX' },
  { id: 'About', label: 'ABOUT' },
] as const;
export type NavItem = typeof NAV_ITEMS[number]['id'];

interface HUDHeaderProps {
  activeNav: NavItem;
  onNavChange: (n: NavItem) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  highRiskCount: number;
}

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
    <motion.div 
      className="flex items-center gap-1.5"
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: isError ? '#ef4444' : '#22c55e', boxShadow: isError ? '0 0 8px #ef4444' : '0 0 8px #22c55e' }}
      />
      <span className="text-[9px] font-medium uppercase tracking-[0.15em]" style={{ color: isError ? '#ef4444' : '#22c55e' }}>
        {isLoading ? '...' : isError ? 'OFF' : 'LIVE'}
      </span>
    </motion.div>
  );
}

function BrandIsland() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="px-4 py-2.5 rounded-2xl"
      style={{
        background: 'rgba(12,12,15,0.75)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(244,63,94,0.05) 100%)',
          border: '1px solid rgba(244,63,94,0.3)',
          boxShadow: '0 0 16px rgba(244,63,94,0.15)',
        }}>
          <Activity className="w-4 h-4" style={{ color: '#f43f5e' }} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-[0.15em]" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>FORENSIC LENS</span>
          <LiveIndicator />
        </div>
      </div>
    </motion.div>
  );
}

function NavIsland({ activeNav, onNavChange }: { activeNav: NavItem; onNavChange: (n: NavItem) => void }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 25 }}
      className="relative px-6 py-3.5 rounded-3xl"
      style={{
        background: 'rgba(20,20,25,0.4)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-2 relative">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="relative py-2 px-5 z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ color: isActive ? '#fafafa' : '#71717a' }}
            >
              <span 
                className="text-base font-bold tracking-[0.2em] uppercase whitespace-nowrap"
                style={{ fontFamily: 'monospace' }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
        
        <motion.div
          layoutId="nav-pill"
          className="absolute h-[80%] my-auto inset-y-0 rounded-xl px-5"
          style={{
            background: 'linear-gradient(135deg, rgba(244,63,94,0.35) 0%, rgba(244,63,94,0.15) 100%)',
            border: '1px solid rgba(244,63,94,0.5)',
            boxShadow: '0 0 30px rgba(244,63,94,0.3), inset 0 0 15px rgba(244,63,94,0.15)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </div>
    </motion.nav>
  );
}

function TelemetryIsland({ highRiskCount, latency, onOpenSettings, onOpenProfile }: { highRiskCount: number; latency: number; onOpenSettings: () => void; onOpenProfile: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
      className="flex items-center gap-3"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(12,12,15,0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: '#52525b' }}>Vol</span>
          <span className="text-sm font-bold font-mono" style={{ color: '#fafafa' }}>8.47M</span>
          <span className="text-[9px]" style={{ color: '#10b981' }}>↑</span>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(12,12,15,0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: '#52525b' }}>Risk</span>
          <span className="text-sm font-bold font-mono" style={{ color: '#f43f5e' }}>{highRiskCount}</span>
          {highRiskCount > 0 && (
            <motion.span 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }}
            />
          )}
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(12,12,15,0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider" style={{ color: '#52525b' }}>Lat</span>
          <span className="text-sm font-bold font-mono" style={{ color: '#f59e0b' }}>{latency}ms</span>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-1 px-2 py-2 rounded-xl"
        style={{
          background: 'rgba(12,12,15,0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <motion.button whileHover={{ color: '#a1a1aa' }} whileTap={{ scale: 0.95 }} onClick={onOpenSettings} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: '#71717a' }}>
          <Settings className="w-4 h-4" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-8 h-8 rounded-lg flex items-center justify-center relative" style={{ color: '#71717a' }}>
          <Bell className="w-4 h-4" />
          {highRiskCount > 0 && (
            <motion.span 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" 
              style={{ background: '#f43f5e', boxShadow: '0 0 6px #f43f5e' }} 
            />
          )}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onOpenProfile} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <User className="w-4 h-4" style={{ color: '#a1a1aa' }} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function HUDHeader({ activeNav, onNavChange, onOpenSettings, onOpenProfile, highRiskCount }: HUDHeaderProps) {
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const t = setInterval(() => setLatency(p => Math.max(1, p + (Math.random() - 0.5) * 6 | 0)), 2000);
    return () => clearInterval(t);
  }, []);

  const showTelemetry = activeNav === 'Dashboard';

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
      <BrandIsland />
      <NavIsland activeNav={activeNav} onNavChange={onNavChange} />
      {showTelemetry && <TelemetryIsland highRiskCount={highRiskCount} latency={latency} onOpenSettings={onOpenSettings} onOpenProfile={onOpenProfile} />}
      {!showTelemetry && <div className="w-[200px]" />}
    </div>
  );
}
