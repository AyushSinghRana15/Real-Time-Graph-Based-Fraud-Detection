import { motion } from 'framer-motion';
import { LayoutDashboard, Shield, AlertTriangle, Settings, Database, Activity } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Shield, label: 'Risk Overview' },
  { icon: AlertTriangle, label: 'Alert Queue' },
  { icon: Activity, label: 'Network Monitor' },
  { icon: Database, label: 'Entity Database' },
  { icon: Settings, label: 'Configuration' },
];

export function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-[240px] bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col"
    >
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">FIU Dashboard</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Fraud Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              item.active
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </motion.button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-300">All Systems Operational</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
