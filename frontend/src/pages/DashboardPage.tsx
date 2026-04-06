import { useState, useCallback, useEffect } from 'react';
import { useAlerts } from '../hooks/useFraudDetection';
import { useRealTimeAlerts } from '../hooks/useRealTime';
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
import { NetworkExplorer } from '../components/dashboard/NetworkExplorer';
import { AboutPage } from '../components/dashboard/AboutPage';
import { useGraphAnalytics } from '../hooks/useRealTime';

const RISK_THRESHOLDS = [
  { label: 'Low (0-25%)', color: '#22c55e', minRisk: 0 },
  { label: 'Medium (25-50%)', color: '#eab308', minRisk: 25 },
  { label: 'High (50-75%)', color: '#f97316', minRisk: 50 },
  { label: 'Critical (75%+)', color: '#ef4444', minRisk: 75 },
];

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const { data: alerts = [] } = useAlerts();
  const { toasts, removeToast, graphState } = useRealTimeAlerts(true);
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

  const graphStats = {
    total_nodes: graphState?.stats?.total_nodes ?? 0,
    total_edges: graphState?.stats?.total_edges ?? 0,
    high_risk_nodes: graphState?.stats?.high_risk_nodes ?? graphState?.nodes.filter((n: any) => n.risk > 70).length ?? 0,
    network_avg_risk: graphState?.stats?.network_avg_risk ?? 0,
  };

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

      <NetworkExplorer
        isActive={isNetworkMode}
        stats={graphStats}
        riskThresholds={RISK_THRESHOLDS}
        onClose={() => setActiveNav('Dashboard')}
      />

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
