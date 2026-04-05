import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Brain, X, Send, Loader2, Shield, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { riskColor } from '../../utils/colors';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasContext?: boolean;
}

interface PredictionResult {
  is_fraud: boolean;
  fraud_probability: number;
  confidence: number;
  risk_level: string;
  recommendation: string;
  reasons: Array<{ factor: string; detail: string; weight: number }>;
  graph_metrics: {
    degree_boost: number;
    clustering_boost: number;
    cycle_boost: number;
    total_boost: number;
    degree: number;
    clustering: number;
    cycle_detected: boolean;
    base_confidence: number;
  };
  transaction: {
    sender: string;
    receiver: string;
    amount: number;
  };
}

interface FocusSandboxProps {
  isActive: boolean;
  onClose: () => void;
  defaultAlert?: {
    entityId: string;
    entityName: string;
    amount: number;
  } | null;
}

const TRANSACTION_TYPES = ['TRANSFER', 'CASH_OUT', 'PAYMENT', 'CASH_IN', 'DEBIT'] as const;

const SUGGESTIONS = [
  { label: 'Analyze suspicious pattern', prompt: 'Analyze this transaction pattern for potential fraud indicators based on the current simulation data.' },
  { label: 'Risk assessment', prompt: 'Provide a detailed risk assessment for this transaction based on the ML results.' },
  { label: 'Graph analysis', prompt: 'Run a deep graph analysis on this transaction network and explain the cycle detection findings.' },
];

