import { motion } from 'framer-motion';
import { Search, Bell, Settings, User } from 'lucide-react';

export const NAV_ITEMS = ['Dashboard', 'Network', 'Registry', 'Archived'] as const;
export type NavItem = typeof NAV_ITEMS[number];

export function TopNavBar({ activeNav, onNavChange }: { activeNav: NavItem; onNavChange: (n: NavItem) => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{
        background: 'rgba(9,9,11,0.5)',
        backdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <span className="font-bold text-sm text-rose-500" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>FL</span>
          </div>
          <span className="text-lg font-semibold text-zinc-100" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Forensic Lens</span>
        </div>

        {/* Center: Navigation Pills */}
        <nav className="hidden md:flex items-center p-1 rounded-full bg-white/5 border border-white/5">
          {NAV_ITEMS.map((item) => (
            <motion.button
              key={item}
              onClick={() => onNavChange(item)}
              className="px-4 py-1.5 text-sm font-medium rounded-full relative transition-colors"
              style={{ color: activeNav === item ? '#fafafa' : '#a1a1aa' }}
              whileTap={{ scale: 0.96 }}
            >
              {activeNav === item && (
                <motion.div 
                  layoutId="nav-pill-bg" 
                  className="absolute inset-0 rounded-full bg-white/10" 
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} 
                />
              )}
              <span className="relative z-10">{item}</span>
            </motion.button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-rose-500 transition-colors" />
            <input
              className="w-56 h-9 pl-9 pr-4 rounded-full text-sm bg-white/5 border border-white/5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all"
              placeholder="Search..."
            />
          </div>
          
          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all">
              <Settings className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-full flex items-center justify-center text-rose-400 hover:bg-white/5 transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} className="w-9 h-9 ml-1 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center group pointer-events-auto">
              <User className="w-4 h-4 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
            </motion.button>
          </div>
        </div>

      </div>
    </motion.header>
  );
}
