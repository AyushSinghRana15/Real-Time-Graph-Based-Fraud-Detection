import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Activity, Shield, Lock, Mail } from 'lucide-react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function ParticleBackground() {
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
      radius: Math.random() * 1.5 + 0.5,
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

    const EDGE_DIST = 150;
    const MOUSE_DIST = 200;

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
            const force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.03;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }
        n.vx *= 0.99;
        n.vy *= 0.99;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = canvas.width + 20;
        if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20) n.y = canvas.height + 20;
        if (n.y > canvas.height + 20) n.y = -20;
      });

      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodesRef.current.length; i++) {
        const a = nodesRef.current[i];
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const b = nodesRef.current[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_DIST) {
            const op = (1 - dist / EDGE_DIST) * 0.15;
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
        ctx.fillStyle = 'rgba(244,63,94,0.5)';
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [initNodes]);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />;
}

interface LoginCardProps {
  onLogin: () => void;
}

function LoginCard({ onLogin }: LoginCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => onLogin(), 1200);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[420px]"
    >
      <div 
        className="relative rounded-2xl p-8 overflow-hidden"
        style={{
          background: 'rgba(12,12,15,0.6)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(244,63,94,0.15) 0%, transparent 60%)`,
          }}
        />

        <motion.div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(244,63,94,0.6), transparent)',
          }}
        />

        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-8">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(244,63,94,0.05) 100%)',
                border: '1px solid rgba(244,63,94,0.3)',
                boxShadow: '0 0 30px rgba(244,63,94,0.15)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Activity className="w-6 h-6" style={{ color: '#f43f5e' }} />
            </motion.div>
          </div>

          <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>
              Forensic Lens
            </h1>
            <p className="text-sm" style={{ color: '#71717a' }}>
              Financial Intelligence Platform
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isFocused === 'email' ? '#f43f5e' : '#52525b' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Enter your email"
                  className="w-full h-12 pr-4 rounded-xl text-sm bg-transparent border transition-all duration-300"
                  style={{
                    paddingLeft: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: isFocused === 'email' ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.06)',
                    color: '#fafafa',
                    outline: 'none',
                    boxShadow: isFocused === 'email' ? '0 0 0 3px rgba(244,63,94,0.1)' : 'none',
                  }}
                />
                <style>{`input::placeholder { color: #a1a1aa !important; opacity: 1; }`}</style>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: isFocused === 'password' ? '#f43f5e' : '#52525b' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  placeholder="Enter your password"
                  className="w-full h-12 pr-4 rounded-xl text-sm bg-transparent border transition-all duration-300"
                  style={{
                    paddingLeft: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: isFocused === 'password' ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.06)',
                    color: '#fafafa',
                    outline: 'none',
                    boxShadow: isFocused === 'password' ? '0 0 0 3px rgba(244,63,94,0.1)' : 'none',
                  }}
                />
              </div>
            </motion.div>

            <motion.div
              className="flex items-center justify-end"
              style={{ marginTop: '4px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <button type="button" className="text-sm transition-colors" style={{ color: '#f43f5e' }}>
                Forgot password?
              </button>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-12 rounded-xl font-semibold text-sm relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: isLoading || !email ? 'rgba(244,63,94,0.5)' : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                color: '#fff',
                boxShadow: isLoading || !email ? 'none' : '0 4px 20px rgba(244,63,94,0.3)',
              }}
            >
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
                  <>
                    <Shield className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </span>
            </motion.button>
          </form>

          <motion.div
            className="flex items-center justify-center gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span className="text-xs" style={{ color: '#52525b' }}>All systems operational</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#09090b' }}>
      <ParticleBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />

      <LoginCard onLogin={onLogin} />

      <motion.div
        className="absolute bottom-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs" style={{ color: '#3f3f46' }}>
          © 2026 Forensic Lens. Enterprise Fraud Detection Platform.
        </p>
      </motion.div>
    </div>
  );
}
