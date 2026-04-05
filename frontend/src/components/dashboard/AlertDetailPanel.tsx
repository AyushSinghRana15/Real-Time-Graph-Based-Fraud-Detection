import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Bot, ChevronRight, MapPin, Clock, DollarSign, Activity } from 'lucide-react';
import type { Alert, PredictionResult } from '../../types';

interface AlertDetailPanelProps {
  alert: Alert | null;
  prediction: PredictionResult | undefined;
  isLoadingPrediction: boolean;
  onClose: () => void;
  onInvestigate: () => void;
}

const riskColors = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  low: 'text-green-400 bg-green-500/10 border-green-500/30',
};

const actionColors = {
  block: 'bg-red-500 text-white',
  review: 'bg-orange-500 text-white',
  allow: 'bg-green-500 text-white',
  monitor: 'bg-blue-500 text-white',
};

export function AlertDetailPanel({ 
  alert, 
  prediction, 
  isLoadingPrediction, 
  onClose, 
  onInvestigate 
}: AlertDetailPanelProps) {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-screen w-[420px] bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800/50 flex flex-col z-50"
        >
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-medium text-white">Alert Details</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  alert.type === 'high_risk' ? 'bg-red-500/20 text-red-400' :
                  alert.type === 'medium_risk' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {alert.type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-zinc-500">Risk: {(alert.riskScore * 100).toFixed(0)}%</span>
              </div>
              <h2 className="text-base font-semibold text-white mb-1">{alert.title}</h2>
              <p className="text-sm text-zinc-400">{alert.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Entity</span>
                </div>
                <p className="text-xs text-white font-mono">{alert.entityId}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Last Seen</span>
                </div>
                <p className="text-xs text-white">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <Activity className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Transactions</span>
                </div>
                <p className="text-xs text-white">{alert.transactionCount.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-500 mb-1">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Volume</span>
                </div>
                <p className="text-xs text-white">${alert.totalVolume.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-medium text-white">AI Verdict</h4>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{alert.aiVerdict}</p>
            </div>

            {isLoadingPrediction && (
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center gap-3"
                >
                  <motion.div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full" />
                  <span className="text-sm text-zinc-400">Running deep analysis...</span>
                </motion.div>
              </div>
            )}

            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <h4 className="text-xs font-medium text-zinc-400 mb-3">Risk Assessment</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${riskColors[prediction.riskLevel]}`}>
                      {prediction.riskLevel.toUpperCase()}
                    </span>
                    <span className="text-sm text-zinc-400">
                      Confidence: {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    {prediction.factors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                        <ChevronRight className="w-3 h-3 text-zinc-500 mt-0.5 shrink-0" />
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <h4 className="text-xs font-medium text-zinc-400 mb-3">Recommended Action</h4>
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium ${actionColors[prediction.recommendedAction]}`}>
                    {prediction.recommendedAction.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800/50">
            <button
              onClick={onInvestigate}
              disabled={isLoadingPrediction}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-zinc-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoadingPrediction ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Run AI Investigation
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
