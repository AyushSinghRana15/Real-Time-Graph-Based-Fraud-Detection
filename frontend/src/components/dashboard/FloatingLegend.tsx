import { motion } from 'framer-motion';

export function FloatingLegend() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-6 px-5 py-2.5 rounded-full"
      style={{ 
        background: 'rgba(12,12,15,0.8)', 
        backdropFilter: 'blur(16px)', 
        border: '1px solid rgba(255,255,255,0.04)' 
      }}
    >
      {[
        { color: '#f43f5e', label: 'Critical' },
        { color: '#f59e0b', label: 'High' },
        { color: '#eab308', label: 'Medium' },
        { color: '#10b981', label: 'Low' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
          <span className="text-xs" style={{ color: '#a1a1aa' }}>{item.label}</span>
        </div>
      ))}
    </motion.div>
  );
}
