import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Loader2, Sparkles, Play, AlertTriangle, Zap, FileText, Activity, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { riskColor } from '../../utils/colors';

interface GraphMetrics {
  degree_boost: number;
  clustering_boost: number;
  cycle_boost: number;
  total_boost: number;
  degree: number;
  clustering: number;
  cycle_detected: boolean;
  base_confidence: number;
}

interface PredictionResult {
  is_fraud: boolean;
  fraud_probability: number;
  confidence: number;
  risk_level: string;
  recommendation: string;
  graph_metrics: GraphMetrics;
  transaction: {
    sender: string;
    receiver: string;
    amount: number;
  };
}

const TRANSACTION_TYPES = ['TRANSFER', 'CASH_OUT', 'PAYMENT', 'CASH_IN', 'DEBIT'] as const;

interface FloatingAIPanelProps {
  isSandboxMode?: boolean;
}

type TabType = 'ml' | 'advice';

export function FloatingAIPanel({ isSandboxMode = false }: FloatingAIPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('ml');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    sender_id: 'ENT-100',
    receiver_id: 'ENT-102',
    amount: 50000,
    type: 'TRANSFER',
    oldbalanceOrg: 100000,
    newbalanceOrig: 50000,
    oldbalanceDest: 0,
    newbalanceDest: 50000,
  });

  const handlePredict = async () => {
    setIsAnalyzing(true);
    setPrediction(null);
    setAdvice(null);
    setActiveTab('ml');
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setPrediction(data);
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetAdvice = async () => {
    if (!prediction) return;
    
    setIsLoadingAdvice(true);
    try {
      const response = await fetch('/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: formData,
          ml_result: prediction,
        }),
      });
      const data = await response.json();
      setAdvice(data.advice);
    } catch (error) {
      console.error('Advice failed:', error);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const riskColorValue = prediction ? riskColor(prediction.fraud_probability / 100) : '#8b5cf6';
  const hasPrediction = prediction !== null;

  if (isSandboxMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[1000px] z-50"
      >
        <div 
          className="rounded-2xl overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, rgba(15,15,20,0.98) 0%, rgba(9,9,11,0.99) 100%)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(139,92,246,0.2)',
            boxShadow: '0 0 80px rgba(139,92,246,0.08), 0 25px 100px -12px rgba(0,0,0,0.7)'
          }}
        >
          {/* Console Header */}
          <div 
            className="px-8 py-5 flex items-center justify-between"
            style={{ 
              borderBottom: '1px solid rgba(139,92,246,0.15)',
              background: 'linear-gradient(90deg, rgba(139,92,246,0.05) 0%, transparent 100%)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.2) 100%)', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}>
                <Zap className="w-6 h-6" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight" style={{ color: '#fafafa' }}>Neural Analysis Console</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  <p className="text-xs" style={{ color: '#71717a' }}>Hybrid ML + LLM Intelligence</p>
                </div>
              </div>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => setActiveTab('ml')}
                className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                style={{
                  background: activeTab === 'ml' ? 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent',
                  color: activeTab === 'ml' ? '#e9d5ff' : '#71717a',
                  boxShadow: activeTab === 'ml' ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <Activity className="w-4 h-4" />
                ML Diagnostics
              </button>
              <button
                onClick={() => {
                  setActiveTab('advice');
                  if (hasPrediction && !advice) handleGetAdvice();
                }}
                disabled={!hasPrediction}
                className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-40"
                style={{
                  background: activeTab === 'advice' ? 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.2) 100%)' : 'transparent',
                  color: activeTab === 'advice' ? '#e9d5ff' : '#71717a',
                  boxShadow: activeTab === 'advice' ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <Shield className="w-4 h-4" />
                LLM Advice
              </button>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'ml' ? (
                <motion.div
                  key="ml-tab"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left: Input Form */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8b5cf6 0%, #a855f7 100%)' }} />
                        <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#a1a1aa' }}>
                          Transaction Parameters
                        </p>
                      </div>
                      
                      <div 
                        className="rounded-xl p-6 space-y-5"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Sender ID</label>
                            <input
                              type="text"
                              value={formData.sender_id}
                              onChange={(e) => setFormData({ ...formData, sender_id: e.target.value })}
                              className="w-full h-12 px-4 rounded-lg text-sm outline-none transition-all"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#fafafa'
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Receiver ID</label>
                            <input
                              type="text"
                              value={formData.receiver_id}
                              onChange={(e) => setFormData({ ...formData, receiver_id: e.target.value })}
                              className="w-full h-12 px-4 rounded-lg text-sm outline-none transition-all"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#fafafa'
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Amount ($)</label>
                            <input
                              type="number"
                              value={formData.amount}
                              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                              className="w-full h-12 px-4 rounded-lg text-sm outline-none transition-all"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#fafafa'
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Type</label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                              className="w-full h-12 px-4 rounded-lg text-sm outline-none transition-all cursor-pointer"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#fafafa'
                              }}
                            >
                              {TRANSACTION_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Sender Balance</label>
                            <input
                              type="number"
                              value={formData.oldbalanceOrg}
                              onChange={(e) => setFormData({ ...formData, oldbalanceOrg: Number(e.target.value) })}
                              className="w-full h-12 px-4 rounded-lg text-sm outline-none transition-all"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#fafafa'
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Receiver Balance</label>
                            <input
                              type="number"
                              value={formData.oldbalanceDest}
                              onChange={(e) => setFormData({ ...formData, oldbalanceDest: Number(e.target.value) })}
                              className="w-full h-12 px-4 rounded-lg text-sm outline-none transition-all"
                              style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#fafafa'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <motion.button
                        onClick={handlePredict}
                        disabled={isAnalyzing}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full h-14 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                          boxShadow: '0 4px 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Neural Analysis...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-5 h-5" />
                            Run Neural Analysis
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Right: Results */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8b5cf6 0%, #a855f7 100%)' }} />
                        <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#a1a1aa' }}>
                          Analysis Results
                        </p>
                      </div>

                      {prediction ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-5"
                        >
                          {/* Risk Score Card */}
                          <div 
                            className="rounded-xl p-6"
                            style={{ 
                              background: `linear-gradient(135deg, ${riskColorValue}08 0%, ${riskColorValue}05 100%)`,
                              border: `1px solid ${riskColorValue}25`
                            }}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="text-5xl font-bold" style={{ 
                                  color: riskColorValue,
                                  fontFamily: 'Space Grotesk, sans-serif'
                                }}>
                                  {prediction.fraud_probability.toFixed(1)}%
                                </span>
                                <span className="text-sm font-medium" style={{ color: '#71717a' }}>Risk Score</span>
                              </div>
                              {prediction.is_fraud ? (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                  <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                                  <span className="text-sm font-bold" style={{ color: '#ef4444' }}>FRAUD</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                                  <Sparkles className="w-5 h-5" style={{ color: '#22c55e' }} />
                                  <span className="text-sm font-bold" style={{ color: '#22c55e' }}>CLEAR</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${prediction.fraud_probability}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${riskColorValue} 0%, ${riskColorValue}aa 100%)`, boxShadow: `0 0 10px ${riskColorValue}` }}
                              />
                            </div>
                          </div>

                          {/* Graph Metrics Card */}
                          <div 
                            className="rounded-xl p-5"
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#71717a' }}>Graph Intelligence</p>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#a1a1aa' }}>Base ML Confidence</span>
                                <span className="font-mono font-semibold" style={{ color: '#fafafa' }}>
                                  {prediction.graph_metrics.base_confidence.toFixed(0)}%
                                </span>
                              </div>
                              
                              {prediction.graph_metrics.degree_boost > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm" style={{ color: '#a1a1aa' }}>Degree Boost ({prediction.graph_metrics.degree} connections)</span>
                                  <span className="font-mono font-semibold" style={{ color: '#f59e0b' }}>
                                    +{prediction.graph_metrics.degree_boost}%
                                  </span>
                                </div>
                              )}
                              
                              {prediction.graph_metrics.clustering_boost > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm" style={{ color: '#a1a1aa' }}>Clustering Boost</span>
                                  <span className="font-mono font-semibold" style={{ color: '#f59e0b' }}>
                                    +{prediction.graph_metrics.clustering_boost}%
                                  </span>
                                </div>
                              )}
                              
                              {prediction.graph_metrics.cycle_detected && (
                                <motion.div 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-sm font-medium" style={{ color: '#ef4444' }}>🔁 Cycle Ring Detected</span>
                                  <span className="font-mono font-bold" style={{ color: '#ef4444' }}>
                                    +{prediction.graph_metrics.cycle_boost}%
                                  </span>
                                </motion.div>
                              )}
                              
                              <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold" style={{ color: '#fafafa' }}>Final Score</span>
                                  <span className="font-mono font-bold text-lg" style={{ color: riskColorValue }}>
                                    {prediction.fraud_probability.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Transaction Summary */}
                          <div className="flex items-center gap-3 text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="font-mono" style={{ color: '#8b5cf6' }}>{formData.sender_id}</span>
                            <span style={{ color: '#52525b' }}>→</span>
                            <span className="font-mono" style={{ color: '#8b5cf6' }}>{formData.receiver_id}</span>
                            <span style={{ color: '#3f3f46' }}>|</span>
                            <span className="font-mono" style={{ color: '#fafafa' }}>${formData.amount.toLocaleString()}</span>
                            <span style={{ color: '#3f3f46' }}>|</span>
                            <span style={{ color: '#71717a' }}>{formData.type}</span>
                          </div>
                        </motion.div>
                      ) : (
                        <div 
                          className="h-full rounded-xl flex flex-col items-center justify-center py-16"
                          style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.08)' }}
                        >
                          <Brain className="w-16 h-16 mb-4" style={{ color: '#27272a' }} />
                          <p className="text-base font-medium" style={{ color: '#52525b' }}>Enter transaction parameters</p>
                          <p className="text-sm mt-1" style={{ color: '#3f3f46' }}>ML results will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="advice-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[350px]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8b5cf6 0%, #a855f7 100%)' }} />
                      <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#a1a1aa' }}>
                        Forensic Analysis Report
                      </p>
                    </div>
                    <button
                      onClick={handleGetAdvice}
                      disabled={isLoadingAdvice || !hasPrediction}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-40"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#a855f7', border: '1px solid rgba(139,92,246,0.2)' }}
                    >
                      {isLoadingAdvice ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Regenerate
                        </>
                      )}
                    </button>
                  </div>

                  {isLoadingAdvice ? (
                    <div className="space-y-4 p-6 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="h-6 w-48 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                      <div className="h-4 w-full rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                      <div className="h-4 w-4/5 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                      <div className="h-6 w-32 rounded animate-pulse mt-6" style={{ background: 'rgba(255,255,255,0.04)' }} />
                      <div className="h-4 w-full rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                      <div className="h-4 w-3/5 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                    </div>
                  ) : advice ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl p-6"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(139,92,246,0.15)' }}
                    >
                      <div className="space-y-4">
                        {advice.split('\n').map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <h4 key={i} className="text-base font-bold mt-6 mb-2 flex items-center gap-2" style={{ color: '#fafafa' }}>
                                <span className="w-1 h-4 rounded-full" style={{ background: '#8b5cf6' }} />
                                {line.replace(/\*\*/g, '')}
                              </h4>
                            );
                          }
                          if (line.startsWith('•')) {
                            return (
                              <div key={i} className="flex items-start gap-3 ml-3">
                                <span style={{ color: '#8b5cf6' }}>▸</span>
                                <span className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{line.replace('• ', '')}</span>
                              </div>
                            );
                          }
                          if (line.match(/^\d+\./)) {
                            return (
                              <div key={i} className="flex items-start gap-3">
                                <span className="font-bold min-w-[20px]" style={{ color: '#8b5cf6' }}>{line.match(/^\d+/)?.[0]}.</span>
                                <span className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{line.replace(/^\d+\.\s*/, '')}</span>
                              </div>
                            );
                          }
                          if (line.trim()) {
                            return <p key={i} className="text-sm leading-relaxed" style={{ color: '#a1a1aa' }}>{line}</p>;
                          }
                          return null;
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <div 
                      className="h-full rounded-xl flex flex-col items-center justify-center py-16"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.08)' }}
                    >
                      <Shield className="w-16 h-16 mb-4" style={{ color: '#27272a' }} />
                      <p className="text-base font-medium" style={{ color: '#52525b' }}>Run ML analysis first</p>
                      <p className="text-sm mt-1" style={{ color: '#3f3f46' }}>LLM advice will appear here</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact mode (not sandbox)
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-6 right-6 w-[420px] rounded-2xl overflow-hidden z-50"
      style={{ 
        background: 'rgba(9,9,11,0.92)', 
        backdropFilter: 'blur(40px)', 
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}
    >
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
            <p className="text-sm font-semibold" style={{ color: '#fafafa' }}>Neural Sandbox</p>
            <p className="text-xs" style={{ color: '#71717a' }}>ML + LLM Analysis</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" style={{ color: '#71717a' }} />
        ) : (
          <ChevronUp className="w-4 h-4" style={{ color: '#71717a' }} />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-5 space-y-5">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>
                  Transaction Parameters
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Sender</label>
                    <input
                      type="text"
                      value={formData.sender_id}
                      onChange={(e) => setFormData({ ...formData, sender_id: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg text-sm outline-none transition-all"
                      style={{ 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fafafa'
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Receiver</label>
                    <input
                      type="text"
                      value={formData.receiver_id}
                      onChange={(e) => setFormData({ ...formData, receiver_id: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg text-sm outline-none transition-all"
                      style={{ 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fafafa'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Amount ($)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg text-sm outline-none transition-all"
                    style={{ 
                      background: 'rgba(255,255,255,0.04)', 
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fafafa'
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Transaction Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg text-sm outline-none transition-all cursor-pointer"
                    style={{ 
                      background: 'rgba(255,255,255,0.04)', 
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fafafa'
                    }}
                  >
                    {TRANSACTION_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Sender Balance</label>
                    <input
                      type="number"
                      value={formData.oldbalanceOrg}
                      onChange={(e) => setFormData({ ...formData, oldbalanceOrg: Number(e.target.value) })}
                      className="w-full h-9 px-3 rounded-lg text-sm outline-none transition-all"
                      style={{ 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fafafa'
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Receiver Balance</label>
                    <input
                      type="number"
                      value={formData.oldbalanceDest}
                      onChange={(e) => setFormData({ ...formData, oldbalanceDest: Number(e.target.value) })}
                      className="w-full h-9 px-3 rounded-lg text-sm outline-none transition-all"
                      style={{ 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fafafa'
                      }}
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handlePredict}
                  disabled={isAnalyzing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
                    boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Neural Analysis
                    </>
                  )}
                </motion.button>
              </div>

              {prediction && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>
                      Risk Assessment
                    </p>
                    <div 
                      className="rounded-xl p-4"
                      style={{ 
                        background: `${riskColorValue}10`,
                        border: `1px solid ${riskColorValue}30`
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl font-bold" style={{ 
                          color: riskColorValue,
                          fontFamily: 'Space Grotesk, sans-serif'
                        }}>
                          {prediction.fraud_probability.toFixed(1)}%
                        </span>
                        {prediction.is_fraud ? (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.15)' }}>
                            <AlertTriangle className="w-3 h-3" style={{ color: '#ef4444' }} />
                            <span className="text-[10px] font-bold" style={{ color: '#ef4444' }}>FRAUD</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>
                            <Sparkles className="w-3 h-3" style={{ color: '#22c55e' }} />
                            <span className="text-[10px] font-bold" style={{ color: '#22c55e' }}>CLEAR</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.fraud_probability}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: riskColorValue }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>
                      Graph Intelligence
                    </p>
                    <div 
                      className="rounded-xl p-3 space-y-2"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: '#a1a1aa' }}>Base ML Confidence</span>
                        <span className="font-mono" style={{ color: '#fafafa' }}>
                          {prediction.graph_metrics.base_confidence.toFixed(0)}%
                        </span>
                      </div>
                      
                      {prediction.graph_metrics.degree_boost > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: '#a1a1aa' }}>Degree Boost</span>
                          <span className="font-mono" style={{ color: '#f59e0b' }}>
                            +{prediction.graph_metrics.degree_boost}%
                          </span>
                        </div>
                      )}
                      
                      {prediction.graph_metrics.cycle_detected && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-between text-xs"
                        >
                          <span style={{ color: '#ef4444' }}>Cycle Ring Detected</span>
                          <span className="font-mono font-bold" style={{ color: '#ef4444' }}>
                            +{prediction.graph_metrics.cycle_boost}% 🔁
                          </span>
                        </motion.div>
                      )}
                      
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold" style={{ color: '#fafafa' }}>Final Risk Score</span>
                        <span className="font-mono font-bold" style={{ color: riskColorValue }}>
                          {prediction.fraud_probability.toFixed(1)}%
                        </span>
                      </div>
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
