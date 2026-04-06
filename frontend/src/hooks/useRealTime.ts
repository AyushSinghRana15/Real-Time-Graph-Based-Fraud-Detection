import { useState, useEffect, useCallback, useRef } from 'react';
import type { Alert, TransactionNode, TransactionLink } from '../types';
import { fetchAlerts, fetchGraphState } from '../api/fraudApi';

interface GraphState {
  nodes: TransactionNode[];
  edges: TransactionLink[];
  node_risks?: Record<string, number>;
  stats: {
    total_nodes: number;
    total_edges: number;
    high_risk_nodes?: number;
    network_avg_risk?: number;
  };
}

interface Toast {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

const POLL_INTERVAL = 12000;

export function useRealTimeAlerts(enabled = true) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [graphState, setGraphState] = useState<GraphState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const previousAlertsRef = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const newToast: Toast = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [newAlerts, newGraphState] = await Promise.all([
        fetchAlerts(),
        fetchGraphState(),
      ]);
      
      if (isFirstFetch.current) {
        previousAlertsRef.current = new Set(newAlerts.map(a => a.id));
        isFirstFetch.current = false;
      } else {
        const newAlertIds = new Set(newAlerts.map(a => a.id));
        const previousIds = previousAlertsRef.current;
        
        const newHighRiskAlerts = newAlerts.filter(
          a => a.type === 'high_risk' && !previousIds.has(a.id)
        );
        
        for (const alert of newHighRiskAlerts) {
          addToast({
            type: 'critical',
            title: 'High-Risk Alert Detected',
            message: `${alert.entityName}: $${alert.amount.toLocaleString()} - ${alert.description.slice(0, 60)}...`,
          });
        }
        
        previousAlertsRef.current = newAlertIds;
      }
      
      setAlerts(newAlerts);
      setGraphState(newGraphState);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!enabled) return;
    
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    
    return () => clearInterval(interval);
  }, [enabled, fetchData]);

  return {
    alerts,
    graphState,
    toasts,
    addToast,
    removeToast,
    isLoading,
    lastUpdate,
    refetch: fetchData,
  };
}

interface GraphData {
  nodes: TransactionNode[];
  links: TransactionLink[];
}

export function useRealTimeGraph(enabled = true, pollInterval = 5000) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchGraph = useCallback(async () => {
    try {
      const state = await fetchGraphState();
      setGraphData({
        nodes: state.nodes,
        links: state.edges,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching graph:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    fetchGraph();
    const interval = setInterval(fetchGraph, pollInterval);
    
    return () => clearInterval(interval);
  }, [enabled, pollInterval, fetchGraph]);

  return {
    graphData,
    isLoading,
    refetch: fetchGraph,
  };
}
