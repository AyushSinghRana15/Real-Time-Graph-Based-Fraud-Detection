import { motion } from 'framer-motion';

export function FloatingLegend() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-8 px-8 py-4 rounded-full shadow-2xl"
      style={{ 
        background: 'rgba(24,24,27,0.6)', 
        backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255,255,255,0.08)' 
      }}
    >
      {[
        { color: '#f43f5e', label: 'Critical' },
        { color: '#f59e0b', label: 'High' },
        { color: '#eab308', label: 'Medium' },
        { color: '#10b981', label: 'Low' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}80` }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a1a1aa' }}>{item.label}</span>
        </div>
      ))}
    </motion.div>
  );
}
