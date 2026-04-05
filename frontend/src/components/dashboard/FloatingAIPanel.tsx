import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Loader2, Sparkles, Play, AlertTriangle, Zap } from 'lucide-react';
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

export function FloatingAIPanel({ isSandboxMode = false }: FloatingAIPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
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
    
    try {
      const response = await fetch('http://localhost:3001/api/predict', {
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

  const riskColorValue = prediction ? riskColor(prediction.fraud_probability / 100) : '#8b5cf6';

  if (isSandboxMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[720px] z-50"
      >
        <div 
          className="rounded-2xl overflow-hidden"
          style={{ 
            background: 'rgba(9,9,11,0.95)', 
            backdropFilter: 'blur(40px)', 
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 80px -12px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.1)'
          }}
        >
          {/* Console Header */}
          <div 
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
                <Zap className="w-5 h-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#fafafa' }}>Hybrid Neural Analysis Engine</h3>
                <p className="text-xs" style={{ color: '#71717a' }}>XGBoost + Graph Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              <span className="text-xs" style={{ color: '#71717a' }}>System Active</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-5 gap-6">
              {/* Left: Input Form */}
              <div className="col-span-2 space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>
                  Transaction Parameters
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Sender ID</label>
                    <input
                      type="text"
                      value={formData.sender_id}
                      onChange={(e) => setFormData({ ...formData, sender_id: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
                      style={{ 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fafafa'
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Receiver ID</label>
                    <input
                      type="text"
                      value={formData.receiver_id}
                      onChange={(e) => setFormData({ ...formData, receiver_id: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
                      style={{ 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fafafa'
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Amount ($)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
                      style={{ 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fafafa'
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all cursor-pointer"
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide mb-1 block" style={{ color: '#71717a' }}>Sender Balance</label>
                    <input
                      type="number"
                      value={formData.oldbalanceOrg}
                      onChange={(e) => setFormData({ ...formData, oldbalanceOrg: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
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
                      className="w-full h-10 px-3 rounded-lg text-sm outline-none transition-all"
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
                  className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
                    boxShadow: '0 4px 20px rgba(139,92,246,0.4)'
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Neural Analysis...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Run Neural Analysis
                    </>
                  )}
                </motion.button>
              </div>

              {/* Divider */}
              <div className="col-span-1 flex items-center justify-center">
                <div className="w-px h-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Right: Results */}
              <div className="col-span-2 space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>
                  Analysis Results
                </p>

                {prediction ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {/* Risk Score */}
                    <div 
                      className="rounded-xl p-4"
                      style={{ 
                        background: `${riskColorValue}08`,
                        border: `1px solid ${riskColorValue}30`
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-4xl font-bold" style={{ 
                          color: riskColorValue,
                          fontFamily: 'Space Grotesk, sans-serif'
                        }}>
                          {prediction.fraud_probability.toFixed(1)}%
                        </span>
                        {prediction.is_fraud ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)' }}>
                            <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />
                            <span className="text-xs font-bold" style={{ color: '#ef4444' }}>FRAUD DETECTED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>
                            <Sparkles className="w-4 h-4" style={{ color: '#22c55e' }} />
                            <span className="text-xs font-bold" style={{ color: '#22c55e' }}>CLEAR</span>
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

                    {/* Graph Metrics */}
                    <div 
                      className="rounded-xl p-4 space-y-2"
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
                          <span style={{ color: '#a1a1aa' }}>Node Degree Boost</span>
                          <span className="font-mono" style={{ color: '#f59e0b' }}>
                            +{prediction.graph_metrics.degree_boost}% ({prediction.graph_metrics.degree} connections)
                          </span>
                        </div>
                      )}
                      
                      {prediction.graph_metrics.clustering_boost > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: '#a1a1aa' }}>Clustering Boost</span>
                          <span className="font-mono" style={{ color: '#f59e0b' }}>
                            +{prediction.graph_metrics.clustering_boost}%
                          </span>
                        </div>
                      )}
                      
                      {prediction.graph_metrics.cycle_detected && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between text-xs"
                        >
                          <span style={{ color: '#ef4444' }}>Cycle Ring Detected</span>
                          <span className="font-mono font-bold" style={{ color: '#ef4444' }}>
                            +{prediction.graph_metrics.cycle_boost}% 🔁
                          </span>
                        </motion.div>
                      )}
                      
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold" style={{ color: '#fafafa' }}>Final Risk Score</span>
                        <span className="font-mono font-bold text-lg" style={{ color: riskColorValue }}>
                          {prediction.fraud_probability.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Transaction Summary */}
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#71717a' }}>
                      <span>{formData.sender_id}</span>
                      <span>→</span>
                      <span>{formData.receiver_id}</span>
                      <span className="mx-2">•</span>
                      <span>${formData.amount.toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      <span>{formData.type}</span>
                    </div>
                  </motion.div>
                ) : (
                  <div 
                    className="h-full rounded-xl flex flex-col items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <Brain className="w-12 h-12 mb-3" style={{ color: '#27272a' }} />
                    <p className="text-sm" style={{ color: '#52525b' }}>Enter transaction parameters</p>
                    <p className="text-xs" style={{ color: '#3f3f46' }}>Results will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

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
            <p className="text-xs" style={{ color: '#71717a' }}>Hybrid Graph ML Analysis</p>
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
