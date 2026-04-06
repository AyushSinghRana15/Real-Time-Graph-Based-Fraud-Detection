import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const toastConfig = {
  critical: {
    icon: AlertTriangle,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  high: {
    icon: AlertCircle,
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
  },
  medium: {
    icon: AlertTriangle,
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  info: {
    icon: Info,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="pointer-events-auto"
            >
              <div
                className="relative w-80 rounded-xl overflow-hidden backdrop-blur-xl"
                style={{
                  background: config.bgColor,
                  border: `1px solid ${config.borderColor}`,
                  boxShadow: `0 0 30px ${config.color}20`,
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: config.color }}
                />
                
                <div className="p-4 pl-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${config.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: config.color }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white mb-1">
                        {toast.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {toast.message}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium uppercase"
                          style={{
                            background: `${config.color}20`,
                            color: config.color,
                          }}
                        >
                          {toast.type}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {toast.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onDismiss(toast.id)}
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
                
                <motion.div
                  className="h-1"
                  style={{ background: config.color }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 6, ease: 'linear' }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
