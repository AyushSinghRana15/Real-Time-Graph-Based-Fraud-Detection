import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

function InteractiveNodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);

  const initNodes = useCallback((width: number, height: number) => {
    const NODE_COUNT = 80;
    nodesRef.current = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1.5 + Math.random() * 2,
      pulsePhase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

    const EDGE_DIST = 150;
    const MOUSE_DIST = 200;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodesRef.current.forEach(n => {
        const dx = mouseRef.current.x - n.x;
        const dy = mouseRef.current.y - n.y;
        const mouseDist = Math.sqrt(dx * dx + dy * dy);

        if (mouseDist < MOUSE_DIST) {
          const force = (MOUSE_DIST - mouseDist) / MOUSE_DIST * 0.02;
          n.vx -= (dx / mouseDist) * force;
          n.vy -= (dy / mouseDist) * force;
        }

        n.vx *= 0.99;
        n.vy *= 0.99;
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < -20) n.x = canvas.width + 20;
        if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20) n.y = canvas.height + 20;
        if (n.y > canvas.height + 20) n.y = -20;

        n.pulsePhase += 0.02;
      });

      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const a = nodesRef.current[i];
          const b = nodesRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < EDGE_DIST) {
            const opacity = (1 - dist / EDGE_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(244,63,94,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      if (mouseRef.current.x > 0) {
        nodesRef.current.forEach(n => {
          const dx = mouseRef.current.x - n.x;
          const dy = mouseRef.current.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_DIST) {
            const opacity = (1 - dist / MOUSE_DIST) * 0.3;
            ctx.beginPath();
            ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
            ctx.lineTo(n.x, n.y);
            ctx.strokeStyle = `rgba(245,158,11,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      }

      nodesRef.current.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(n.pulsePhase);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,63,94,${0.4 + pulse * 0.3})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(244,63,94,0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (mouseRef.current.x > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 4 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,158,11,0.6)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(245,158,11,0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', boxShadow: '0 0 30px rgba(244,63,94,0.2)' }}>
            <span className="font-bold text-base" style={{ color: '#f43f5e', fontFamily: 'Space Grotesk, sans-serif' }}>FL</span>
          </div>
          <div>
            <span className="text-xl font-semibold" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>Forensic Lens</span>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Financial Intelligence Platform</p>
          </div>
        </motion.div>
        <motion.div className="flex items-center gap-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <span className="text-sm" style={{ color: '#71717a' }}>Systems operational</span>
        </motion.div>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="w-full max-w-md">
          <div 
            className="relative overflow-hidden rounded-3xl"
            style={{ 
              background: 'rgba(9,9,11,0.4)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(244,63,94,0.03) 0%, transparent 40%)' }} />
            
            <div className="relative p-10">
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
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="you@company.com"
                      className="w-full h-12 px-0 py-3 rounded-none text-sm bg-transparent outline-none transition-all duration-300"
                      style={{ 
                        borderBottom: `1px solid ${focusedInput === 'email' ? '#f43f5e' : 'rgba(255,255,255,0.1)'}`,
                        color: '#fafafa',
                        boxShadow: focusedInput === 'email' ? '0 4px 12px -2px rgba(244,63,94,0.2)' : 'none',
                      }}
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Enter your password"
                      className="w-full h-12 px-0 py-3 rounded-none text-sm bg-transparent outline-none transition-all duration-300"
                      style={{ 
                        borderBottom: `1px solid ${focusedInput === 'password' ? '#f43f5e' : 'rgba(255,255,255,0.1)'}`,
                        color: '#fafafa',
                        boxShadow: focusedInput === 'password' ? '0 4px 12px -2px rgba(244,63,94,0.2)' : 'none',
                      }}
                    />
                  </div>
                </motion.div>

                <motion.div className="flex items-center justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
                  <button type="button" className="text-sm transition-colors hover:text-rose-400" style={{ color: '#f43f5e' }}>
                    Forgot password?
                  </button>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-14 rounded-xl font-semibold text-sm relative overflow-hidden transition-all disabled:opacity-50"
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
                className="w-full h-14 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all relative overflow-hidden"
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
