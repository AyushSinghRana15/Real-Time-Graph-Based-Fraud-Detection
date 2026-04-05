import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { fetchNodes } from '../../api/fraudApi';
import type { TransactionNode } from '../../types';
import { riskColor } from '../../utils/colors';

export function GraphCanvas({ entityId: _entityId, onNodeClick }: { entityId: string | null; onNodeClick: (n: TransactionNode) => void }) {
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const { data: nodes, isLoading } = useQuery({
    queryKey: ['nodes'],
    queryFn: fetchNodes,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handleResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge')?.strength(-150);
      graphRef.current.d3Force('link')?.distance(80);
    }
  }, [nodes]);

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

  const graphData = nodes ? {
    nodes: nodes.map(n => ({ ...n, riskScore: n.risk / 100 })),
    links: nodes.flatMap(n => n.connections.map(targetId => ({ source: n.id, target: targetId }))),
  } : { nodes: [], links: [] };

  const hasData = nodes && nodes.length > 0;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ background: '#09090b' }}>
      {hasData && (
        <ForceGraph3D
          ref={graphRef}
          graphData={graphData}
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
          cooldownTicks={150}
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
