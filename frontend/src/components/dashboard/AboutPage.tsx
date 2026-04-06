import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { X, Cpu, Network, Brain, Database, Shield, GitBranch, Layers, Activity, Zap } from 'lucide-react';

interface AboutPageProps {
  isActive: boolean;
  onClose: () => void;
}

const techStack = [
  { name: 'React + Vite', desc: 'Frontend Framework', color: '#61dafb' },
  { name: 'FastAPI', desc: 'Backend API', color: '#009688' },
  { name: 'XGBoost', desc: 'ML Classification', color: '#ea580c' },
  { name: 'NetworkX', desc: 'Graph Analysis', color: '#4f46e5' },
  { name: 'Three.js', desc: '3D Visualization', color: '#6366f1' },
  { name: 'SQLite', desc: 'Persistent Storage', color: '#4479a1' },
];

const teamMembers = [
  { name: 'Ayush Singh Rana', role: 'Lead Developer', handle: '@AyushSinghRana15', color: '#818cf8' },
  { name: 'Aditya Singh', role: 'Contributor', handle: '@adityasingh', color: '#22c55e' },
  { name: 'Bipin Kumar', role: 'Contributor', handle: '@bipinkumar', color: '#f59e0b' },
  { name: 'Ashutosh Kumar', role: 'Contributor', handle: '@ashutoshkumar', color: '#ec4899' },
];

const fraudPatterns = [
  { name: 'Cycle Ring', desc: 'Circular fund flow between nodes', color: '#ef4444', icon: '🔄' },
  { name: 'Hub Pattern', desc: 'Single node connects to many', color: '#f97316', icon: '🕸️' },
  { name: 'Chain/Mule', desc: 'Long path of intermediaries', color: '#eab308', icon: '⛓️' },
];

