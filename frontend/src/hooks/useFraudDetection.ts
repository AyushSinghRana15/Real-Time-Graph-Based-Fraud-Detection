import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchAlerts, fetchMetrics, fetchSubgraph, fetchVelocityStream, predictFraud } from '../api/mockApi';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

export function useMetrics() {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    refetchInterval: 30000,
  });
}

export function useSubgraph(entityId: string | null) {
  return useQuery({
    queryKey: ['subgraph', entityId],
    queryFn: () => fetchSubgraph(entityId!),
    enabled: !!entityId,
    refetchInterval: 30000,
  });
}

export function useVelocityStream() {
  return useQuery({
    queryKey: ['velocity'],
    queryFn: fetchVelocityStream,
    refetchInterval: 2000,
  });
}

export function usePrediction(entityId: string) {
  return useMutation({
    mutationFn: () => predictFraud(entityId),
  });
}
