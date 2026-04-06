import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import type { TransactionNode } from '../../types';
import { riskColor } from '../../utils/colors';

interface GraphCanvasProps {
  entityId?: string | null;
  onNodeClick: (n: TransactionNode) => void;
  autoRotate?: boolean;
  showControls?: boolean;
  cycleNodes?: string[];
}

const PROXY_DATA = {
  nodes: [
    { id: 'aditya', label: 'Aditya Sharma', risk: 75, riskScore: 0.75 },
    { id: 'ayush', label: 'Ayush Singh', risk: 15, riskScore: 0.15 },
    { id: 'bipin', label: 'Bipin Kumar', risk: 92, riskScore: 0.92 },
    { id: 'ashutosh', label: 'Ashutosh Mishra', risk: 45, riskScore: 0.45 },
    { id: 'gfx', label: 'GFX Exchange', risk: 60, riskScore: 0.60 },
    { id: 'cryptovault', label: 'CryptoVault', risk: 35, riskScore: 0.35 },
    { id: 'quickpay', label: 'QuickPay', risk: 28, riskScore: 0.28 },
    { id: 'globaltrade', label: 'Global Trade', risk: 55, riskScore: 0.55 },
    { id: 'wallet1', label: '钱包 Alpha', risk: 88, riskScore: 0.88 },
    { id: 'wallet2', label: '钱包 Beta', risk: 82, riskScore: 0.82 },
  ],
  links: [
    { source: 'aditya', target: 'bipin' },
    { source: 'bipin', target: 'gfx' },
    { source: 'gfx', target: 'cryptovault' },
    { source: 'ayush', target: 'quickpay' },
    { source: 'ashutosh', target: 'globaltrade' },
    { source: 'wallet1', target: 'wallet2' },
    { source: 'wallet2', target: 'wallet1' },
    { source: 'aditya', target: 'ayush' },
    { source: 'bipin', target: 'ashutosh' },
    { source: 'gfx', target: 'wallet1' },
  ],
};

export function GraphCanvas({ entityId: _entityId, onNodeClick, autoRotate = false, cycleNodes = [] }: GraphCanvasProps) {
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isInitialized, setIsInitialized] = useState(false);
  const [graphData, setGraphData] = useState(PROXY_DATA);
  const cycleNodeSet = useRef<Set<string>>(new Set(cycleNodes));

  useEffect(() => {
    cycleNodeSet.current = new Set(cycleNodes);
  }, [cycleNodes]);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await fetch('/api/graph/state');
        if (res.ok) {
          const data = await res.json();
          if (data.nodes && data.nodes.length > 0) {
            setGraphData({
              nodes: data.nodes.map((n: any) => ({ ...n, riskScore: n.risk / 100 })),
              links: data.edges.filter((l: any) => l.source && l.target),
            });
          }
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error fetching graph:', error);
        setIsInitialized(true);
      }
    };
    fetchGraph();
    const interval = setInterval(fetchGraph, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (graphData.nodes.length > 0) {
      setIsInitialized(true);
    }
  }, [graphData.nodes.length]);

  useEffect(() => {
    const handleResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (graphRef.current && isInitialized) {
      graphRef.current.d3Force('charge')?.strength(-150);
      graphRef.current.d3Force('link')?.distance(80);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (graphRef.current && autoRotate) {
      const control = graphRef.current.controls();
      if (control) {
        control.autoRotate = true;
        control.autoRotateSpeed = 0.5;
      }
    }
  }, [autoRotate, isInitialized]);

  const nodeObj = useCallback((node: any) => {
    const score = node.riskScore ?? node.risk / 100;
    const isInCycle = cycleNodeSet.current.has(node.id);
    const baseColor = isInCycle ? '#ef4444' : riskColor(score);
    const g = new THREE.Group();
    
    const isHighRisk = score >= 0.6 || isInCycle;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(isInCycle ? 5.5 : (isHighRisk ? 5 : 3), 16, 16),
      new THREE.MeshPhongMaterial({ 
        color: baseColor, 
        transparent: true, 
        opacity: 0.95, 
        emissive: baseColor, 
        emissiveIntensity: isInCycle ? 0.8 : (isHighRisk ? 0.6 : 0.2) 
      }),
    );
    g.add(mesh);

    if (isInCycle) {
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(7, 8.5, 32),
        new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: 0.4, side: THREE.DoubleSide }),
      );
      outerRing.rotation.x = Math.PI / 2;
      g.add(outerRing);

      const innerRing = new THREE.Mesh(
        new THREE.RingGeometry(9, 10, 32),
        new THREE.MeshBasicMaterial({ color: '#fca5a5', transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
      );
      innerRing.rotation.x = Math.PI / 2;
      g.add(innerRing);
    } else if (isHighRisk) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(8, 9, 32),
        new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
      );
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    }

    return g;
  }, []);

  const transformedData = (() => {
    const nodeIds = new Set(graphData.nodes.map(n => n.id));
    const validLinks = graphData.links.filter(
      l => nodeIds.has(l.source) && nodeIds.has(l.target)
    );
    
    const cycleEdges = new Set<string>();
    validLinks.forEach(l => {
      if (cycleNodeSet.current.has(l.source) && cycleNodeSet.current.has(l.target)) {
        cycleEdges.add(`${l.source}-${l.target}`);
      }
    });

    return {
      nodes: graphData.nodes.map(n => ({ ...n, riskScore: n.risk / 100 })),
      links: validLinks.map(l => ({ 
        source: l.source, 
        target: l.target,
        isCycle: cycleEdges.has(`${l.source}-${l.target}`)
      })),
    };
  })();

  const linkColor = useCallback((link: any) => {
    if (link.isCycle) return 'rgba(239, 68, 68, 0.6)';
    return 'rgba(255,255,255,0.1)';
  }, []);

  const linkWidth = useCallback((link: any) => {
    if (link.isCycle) return 2;
    return 1;
  }, []);

  const hasData = transformedData.nodes.length > 0;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: '#09090b' }}>
      {hasData && (
        <ForceGraph3D
          ref={graphRef}
          graphData={transformedData}
          nodeId="id"
          nodeLabel="label"
          nodeThreeObject={nodeObj}
          nodeThreeObjectExtend={false}
          linkWidth={linkWidth}
          linkColor={linkColor}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleColor={() => '#f59e0b'}
          linkDirectionalParticleSpeed={0.005}
          onNodeClick={(n: any) => onNodeClick(n as TransactionNode)}
          cooldownTicks={100}
          onEngineStop={() => {
            if (graphRef.current) {
              graphRef.current.zoomToFit(400, 50);
            }
          }}
          backgroundColor="#09090b"
          width={dims.w}
          height={dims.h}
          showNavInfo={false}
          enableNodeDrag
          enableNavigationControls
          controlType="orbit"
        />
      )}

      {/* Empty State */}
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="text-center">
            <Network className="w-16 h-16 mx-auto mb-4" style={{ color: '#27272a' }} />
            <p className="text-sm" style={{ color: '#3f3f46' }}>Select an alert to analyze network</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
