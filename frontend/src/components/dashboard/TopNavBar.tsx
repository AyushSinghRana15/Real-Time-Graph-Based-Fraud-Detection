import { motion } from 'framer-motion';
import { Bell, Settings, User } from 'lucide-react';

export const NAV_ITEMS = ['Dashboard', 'Network', 'Sandbox', 'Archived'] as const;
export type NavItem = typeof NAV_ITEMS[number];

export function TopNavBar({ activeNav, onNavChange, onOpenSettings, onOpenProfile }: { activeNav: NavItem; onNavChange: (n: NavItem) => void; onOpenSettings: () => void; onOpenProfile: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-6 right-6 z-50 h-14 rounded-full"
      style={{
        background: 'rgba(12,12,15,0.7)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="h-full px-5 flex items-center justify-between">
        
        {/* Left: Minimalist Branding */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: '#f43f5e', boxShadow: '0 0 8px #f43f5e' }} />
          <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#fafafa' }}>Forensic Lens</span>
        </div>

        {/* Center: Breathable Navigation */}
        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <motion.button
              key={item}
              onClick={() => onNavChange(item)}
              className="relative py-1"
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

        {/* Right: Unified Actions */}
        <div className="flex items-center gap-1">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onOpenSettings} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ color: '#a1a1aa' }}>
            <Settings className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ color: '#a1a1aa' }}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#f43f5e' }} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={onOpenProfile} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <User className="w-5 h-5" style={{ color: '#a1a1aa' }} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
