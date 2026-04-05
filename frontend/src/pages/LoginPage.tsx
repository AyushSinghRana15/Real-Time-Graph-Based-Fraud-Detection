import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function InteractiveNodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);

  const initNodes = useCallback((width: number, height: number) => {
    const NODE_COUNT = 100;
    nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', () => {
      mouseRef.current = { x: -1000, y: -1000 };
    });

    const EDGE_DIST = 160;
    const MOUSE_DIST = 250;

    const draw = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      nodesRef.current.forEach(n => {
        if (mouse.x > 0) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.05;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }
        n.vx *= 0.98;
        n.vy *= 0.98;
        n.vx += (Math.random() - 0.5) * 0.05;
        n.vy += (Math.random() - 0.5) * 0.05;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = canvas.width + 20;
        if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20) n.y = canvas.height + 20;
        if (n.y > canvas.height + 20) n.y = -20;
      });

      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodesRef.current.length; i++) {
        const a = nodesRef.current[i];
        if (mouse.x > 0) {
          const dx = mouse.x - a.x;
          const dy = mouse.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const op = (1 - dist / MOUSE_DIST) * 0.4;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(245,158,11,${op})`;
            ctx.stroke();
          }
        }
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const b = nodesRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_DIST) {
            const op = (1 - dist / EDGE_DIST) * 0.2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(244,63,94,${op})`;
            ctx.stroke();
          }
        }
      }

      nodesRef.current.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244,63,94,0.6)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 3);
        grad.addColorStop(0, 'rgba(244,63,94,0.3)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
      });

      if (mouse.x > 0) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,158,11,0.8)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
        const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 30);
        mouseGrad.addColorStop(0, 'rgba(245,158,11,0.4)');
        mouseGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGrad;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [initNodes]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
}

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => onLogin(), 1500);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#09090b' }}>
      <InteractiveNodeBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', boxShadow: '0 0 30px rgba(244,63,94,0.2)' }}>
            <span className="font-bold text-base" style={{ color: '#f43f5e', fontFamily: 'Space Grotesk, sans-serif' }}>FL</span>
          </div>
          <div>
            <span className="text-xl font-semibold" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>Forensic Lens</span>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Financial Intelligence Platform</p>
          </div>
        </motion.div>
        <motion.div className="flex items-center gap-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <span className="text-sm" style={{ color: '#71717a' }}>Systems operational</span>
        </motion.div>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full max-w-md">
          <div 
            className="relative overflow-hidden rounded-3xl p-12"
            style={{ 
              background: 'rgba(9,9,11,0.4)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(244,63,94,0.03) 0%, transparent 40%)' }} />
            
            <div className="relative">
              <div className="text-center mb-8">
                <motion.h1 className="text-2xl font-semibold mb-2" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  Welcome back
                </motion.h1>
                <motion.p className="text-sm" style={{ color: '#71717a' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  Sign in to access your command center
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full h-12 px-4 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all"
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-12 px-4 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 focus:bg-white/10 transition-all"
                  />
                </motion.div>

                <motion.div className="flex items-center justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
                  <button type="button" className="text-sm transition-colors hover:text-rose-400" style={{ color: '#f43f5e' }}>
                    Forgot password?
                  </button>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 rounded-xl font-semibold text-sm relative overflow-hidden transition-all disabled:opacity-50"
                  style={{ color: '#fff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 14px rgba(244,63,94,0.3)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      background: isLoading || !email ? 'rgba(244,63,94,0.7)' : 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)',
                    }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div 
                          className="w-5 h-5 border-2 rounded-full"
                          style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Authenticating...
                      </>
                    ) : (
                      'Sign in to Dashboard'
                    )}
                  </span>
                </motion.button>
              </form>

              <motion.div className="flex items-center gap-4 my-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
                <span className="text-xs px-2" style={{ color: '#52525b' }}>or continue with</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
              </motion.div>

              <motion.button
                className="w-full h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all relative overflow-hidden"
                style={{ 
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fafafa',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05 }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 50%)' }} />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="relative">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span className="relative">Enterprise SSO</span>
              </motion.button>
            </div>
          </div>

          <motion.p className="text-center text-xs mt-6" style={{ color: '#52525b' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            Protected by enterprise-grade security. By signing in, you agree to our Terms of Service.
          </motion.p>
        </motion.div>
      </main>

      <footer className="relative z-10 flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-xs" style={{ color: '#52525b' }}>© 2026 Forensic Lens. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <span className="text-xs cursor-pointer transition-colors" style={{ color: '#52525b' }} onMouseEnter={e => (e.currentTarget.style.color = '#71717a')} onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}>Privacy</span>
          <span className="text-xs cursor-pointer transition-colors" style={{ color: '#52525b' }} onMouseEnter={e => (e.currentTarget.style.color = '#71717a')} onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}>Terms</span>
          <span className="text-xs cursor-pointer transition-colors" style={{ color: '#52525b' }} onMouseEnter={e => (e.currentTarget.style.color = '#71717a')} onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}>Support</span>
        </div>
      </footer>
    </div>
  );
}
