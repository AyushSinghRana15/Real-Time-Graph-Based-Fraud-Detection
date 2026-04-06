import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { useRealTimeGraph } from '../../hooks/useRealTime';
import type { TransactionNode } from '../../types';
import { riskColor } from '../../utils/colors';

interface GraphCanvasProps {
  entityId?: string | null;
  onNodeClick: (n: TransactionNode) => void;
  autoRotate?: boolean;
  showControls?: boolean;
}

export function GraphCanvas({ entityId: _entityId, onNodeClick, autoRotate = false, showControls = true }: GraphCanvasProps) {
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isInitialized, setIsInitialized] = useState(false);
  const { graphData, isLoading } = useRealTimeGraph(true, 5000);

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

  const nodeObj = useCallback((node: any) => {
    const score = node.riskScore ?? node.risk / 100;
    const color = riskColor(score);
    const g = new THREE.Group();
    
    const isHighRisk = score >= 0.6;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(isHighRisk ? 5 : 3, 16, 16),
      new THREE.MeshPhongMaterial({ 
        color, 
        transparent: true, 
        opacity: 0.9, 
        emissive: color, 
        emissiveIntensity: isHighRisk ? 0.6 : 0.2 
      }),
    );
    g.add(mesh);

    if (isHighRisk) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(8, 9, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
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
    return {
      nodes: graphData.nodes.map(n => ({ ...n, riskScore: n.risk / 100 })),
      links: validLinks.map(l => ({ source: l.source, target: l.target })),
    };
  })();

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
          linkWidth={1}
          linkColor={() => 'rgba(255,255,255,0.1)'}
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
      {!hasData && !isLoading && (
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
