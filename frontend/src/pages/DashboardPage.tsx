import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { MetricCards } from '../components/dashboard/MetricCards';
import { AlertQueue } from '../components/dashboard/AlertQueue';
import { GraphExplorer } from '../components/dashboard/GraphExplorer';
import { TemporalVelocity } from '../components/dashboard/TemporalVelocity';
import { AlertDetailPanel } from '../components/dashboard/AlertDetailPanel';
import { useAlerts, useMetrics, useSubgraph, useVelocityStream, usePrediction } from '../hooks/useFraudDetection';
import type { Alert } from '../types';

export function DashboardPage() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  const { data: alerts } = useAlerts();
  const { data: metrics, isLoading: metricsLoading } = useMetrics();
  const { data: velocityData, isLoading: velocityLoading } = useVelocityStream();
  const prediction = usePrediction(selectedAlert?.entityId ?? '');

  const subgraphEntityId = selectedAlert?.entityId ?? null;
  const { data: subgraphData, isLoading: subgraphLoading } = useSubgraph(subgraphEntityId);

  useEffect(() => {
    if (selectedAlert) {
      prediction.mutate();
    }
  }, [selectedAlert?.entityId]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      
      <main className="ml-[240px] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-red-400" />
            <h1 className="text-xl font-semibold text-white">Fraud Detection Dashboard</h1>
          </div>
          <p className="text-sm text-zinc-500">Real-time monitoring and analysis of transaction networks</p>
        </motion.div>

        <MetricCards metrics={metrics ?? []} isLoading={metricsLoading} />

        <div className="grid grid-cols-12 gap-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-5 h-[calc(100vh-280px)]"
          >
            <AlertQueue
              alerts={alerts ?? []}
              onSelectAlert={setSelectedAlert}
              selectedAlertId={selectedAlert?.id ?? null}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="col-span-7 h-[calc(100vh-280px)]"
          >
            <GraphExplorer
              data={subgraphData}
              isLoading={subgraphLoading}
              onNodeClick={() => {}}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-[280px] mt-4"
        >
          <TemporalVelocity data={velocityData ?? []} isLoading={velocityLoading} />
        </motion.div>
      </main>

      <AlertDetailPanel
        alert={selectedAlert}
        prediction={prediction.data}
        isLoadingPrediction={prediction.isPending}
        onClose={() => setSelectedAlert(null)}
        onInvestigate={() => prediction.mutate()}
      />
    </div>
  );
}
