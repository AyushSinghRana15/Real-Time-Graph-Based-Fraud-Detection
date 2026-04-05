import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Shield, Bell, Database } from 'lucide-react';
import { useState } from 'react';

const SECTIONS = [
  { id: 'general', label: 'General', icon: Monitor },
  { id: 'preferences', label: 'Preferences', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm" style={{ color: '#fafafa' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
        style={{ background: enabled ? '#f43f38' : 'rgba(255,255,255,0.1)' }}
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

interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min: number;
  max: number;
  unit?: string;
}

function RangeSlider({ value, onChange, label, min, max, unit = '' }: RangeSliderProps) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ color: '#fafafa' }}>{label}</p>
        <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: '#f43f38', background: 'rgba(244,63,94,0.1)' }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(90deg, #f43f38 0%, #f43f38 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)` }}
      />
    </div>
  );
}

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsOverlay({ isOpen, onClose }: SettingsOverlayProps) {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    animations: true,
    notifications: true,
    soundEffects: false,
    nodeIntensity: 70,
    alertThreshold: 50,
    autoRefresh: true,
    refreshInterval: 30,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[680px] h-[520px] rounded-2xl overflow-hidden flex"
            style={{ background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Left Sidebar */}
            <div className="w-52 py-6 shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="px-5 mb-4">
                <h2 className="text-sm font-semibold tracking-wide" style={{ color: '#fafafa' }}>Settings</h2>
              </div>
              <nav className="space-y-1 px-3">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors"
                    style={{ 
                      background: activeSection === id ? 'rgba(244,63,94,0.1)' : 'transparent',
                      color: activeSection === id ? '#f43f5e' : '#71717a'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Content */}
            <div className="flex-1 py-8 px-10 overflow-y-auto">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-base font-semibold tracking-wide" style={{ color: '#fafafa' }}>
                  {SECTIONS.find(s => s.id === activeSection)?.label}
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeSection === 'general' && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>Interface</p>
                  <Toggle 
                    label="Enable Animations" 
                    description="Smooth transitions throughout the dashboard"
                    enabled={settings.animations} 
                    onChange={(v) => setSettings(s => ({ ...s, animations: v }))} 
                  />
                  <Toggle 
                    label="Auto-refresh Data" 
                    description="Automatically update data in real-time"
                    enabled={settings.autoRefresh} 
                    onChange={(v) => setSettings(s => ({ ...s, autoRefresh: v }))} 
                  />
                  {settings.autoRefresh && (
                    <RangeSlider 
                      label="Refresh Interval" 
                      min={10} 
                      max={120} 
                      unit="s"
                      value={settings.refreshInterval} 
                      onChange={(v) => setSettings(s => ({ ...s, refreshInterval: v }))} 
                    />
                  )}
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>Graph Visualization</p>
                  <RangeSlider 
                    label="Node Intensity" 
                    min={0} 
                    max={100} 
                    unit="%"
                    value={settings.nodeIntensity} 
                    onChange={(v) => setSettings(s => ({ ...s, nodeIntensity: v }))} 
                  />
                  <RangeSlider 
                    label="Alert Threshold" 
                    min={0} 
                    max={100} 
                    unit="%"
                    value={settings.alertThreshold} 
                    onChange={(v) => setSettings(s => ({ ...s, alertThreshold: v }))} 
                  />
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>Authentication</p>
                  <Toggle 
                    label="Two-Factor Authentication" 
                    description="Require 2FA for all admin actions"
                    enabled={true} 
                    onChange={() => {}} 
                  />
                  <Toggle 
                    label="Session Timeout" 
                    description="Auto-logout after inactivity"
                    enabled={true} 
                    onChange={() => {}} 
                  />
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>Alerts</p>
                  <Toggle 
                    label="Push Notifications" 
                    description="Browser notifications for critical alerts"
                    enabled={settings.notifications} 
                    onChange={(v) => setSettings(s => ({ ...s, notifications: v }))} 
                  />
                  <Toggle 
                    label="Sound Effects" 
                    description="Audio alerts for high-risk events"
                    enabled={settings.soundEffects} 
                    onChange={(v) => setSettings(s => ({ ...s, soundEffects: v }))} 
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
