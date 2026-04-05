import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAlerts } from '../hooks/useFraudDetection';
import type { Alert, TransactionNode } from '../types';
import { TopNavBar } from '../components/dashboard/TopNavBar';
import { KPIDock } from '../components/dashboard/KPIDock';
import { GraphCanvas } from '../components/dashboard/GraphCanvas';
import { FloatingAlertSidebar } from '../components/dashboard/FloatingAlertSidebar';
import { FloatingContextPanel } from '../components/dashboard/FloatingContextPanel';
import { FloatingLegend } from '../components/dashboard/FloatingLegend';
import { FloatingAIPanel } from '../components/dashboard/FloatingAIPanel';
import { SettingsOverlay } from '../components/dashboard/SettingsOverlay';
import { UserProfileOverlay } from '../components/dashboard/UserProfileOverlay';

const NAV_ITEMS = ['Dashboard', 'Network', 'Registry', 'Archived'] as const;
type NavItem = typeof NAV_ITEMS[number];

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const { data: alerts = [] } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeNav, setActiveNav] = useState<NavItem>('Dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleNodeClick = useCallback((node: TransactionNode) => {
    const a = alerts.find(al => al.entityId === node.id);
    if (a) setSelectedAlert(a);
  }, [alerts]);

  useEffect(() => {
    if (alerts.length > 0 && !selectedAlert) {
      const high = alerts.find(a => a.type === 'high_risk');
      if (high) setSelectedAlert(high);
    }
  }, [alerts]);

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
      <KPIDock />
      <FloatingAlertSidebar alerts={alerts} selectedId={selectedAlert?.id ?? null} onSelect={setSelectedAlert} />
      
      <AnimatePresence>
        {selectedAlert && (
          <FloatingContextPanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        )}
      </AnimatePresence>
      
      <FloatingLegend />

      <AnimatePresence>
        <FloatingAIPanel alert={selectedAlert} />
      </AnimatePresence>

      <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <UserProfileOverlay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={onLogout} />
    </div>
  );
}
