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
    const ctx = canvas.getContext('2d', { alpha: false }); // alpha false for performance, will paint background manually
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
      // Paint dark background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Update positions
      nodesRef.current.forEach(n => {
        // Mouse avoidance/attraction
        if (mouse.x > 0) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            // Gentle attraction
            const force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.05;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        // Friction and velocity
        n.vx *= 0.98;
        n.vy *= 0.98;
        
        // Base drift
        n.vx += (Math.random() - 0.5) * 0.05;
        n.vy += (Math.random() - 0.5) * 0.05;

        n.x += n.vx;
        n.y += n.vy;

        // Wrap edges
        if (n.x < -20) n.x = canvas.width + 20;
        if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20) n.y = canvas.height + 20;
        if (n.y > canvas.height + 20) n.y = -20;
      });

      // Draw lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodesRef.current.length; i++) {
        const a = nodesRef.current[i];
        
        // Connect to mouse
        if (mouse.x > 0) {
          const dx = mouse.x - a.x;
          const dy = mouse.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const op = (1 - dist / MOUSE_DIST) * 0.4;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            // Draw amber/orange line to mouse
            ctx.strokeStyle = `rgba(245,158,11,${op})`;
            ctx.stroke();
          }
        }

        // Connect node to node
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
            // Draw rose lines between nodes
            ctx.strokeStyle = `rgba(244,63,94,${op})`;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodesRef.current.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244,63,94,0.6)';
        ctx.fill();
        
        // Add a soft glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 3);
        grad.addColorStop(0, 'rgba(244,63,94,0.3)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw mouse cursor glow
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => onLogin(), 1500);
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-rose-500/30">
      <InteractiveNodeBackground />

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <span className="font-bold text-rose-500" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>FL</span>
          </div>
          <div>
            <span className="text-xl font-bold text-zinc-100 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Forensic Lens</span>
          </div>
        </motion.div>
        <motion.div className="flex items-center gap-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span className="text-sm font-medium text-emerald-500 tracking-wide uppercase">Systems Operational</span>
        </motion.div>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.7, type: 'spring', damping: 25 }} 
          className="w-full max-w-md"
        >
          {/* Glassmorphic Premium Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl p-10 bg-zinc-950/40 backdrop-blur-3xl border border-white/10 ring-1 ring-white/5 box-shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)]">
            
            <div className="text-center mb-10">
              <motion.h1 className="text-3xl font-extrabold mb-3 text-zinc-100" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Command Center
              </motion.h1>
              <p className="text-sm font-medium text-zinc-400">Authenticate to access forensic analytics</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="admin@forensic.lens"
                  className="w-full h-12 bg-transparent border-0 border-b-2 text-zinc-100 text-lg placeholder:text-zinc-600 focus:outline-none focus:ring-0 transition-colors"
                  style={{ borderBottomColor: focusedInput === 'email' ? '#f43f5e' : 'rgba(255,255,255,0.1)' }}
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-zinc-400">Passcode</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="••••••••••••"
                  className="w-full h-12 bg-transparent border-0 border-b-2 text-zinc-100 text-lg placeholder:text-zinc-600 focus:outline-none focus:ring-0 transition-colors"
                  style={{ borderBottomColor: focusedInput === 'password' ? '#f43f5e' : 'rgba(255,255,255,0.1)' }}
                />
              </div>

              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-14 rounded-full font-bold text-sm tracking-wide uppercase text-white relative overflow-hidden group shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-500 transition-transform group-hover:scale-105" />
                  <span className="relative flex items-center justify-center gap-2 z-10">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Decrypting...
                      </>
                    ) : 'Initialize Session'}
                  </span>
                </motion.button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <button type="button" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors">
                Use Security Key / SSO
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 flex items-center justify-between px-8 py-6">
        <span className="text-xs font-medium text-zinc-600 uppercase tracking-widest">© 2026 Forensic Lens</span>
      </footer>
    </div>
  );
}
