import { motion } from 'framer-motion';
import { X, User, Shield, Monitor, LogOut, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm" style={{ color: '#fafafa' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-11 h-6 rounded-full transition-colors duration-200"
        style={{ background: enabled ? '#f43f5e' : 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
          animate={{ left: enabled ? 22 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

interface UserProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function UserProfileOverlay({ isOpen, onClose, onLogout }: UserProfileOverlayProps) {
  const [profile, setProfile] = useState({
    name: 'Admin Officer',
    email: 'admin@forensic.lens',
    role: 'System Administrator',
  });
  const [settings, setSettings] = useState({
    ssoEnforcement: true,
    twoFactorAuth: true,
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[650px] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Header */}
        <div className="px-8 py-6 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <span className="text-2xl font-bold" style={{ color: '#f43f5e', fontFamily: 'Space Grotesk, sans-serif' }}>FL</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: '#fafafa' }}>{profile.name}</h2>
                <p className="text-sm" style={{ color: '#71717a' }}>{profile.email}</p>
                <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>{profile.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10">
          {/* Personal Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4" style={{ color: '#52525b' }} />
              <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>Personal Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#71717a' }}>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#71717a' }}>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#fafafa' }}
                />
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          {/* Security Protocols */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4" style={{ color: '#52525b' }} />
              <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>Security Protocols</h3>
            </div>
            <div className="rounded-xl p-4 space-y-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Toggle 
                label="Enterprise SSO Enforcement" 
                description="Require SSO for all authentication attempts"
                enabled={settings.ssoEnforcement} 
                onChange={(v) => setSettings(s => ({ ...s, ssoEnforcement: v }))} 
              />
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
              <Toggle 
                label="Two-Factor Authentication" 
                description="Add an extra layer of security to your account"
                enabled={settings.twoFactorAuth} 
                onChange={(v) => setSettings(s => ({ ...s, twoFactorAuth: v }))} 
              />
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          {/* Active Sessions */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Monitor className="w-4 h-4" style={{ color: '#52525b' }} />
              <h3 className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#52525b' }}>Active Sessions</h3>
            </div>
            <div className="rounded-xl p-4 space-y-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <Smartphone className="w-4 h-4" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#fafafa' }}>MacOS Safari</p>
                    <p className="text-xs" style={{ color: '#71717a' }}>Current session</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Active</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Monitor className="w-4 h-4" style={{ color: '#71717a' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#fafafa' }}>Windows Chrome</p>
                    <p className="text-xs" style={{ color: '#71717a' }}>Last active 2 hours ago</p>
                  </div>
                </div>
                <button className="text-xs px-2 py-1 rounded" style={{ color: '#71717a', background: 'rgba(255,255,255,0.05)' }}>
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: '#f43f5e', background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)' }}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-black transition-colors"
            style={{ background: '#fafafa' }}
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
