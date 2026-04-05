import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAlerts } from '../hooks/useFraudDetection';
import type { Alert, TransactionNode } from '../types';
import { TopNavBar, NAV_ITEMS } from '../components/dashboard/TopNavBar';
import { KPIDock } from '../components/dashboard/KPIDock';
import { GraphCanvas } from '../components/dashboard/GraphCanvas';
import { FloatingAlertSidebar } from '../components/dashboard/FloatingAlertSidebar';
import { FloatingContextPanel } from '../components/dashboard/FloatingContextPanel';
import { FloatingLegend } from '../components/dashboard/FloatingLegend';
import { FloatingAIPanel } from '../components/dashboard/FloatingAIPanel';
import { SettingsOverlay } from '../components/dashboard/SettingsOverlay';
import { UserProfileOverlay } from '../components/dashboard/UserProfileOverlay';

type NavItem = typeof NAV_ITEMS[number];

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const { data: alerts = [] } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeNav, setActiveNav] = useState<NavItem>('Dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isSandboxMode = activeNav === 'Sandbox';

  const handleNodeClick = useCallback((node: TransactionNode) => {
    const a = alerts.find(al => al.entityId === node.id);
    if (a) setSelectedAlert(a);
  }, [alerts]);

  useEffect(() => {
    if (alerts.length > 0 && !selectedAlert && !isSandboxMode) {
      const high = alerts.find(a => a.type === 'high_risk');
      if (high) setSelectedAlert(high);
    }
  }, [alerts, selectedAlert, isSandboxMode]);

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: '#09090b' }}>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <GraphCanvas entityId={selectedAlert?.entityId ?? null} onNodeClick={handleNodeClick} />
      </div>

      <TopNavBar 
        activeNav={activeNav} 
        onNavChange={setActiveNav} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <AnimatePresence mode="wait">
        {isSandboxMode ? (
          <motion.div
            key="sandbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#fafafa', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Neural Sandbox
                </h1>
                <p className="text-sm" style={{ color: '#71717a' }}>
                  Simulate transactions and analyze fraud patterns in real-time
                </p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <>
            <KPIDock />
            <FloatingAlertSidebar alerts={alerts} selectedId={selectedAlert?.id ?? null} onSelect={setSelectedAlert} />
            <FloatingLegend />
          </>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedAlert && !isSandboxMode && (
          <FloatingContextPanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        )}
      </AnimatePresence>

      <FloatingAIPanel isSandboxMode={isSandboxMode} />

      <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <UserProfileOverlay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={onLogout} />
    </div>
  );
}
