import { motion } from 'framer-motion';
import { Bell, Settings, User, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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

export function TopNavBar({ activeNav, onNavChange, onOpenSettings, onOpenProfile }: { activeNav: NavItem; onNavChange: (n: NavItem) => void; onOpenSettings: () => void; onOpenProfile: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-6 right-6 z-50 h-14 rounded-full"
      style={{
        background: 'rgba(12,12,15,0.8)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* Left: Branding + Live Status */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: '#f43f5e' }} />
            <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: '#fafafa' }}>Forensic Lens</span>
          </div>
          <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <LiveIndicator />
        </div>

        {/* Center: Navigation */}
        <nav className="flex items-center gap-8">
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
              {activeNav !== item && (
                <span 
                  className="absolute -bottom-0.5 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onOpenSettings} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ color: '#71717a' }}>
            <Settings className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ color: '#71717a' }}>
            <Bell className="w-5 h-5" />
            <motion.span 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" 
              style={{ background: '#f43f5e' }} 
            />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={onOpenProfile} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <User className="w-5 h-5" style={{ color: '#a1a1aa' }} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
