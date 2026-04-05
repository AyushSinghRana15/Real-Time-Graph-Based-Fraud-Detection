import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '../api/fraudApi';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 15000,
    staleTime: 10000,
  });
}