export function FocusSandbox({ isActive, onClose, defaultAlert }: FocusSandboxProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'diagnostics'>('diagnostics');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    sender_id: defaultAlert?.entityId || 'ENT-100',
    receiver_id: 'ENT-102',
    amount: defaultAlert?.amount || 50000,
    type: 'TRANSFER' as typeof TRANSACTION_TYPES[number],
    oldbalanceOrg: 100000,
    newbalanceOrig: 50000,
    oldbalanceDest: 0,
    newbalanceDest: 50000,
  });

  useEffect(() => {
    if (defaultAlert) {
      setFormData(prev => ({
        ...prev,
        sender_id: defaultAlert.entityId,
        amount: defaultAlert.amount,
      }));
    }
  }, [defaultAlert]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      // Auto-trigger LLM advice after prediction
      setActiveTab('chat');
      setIsProcessing(true);
      
      const adviceResponse = await fetch('http://localhost:3001/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: formData,
          ml_result: data,
        }),
      });
      
      const adviceData = await adviceResponse.json();
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Analyze this transaction for fraud.',
        timestamp: new Date(),
        hasContext: true,
      };
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: adviceData.advice || 'Analysis complete.',
        timestamp: new Date(),
        hasContext: true,
      };
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsAnalyzing(false);
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      hasContext: !!prediction,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:3001/api/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: formData,
          ml_result: prediction,
        }),
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.advice || 'Analysis complete. No specific fraud indicators found in the current context.',
        timestamp: new Date(),
        hasContext: !!prediction,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Advice failed:', error);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Unable to generate analysis. Please check backend connection and try again.',
        timestamp: new Date(),
        hasContext: false,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const riskColorValue = prediction ? riskColor(prediction.fraud_probability / 100) : '#8b5cf6';
  const hasPrediction = prediction !== null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col"
          style={{ background: 'rgba(9,9,11,0.97)', backdropFilter: 'blur(40px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.1) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 0 20px rgba(139,92,246,0.2)',
              }}>
                <Brain className="w-5 h-5" style={{ color: '#a855f7' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>Neural Sandbox</h1>
                <p className="text-xs" style={{ color: '#52525b' }}>Hybrid ML + LLM Intelligence</p>
              </div>
              {hasPrediction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a855f7', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a855f7' }} />
                  Context Attached
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {(['diagnostics', 'chat'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-1.5 rounded-md text-xs font-medium transition-colors"
                    style={{
                      background: activeTab === tab ? 'rgba(139,92,246,0.15)' : 'transparent',
                      color: activeTab === tab ? '#a855f7' : '#71717a',
                    }}
                  >
                    {tab === 'chat' ? 'LLM Analysis' : 'ML Diagnostics'}
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'diagnostics' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8b5cf6 0%, #a855f7 100%)' }} />
                          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#a1a1aa' }}>
                            Transaction Parameters
                          </p>
                        </div>

                        <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Sender ID</label>
                              <input
                                type="text"
                                value={formData.sender_id}
                                onChange={(e) => setFormData({ ...formData, sender_id: e.target.value })}
                                className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa' }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Receiver ID</label>
                              <input
                                type="text"
                                value={formData.receiver_id}
                                onChange={(e) => setFormData({ ...formData, receiver_id: e.target.value })}
                                className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa' }}
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
                                className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa' }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Type</label>
                              <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof TRANSACTION_TYPES[number] })}
                                className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all cursor-pointer"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa' }}
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
                                className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa' }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Receiver Balance</label>
                              <input
                                type="number"
                                value={formData.oldbalanceDest}
                                onChange={(e) => setFormData({ ...formData, oldbalanceDest: Number(e.target.value) })}
                                className="w-full h-11 px-4 rounded-lg text-sm outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa' }}
                              />
                            </div>
                          </div>
                        </div>

                        <motion.button
                          onClick={handlePredict}
                          disabled={isAnalyzing}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-50"
                          style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                            boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
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
                            className="space-y-4"
                          >
                            <div className="rounded-xl p-5" style={{
                              background: `linear-gradient(135deg, ${riskColorValue}08 0%, ${riskColorValue}05 100%)`,
                              border: `1px solid ${riskColorValue}25`
                            }}>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-4xl font-bold" style={{ color: riskColorValue, fontFamily: 'Space Grotesk, sans-serif' }}>
                                    {prediction.fraud_probability.toFixed(1)}%
                                  </span>
                                  <span className="text-sm font-medium" style={{ color: '#71717a' }}>Risk Score</span>
                                </div>
                                {prediction.is_fraud ? (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                    <AlertTriangle className="w-4 h-4" style={{ color: '#ef4444' }} />
                                    <span className="text-xs font-bold" style={{ color: '#ef4444' }}>FRAUD</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                                    <Sparkles className="w-4 h-4" style={{ color: '#22c55e' }} />
                                    <span className="text-xs font-bold" style={{ color: '#22c55e' }}>CLEAR</span>
                                  </div>
                                )}
                              </div>

                              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${prediction.fraud_probability}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ background: riskColorValue, boxShadow: `0 0 10px ${riskColorValue}` }}
                                />
                              </div>
                            </div>

                            <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>Graph Intelligence</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm" style={{ color: '#a1a1aa' }}>Base ML Confidence</span>
                                  <span className="font-mono font-semibold" style={{ color: '#fafafa' }}>
                                    {prediction.graph_metrics.base_confidence.toFixed(0)}%
                                  </span>
                                </div>
                                {prediction.graph_metrics.degree_boost > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: '#a1a1aa' }}>Degree Boost ({prediction.graph_metrics.degree} connections)</span>
                                    <span className="font-mono font-semibold" style={{ color: '#f59e0b' }}>+{prediction.graph_metrics.degree_boost}%</span>
                                  </div>
                                )}
                                {prediction.graph_metrics.cycle_detected && (
                                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: '#ef4444' }}>Cycle Ring Detected</span>
                                    <span className="font-mono font-bold" style={{ color: '#ef4444' }}>+{prediction.graph_metrics.cycle_boost}%</span>
                                  </motion.div>
                                )}
                              </div>
                            </div>

                            {prediction.reasons && prediction.reasons.length > 0 && (
                              <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>Risk Factors</p>
                                <div className="space-y-2">
                                  {prediction.reasons.map((reason, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: riskColorValue }} />
                                      <span className="text-sm" style={{ color: '#a1a1aa' }}>{reason.factor}</span>
                                      <span className="text-xs ml-auto" style={{ color: '#52525b' }}>+{reason.weight}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <div className="h-full rounded-xl flex flex-col items-center justify-center py-16" style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                            <Brain className="w-16 h-16 mb-4" style={{ color: '#27272a' }} />
                            <p className="text-base font-medium" style={{ color: '#52525b' }}>Enter transaction parameters</p>
                            <p className="text-sm mt-1" style={{ color: '#3f3f46' }}>ML results will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                      >
                        <Terminal className="w-12 h-12 mx-auto mb-4" style={{ color: '#52525b' }} />
                        <p className="text-sm mb-6" style={{ color: '#71717a' }}>
                          {hasPrediction ? 'Context attached. Ask about fraud patterns, risk assessment, or transaction analysis.' : 'Run a simulation first or ask general questions about fraud detection.'}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {SUGGESTIONS.map((s) => (
                            <button
                              key={s.label}
                              onClick={() => setInput(s.prompt)}
                              className="px-3 py-1.5 rounded-lg text-xs"
                              style={{ background: 'rgba(139,92,246,0.1)', color: '#a855f7', border: '1px solid rgba(139,92,246,0.2)' }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-2xl">
                          {msg.hasContext && msg.role === 'assistant' && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a855f7' }} />
                              <span className="text-[10px]" style={{ color: '#a855f7' }}>Based on simulation data</span>
                            </div>
                          )}
                          <div
                            className="rounded-2xl px-4 py-3"
                            style={{
                              background: msg.role === 'user' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                              border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            }}
                          >
                            <p className="text-sm whitespace-pre-wrap" style={{ color: '#e4e4e7' }}>{msg.content}</p>
                            <p className="text-[10px] mt-1" style={{ color: '#52525b' }}>
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#a855f7' }} />
                        <span className="text-xs" style={{ color: '#71717a' }}>Analyzing...</span>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-end gap-3">
                      <div className="flex-1 relative">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask about fraud patterns, risk assessment..."
                          rows={1}
                          className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#fafafa',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        className="px-5 py-3 rounded-xl flex items-center gap-2 font-medium text-sm"
                        style={{
                          background: input.trim() ? '#8b5cf6' : 'rgba(255,255,255,0.04)',
                          color: input.trim() ? '#fff' : '#52525b',
                        }}
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </motion.button>
                    </div>
                  </div>
                </div>

                <div className="w-72 p-4 shrink-0 overflow-y-auto" style={{ borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>Quick Actions</h3>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveTab('diagnostics')}
                      className="w-full text-left p-3 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4" style={{ color: '#a855f7' }} />
                        <span className="text-xs font-medium" style={{ color: '#fafafa' }}>Run ML Prediction</span>
                      </div>
                      <p className="text-[10px]" style={{ color: '#52525b' }}>Simulate fraud scoring</p>
                    </motion.button>
                    
                    {hasPrediction && (
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => setInput('Provide a detailed forensic analysis based on the current ML results.')}
                        className="w-full text-left p-3 rounded-lg"
                        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-4 h-4" style={{ color: '#a855f7' }} />
                          <span className="text-xs font-medium" style={{ color: '#fafafa' }}>Get LLM Analysis</span>
                        </div>
                        <p className="text-[10px]" style={{ color: '#a855f7' }}>{prediction.fraud_probability.toFixed(1)}% risk detected</p>
                      </motion.button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