function MiniGraph({ pattern }: { pattern: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let angle = 0;
    
    const draw = () => {
      ctx.clearRect(0, 0, 200, 200);
      const cx = 100, cy = 100;
      
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1;
      
      if (pattern === 'cycle') {
        const nodes = 6;
        const radius = 50;
        const positions: [number, number][] = [];
        
        for (let i = 0; i < nodes; i++) {
          const a = angle + (i * 2 * Math.PI) / nodes;
          positions.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
        }
        
        ctx.beginPath();
        for (let i = 0; i < nodes; i++) {
          ctx.moveTo(positions[i][0], positions[i][1]);
          ctx.lineTo(positions[(i + 1) % nodes][0], positions[(i + 1) % nodes][1]);
        }
        ctx.stroke();
        
        positions.forEach(([x, y], i) => {
          ctx.beginPath();
          ctx.arc(x, y, i % 2 === 0 ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        });
      } else if (pattern === 'hub') {
        const spokes = 8;
        const radius = 55;
        const hubX = cx, hubY = cy;
        
        ctx.beginPath();
        for (let i = 0; i < spokes; i++) {
          const a = angle + (i * 2 * Math.PI) / spokes;
          const x = cx + Math.cos(a) * radius;
          const y = cy + Math.sin(a) * radius;
          ctx.moveTo(hubX, hubY);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(hubX, hubY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        
        for (let i = 0; i < spokes; i++) {
          const a = angle + (i * 2 * Math.PI) / spokes;
          const x = cx + Math.cos(a) * radius;
          const y = cy + Math.sin(a) * radius;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#f97316aa';
          ctx.fill();
        }
      } else if (pattern === 'chain') {
        const nodes = 7;
        const spacing = 25;
        const startX = cx - (spacing * (nodes - 1)) / 2;
        
        const positions: [number, number][] = [];
        for (let i = 0; i < nodes; i++) {
          const y = cy + Math.sin(angle + i * 0.3) * 10;
          positions.push([startX + i * spacing, y]);
        }
        
        ctx.beginPath();
        for (let i = 0; i < nodes - 1; i++) {
          ctx.moveTo(positions[i][0], positions[i][1]);
          ctx.lineTo(positions[i + 1][0], positions[i + 1][1]);
        }
        ctx.stroke();
        
        positions.forEach(([x, y], i) => {
          ctx.beginPath();
          ctx.arc(x, y, i === 0 || i === nodes - 1 ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = '#eab308';
          ctx.fill();
        });
      }
      
      angle += 0.02;
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    return () => cancelAnimationFrame(animationId);
  }, [pattern]);
  
  return <canvas ref={canvasRef} width={200} height={200} className="w-32 h-32" />;
}

export function AboutPage({ isActive, onClose }: AboutPageProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  
  const [systemHealth, setSystemHealth] = useState({
    db_nodes: 0,
    db_transactions: 0,
    ml_model: false,
    avg_risk: 0,
  });
  const [activePattern, setActivePattern] = useState('cycle');
  
  useEffect(() => {
    if (!isActive) return;
    const fetchHealth = async () => {
      try {
        const res = await fetch('/health');
        const data = await res.json();
        setSystemHealth({
          db_nodes: data.graph_nodes || 0,
          db_transactions: data.graph_edges || 0,
          ml_model: data.ml_model_available || false,
          avg_risk: 0,
        });
      } catch {
        // Backend not reachable
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, [isActive]);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
    mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
  };
  
  if (!isActive) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] overflow-hidden cursor-pointer"
        style={{ background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(40px)' }}
        onClick={onClose}
        onMouseMove={handleMouseMove}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
        >
          <div className="w-full max-w-6xl mx-auto p-8 space-y-8 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.h1 
                className="text-5xl font-bold mb-3"
                style={{ 
                  background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Forensic Lens
              </motion.h1>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Financial fraud detection through coordinated transaction networks
              </p>
            </motion.div>
            
            <div className="grid grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="col-span-2 rounded-2xl p-6 space-y-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-zinc-200">The Core AI</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <Network className="w-6 h-6 text-indigo-400 mb-2" />
                    <h3 className="text-sm font-medium text-zinc-200">PageRank</h3>
                    <p className="text-xs text-zinc-500 mt-1">Identifies central fraud nodes</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(168,85,247,0.1)' }}>
                    <GitBranch className="w-6 h-6 text-purple-400 mb-2" />
                    <h3 className="text-sm font-medium text-zinc-200">Cycle Detection</h3>
                    <p className="text-xs text-zinc-500 mt-1">Finds circular fund flows</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(249,115,22,0.1)' }}>
                    <Cpu className="w-6 h-6 text-orange-400 mb-2" />
                    <h3 className="text-sm font-medium text-zinc-200">XGBoost</h3>
                    <p className="text-xs text-zinc-500 mt-1">ML transaction classification</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">Fraud Pattern Detection</h3>
                  <div className="flex gap-4">
                    {fraudPatterns.map((p) => (
                      <button
                        key={p.name}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setActivePattern(p.name.toLowerCase().split(' ')[0]); 
                        }}
                        className="flex-1 p-3 rounded-xl text-left transition-all"
                        style={{
                          background: activePattern === p.name.toLowerCase().split(' ')[0] 
                            ? `${p.color}20` 
                            : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${activePattern === p.name.toLowerCase().split(' ')[0] ? p.color : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{p.icon}</span>
                          <span className="text-sm font-medium" style={{ color: p.color }}>{p.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center mt-3">
                    <MiniGraph pattern={activePattern} />
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-6 space-y-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-zinc-200">System Health</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs text-zinc-400">DB Nodes</span>
                    </div>
                    <span className="text-sm font-mono text-zinc-200">{systemHealth.db_nodes}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs text-zinc-400">Transactions</span>
                    </div>
                    <span className="text-sm font-mono text-zinc-200">{systemHealth.db_transactions}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-zinc-500" />
                      <span className="text-xs text-zinc-400">ML Model</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: systemHealth.ml_model ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                      color: systemHealth.ml_model ? '#22c55e' : '#ef4444',
                    }}>
                      {systemHealth.ml_model ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="col-span-2 rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-zinc-200">Tech Stack</h2>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {techStack.map((tech, i) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="p-3 rounded-xl text-center"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mx-auto mb-2"
                        style={{ background: tech.color, boxShadow: `0 0 8px ${tech.color}` }}
                      />
                      <p className="text-xs font-medium text-zinc-300">{tech.name}</p>
                      <p className="text-[10px] text-zinc-600">{tech.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-zinc-200">Contributors</h2>
                </div>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}80 100%)`,
                          boxShadow: `0 0 12px ${member.color}40`,
                        }}
                      >
                        {member.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{member.name}</p>
                        <p className="text-xs text-zinc-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
