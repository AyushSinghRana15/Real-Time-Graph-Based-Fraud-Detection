import { motion } from 'framer-motion';
import { LayoutDashboard, Shield, AlertTriangle, Settings, Database, Activity, Radio } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Shield, label: 'Risk Overview' },
  { icon: AlertTriangle, label: 'Alert Queue' },
  { icon: Activity, label: 'Network Monitor' },
  { icon: Database, label: 'Entity Database' },
  { icon: Radio, label: 'Live Feed' },
  { icon: Settings, label: 'Configuration' },
];

export function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-16 bottom-24 w-[200px] glass glass-border flex flex-col"
    >
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-xs font-mono transition-all duration-200 ${
              item.active
                ? 'bg-lime-500/10 text-lime-400 border border-lime-500/30 tracking-wider'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            {item.label}
          </motion.button>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-800/50">
        <div className="px-3 py-2 rounded bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-3 h-3 text-lime-400 animate-pulse" />
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Status</span>
          </div>
          <p className="text-xs font-mono text-lime-400">OPERATIONAL</p>
        </div>
      </div>
    </motion.aside>
  );
}
