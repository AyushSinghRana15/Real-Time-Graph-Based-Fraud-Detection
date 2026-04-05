import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Alert } from '../../types';

interface FloatingAIPanelProps {
  alert: Alert | null;
}

const ANALYSIS_TEMPLATE = [
  "Initiating deep neural network analysis...",
  "Scanning transaction graph topology...",
  "Cross-referencing known fraud patterns...",
  "Evaluating temporal anomaly score...",
  "Computing behavioral deviation index...",
  "Synthesizing risk correlation matrix...",
  "Finalizing threat assessment...",
];

export function FloatingAIPanel({ alert }: FloatingAIPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLines, setAnalysisLines] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  useEffect(() => {
    if (alert) {
      setIsAnalyzing(true);
      setAnalysisLines([]);
      setRiskScore(null);

      let lineIndex = 0;
      const interval = setInterval(() => {
        if (lineIndex < ANALYSIS_TEMPLATE.length) {
          setAnalysisLines(prev => [...prev, ANALYSIS_TEMPLATE[lineIndex]]);
          lineIndex++;
        } else {
          clearInterval(interval);
          setIsAnalyzing(false);
          setRiskScore(alert.type === 'high_risk' ? 94 : alert.type === 'medium_risk' ? 67 : alert.type === 'low_risk' ? 32 : 15);
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [alert]);

  if (!alert) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-6 right-6 w-96 rounded-2xl overflow-hidden z-50"
      style={{ 
        background: 'rgba(9,9,11,0.92)', 
        backdropFilter: 'blur(40px)', 
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <Brain className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: '#fafafa' }}>AI Risk Analysis</p>
            <p className="text-xs" style={{ color: '#71717a' }}>Real-time fraud detection</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" style={{ color: '#71717a' }} />
        ) : (
          <ChevronUp className="w-4 h-4" style={{ color: '#71717a' }} />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-5 space-y-4">
              {/* Analysis Feed */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>
                  Analysis Feed
                </p>
                <div 
                  className="rounded-xl p-4 space-y-2 min-h-[120px]"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {analysisLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      {isAnalyzing && i === analysisLines.length - 1 ? (
                        <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#8b5cf6' }} />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                      )}
                      <p className="text-xs" style={{ color: '#a1a1aa' }}>{line}</p>
                    </motion.div>
                  ))}
                  {analysisLines.length === 0 && (
                    <p className="text-xs" style={{ color: '#52525b' }}>Awaiting analysis...</p>
                  )}
                </div>
              </div>

              {/* Risk Score */}
              {riskScore !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="space-y-3"
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>
                    Threat Assessment
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-2xl font-bold" style={{ 
                          color: riskScore >= 70 ? '#ef4444' : riskScore >= 40 ? '#f59e0b' : '#22c55e',
                          fontFamily: 'Space Grotesk, sans-serif'
                        }}>
                          {riskScore}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${riskScore}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ 
                            background: riskScore >= 70 ? '#ef4444' : riskScore >= 40 ? '#f59e0b' : '#22c55e'
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                      background: riskScore >= 70 ? 'rgba(239,68,68,0.15)' : riskScore >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)'
                    }}>
                      <Sparkles className="w-5 h-5" style={{ 
                        color: riskScore >= 70 ? '#ef4444' : riskScore >= 40 ? '#f59e0b' : '#22c55e'
                      }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
