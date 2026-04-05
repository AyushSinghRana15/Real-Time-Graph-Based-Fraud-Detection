import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TopNavigation } from '../components/layout/TopNavigation';
import { AlertQueue } from '../components/dashboard/AlertQueue';
import { ForceGraphContainer } from '../components/dashboard/ForceGraphContainer';
import { TimelinePlayback } from '../components/dashboard/TimelinePlayback';
import { AlertSlideOver } from '../components/dashboard/AlertSlideOver';
import { useAlerts, useSubgraph, usePrediction } from '../hooks/useFraudDetection';
import type { Alert, TransactionNode } from '../types';

export function DashboardPage() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [maxTimestamp, setMaxTimestamp] = useState(new Date());
  
  const { data: alerts } = useAlerts();
  const prediction = usePrediction(selectedAlert?.entityId ?? '');
  
  const subgraphEntityId = selectedAlert?.entityId ?? null;
  const { data: subgraphData, isLoading: subgraphLoading } = useSubgraph(subgraphEntityId);

  useEffect(() => {
    if (selectedAlert) {
      prediction.mutate();
    }
  }, [selectedAlert?.entityId]);

  const handleNodeClick = useCallback((node: TransactionNode) => {
    const alert = alerts?.find(a => a.entityId === node.id);
    if (alert) {
      setSelectedAlert(alert);
    }
  }, [alerts]);

  const handleTimeChange = useCallback((date: Date) => {
    setMaxTimestamp(date);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute inset-0 scan-line opacity-10" />
      </div>
      
      <TopNavigation />
      
      <main className="pt-16 pb-24 px-6">
        <div className="grid grid-cols-12 gap-4 mt-4 h-[calc(100vh-280px)]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-5 h-full"
          >
            <AlertQueue
              alerts={alerts ?? []}
              onSelectAlert={setSelectedAlert}
              selectedAlertId={selectedAlert?.id ?? null}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="col-span-7 h-full"
          >
            <div className="h-full bg-black/50 rounded-lg border border-zinc-800/50 overflow-hidden">
              <div className="h-full relative">
                <ForceGraphContainer
                  data={subgraphData}
                  isLoading={subgraphLoading}
                  onNodeClick={handleNodeClick}
                  maxTimestamp={maxTimestamp}
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="px-3 py-1 glass glass-border rounded text-xs font-mono text-lime-400 tracking-wider">
                    3D NETWORK TOPOLOGY
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <div className="fixed bottom-6 left-6 right-6">
        <TimelinePlayback
          onTimeChange={handleTimeChange}
          initialTime={new Date()}
        />
      </div>

      <AlertSlideOver
        alert={selectedAlert}
        prediction={prediction.data}
        subgraph={subgraphData}
        isLoadingPrediction={prediction.isPending}
        isLoadingSubgraph={subgraphLoading}
        onClose={() => setSelectedAlert(null)}
        onInvestigate={() => prediction.mutate()}
      />
    </div>
  );
}
