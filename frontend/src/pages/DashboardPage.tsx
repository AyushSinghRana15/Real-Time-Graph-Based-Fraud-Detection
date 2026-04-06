import { useState, useCallback, useEffect } from 'react';
import { useAlerts } from '../hooks/useFraudDetection';
import { useRealTimeAlerts, useGraphAnalytics } from '../hooks/useRealTime';
import type { Alert, TransactionNode } from '../types';
import { HUDHeader, type NavItem } from '../components/dashboard/HUDHeader';
import { GraphCanvas } from '../components/dashboard/GraphCanvas';
import { HUDSidebar } from '../components/dashboard/HUDSidebar';
import { HUDContextPanel } from '../components/dashboard/HUDContextPanel';
import { FocusSandbox } from '../components/dashboard/FocusSandbox';
import { SettingsOverlay } from '../components/dashboard/SettingsOverlay';
import { UserProfileOverlay } from '../components/dashboard/UserProfileOverlay';
import { ToastContainer } from '../components/ToastContainer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AboutPage } from '../components/dashboard/AboutPage';
import { NetworkPage } from '../components/dashboard/NetworkPage';

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const { data: alerts = [] } = useAlerts();
  const { toasts, removeToast } = useRealTimeAlerts(true);
  const { analytics } = useGraphAnalytics(true, 12000);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeNav, setActiveNav] = useState<NavItem>('Dashboard');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isContextCollapsed, setIsContextCollapsed] = useState(true);
  const [autoRotate] = useState(true);

  const isSandboxMode = activeNav === 'Sandbox';
  const isNetworkMode = activeNav === 'Network';
  const isAboutMode = activeNav === 'About';
  const highRiskCount = alerts.filter(a => a.type === 'high_risk').length;

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

  useEffect(() => {
    if (selectedAlert) {
      setIsContextCollapsed(false);
    }
  }, [selectedAlert]);

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: '#09090b' }}>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <ErrorBoundary>
          <GraphCanvas
            entityId={selectedAlert?.entityId ?? null}
            onNodeClick={handleNodeClick}
            autoRotate={isNetworkMode && autoRotate}
            cycleNodes={analytics?.nodes_in_cycles || []}
          />
        </ErrorBoundary>
      </div>

      <HUDHeader
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        highRiskCount={highRiskCount}
      />

      {!isSandboxMode && !isNetworkMode && (
        <>
          <HUDSidebar
            alerts={alerts}
            selectedId={selectedAlert?.id ?? null}
            onSelect={setSelectedAlert}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            side="left"
          />

          {selectedAlert && (
            <HUDContextPanel
              alert={selectedAlert}
              onClose={() => setSelectedAlert(null)}
              isCollapsed={isContextCollapsed}
              onToggle={() => setIsContextCollapsed(!isContextCollapsed)}
            />
          )}
        </>
      )}

      {isNetworkMode && (
        <NetworkPage onClose={() => setActiveNav('Dashboard')} />
      )}

      <FocusSandbox
        isActive={isSandboxMode}
        onClose={() => setActiveNav('Dashboard')}
        defaultAlert={selectedAlert ? { entityId: selectedAlert.entityId, entityName: selectedAlert.entityName, amount: selectedAlert.amount } : null}
      />

      <AboutPage
        isActive={isAboutMode}
        onClose={() => setActiveNav('Dashboard')}
      />

      <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <UserProfileOverlay isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onLogout={onLogout} />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
