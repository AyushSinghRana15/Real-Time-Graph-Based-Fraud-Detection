import { useState } from 'react';
import { motion } from 'framer-motion';

function GradientMesh() {
  const blobs = [
    { x: '10%', y: '20%', color: '#3b82f6', size: 600, duration: 20 },
    { x: '80%', y: '30%', color: '#8b5cf6', size: 500, duration: 25 },
    { x: '30%', y: '70%', color: '#ec4899', size: 550, duration: 22 },
    { x: '70%', y: '80%', color: '#f43f5e', size: 480, duration: 18 },
    { x: '50%', y: '10%', color: '#06b6d4', size: 520, duration: 24 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            marginLeft: -blob.size / 2,
            marginTop: -blob.size / 2,
            background: `radial-gradient(circle, ${blob.color}33 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 50, -30, 40, 0],
            y: [0, -40, 30, -20, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(9,9,11,0.8) 0%, rgba(9,9,11,0.4) 50%, rgba(9,9,11,0.9) 100%)' }} />
    </div>
  );
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
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#09090b' }}>
      <GradientMesh />

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', boxShadow: '0 0 30px rgba(244,63,94,0.2)' }}>
            <span className="font-bold text-base" style={{ color: '#f43f5e', fontFamily: 'Space Grotesk, sans-serif' }}>FL</span>
          </div>
          <div>
            <span className="text-xl font-semibold" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>Forensic Lens</span>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Financial Intelligence Platform</p>
          </div>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <span className="text-sm" style={{ color: '#71717a' }}>Systems operational</span>
        </motion.div>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div 
            className="relative overflow-hidden rounded-3xl"
            style={{ 
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(244,63,94,0.05) 0%, transparent 50%)' }} />
            
            <div className="relative p-10">
              <div className="text-center mb-10">
                <motion.h1 
                  className="text-3xl font-semibold mb-3"
                  style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Welcome back
                </motion.h1>
                <motion.p 
                  className="text-sm"
                  style={{ color: '#71717a' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Sign in to access your command center
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="you@company.com"
                      className="w-full h-14 px-5 rounded-xl text-sm transition-all duration-300 outline-none"
                      style={{ 
                        background: focusedInput === 'email' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${focusedInput === 'email' ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.06)'}`,
                        color: '#fafafa',
                        boxShadow: focusedInput === 'email' ? '0 0 20px rgba(244,63,94,0.15)' : 'none',
                      }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-medium mb-3" style={{ color: '#a1a1aa' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Enter your password"
                      className="w-full h-14 px-5 rounded-xl text-sm transition-all duration-300 outline-none"
                      style={{ 
                        background: focusedInput === 'password' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${focusedInput === 'password' ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.06)'}`,
                        color: '#fafafa',
                        boxShadow: focusedInput === 'password' ? '0 0 20px rgba(244,63,94,0.15)' : 'none',
                      }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85 }}
                >
                  <button type="button" className="text-sm" style={{ color: '#f43f5e' }}>
                    Forgot password?
                  </button>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-14 rounded-xl font-semibold text-sm relative overflow-hidden transition-all disabled:opacity-50"
                  style={{ color: '#fff' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      background: isLoading || !email 
                        ? 'rgba(244,63,94,0.5)' 
                        : 'linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #f43f5e 100%)',
                      backgroundSize: '200% 200%',
                      animation: 'gradient 3s ease infinite',
                    }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
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

              <motion.div 
                className="flex items-center gap-4 my-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
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

          <motion.p 
            className="text-center text-xs mt-6"
            style={{ color: '#52525b' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            Protected by enterprise-grade security. By signing in, you agree to our Terms of Service.
          </motion.p>
        </motion.div>
      </main>

      <footer className="relative z-10 flex items-center justify-between px-8 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-xs" style={{ color: '#52525b' }}>© 2026 Forensic Lens. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <span className="text-xs cursor-pointer transition-colors" style={{ color: '#52525b' }} onMouseEnter={e => (e.currentTarget.style.color = '#71717a')} onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}>Privacy</span>
          <span className="text-xs cursor-pointer transition-colors" style={{ color: '#52525b' }} onMouseEnter={e => (e.currentTarget.style.color = '#71717a')} onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}>Terms</span>
          <span className="text-xs cursor-pointer transition-colors" style={{ color: '#52525b' }} onMouseEnter={e => (e.currentTarget.style.color = '#71717a')} onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}>Support</span>
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
