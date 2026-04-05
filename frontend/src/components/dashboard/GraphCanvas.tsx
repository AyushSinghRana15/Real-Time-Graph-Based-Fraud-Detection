import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { useSubgraph } from '../../hooks/useFraudDetection';
import type { TransactionNode } from '../../types';
import { riskColor } from '../../utils/colors';

export function GraphCanvas({ entityId, onNodeClick }: { entityId: string | null; onNodeClick: (n: TransactionNode) => void }) {
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const { data, isLoading } = useSubgraph(entityId ?? 'default');

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
  }, [data]);

  const nodeObj = useCallback((node: any) => {
    const score = node.riskScore ?? 0;
    const color = riskColor(score);
    const g = new THREE.Group();
    
    // Core sphere
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

    // Glowing halo for higher risks
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

  const hasData = data && data.nodes.length > 0;

  return (
    <div className="absolute inset-0 z-0 bg-zinc-950 overflow-hidden">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', 
          backgroundSize: '40px 40px' 
        }} 
      />
      
      {/* Loading Overlay */}
      {isLoading && !hasData && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-zinc-950/50 backdrop-blur-sm">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-rose-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-sm font-medium tracking-wide text-zinc-400 uppercase">Synthesizing Network Data...</p>
          </motion.div>
        </div>
      )}

      {/* Graph Area */}
      {hasData && (
        <ForceGraph3D
          ref={graphRef}
          graphData={data!}
          nodeId="id"
          nodeLabel="label"
          nodeThreeObject={nodeObj}
          nodeThreeObjectExtend={false}
          linkWidth={1}
          linkColor={(l: any) => l.isFlagged ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.1)'}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleColor={(l: any) => l.isFlagged ? '#f43f5e' : '#f59e0b'}
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
          <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 4, repeat: Infinity }} className="flex flex-col items-center">
            <Network className="w-20 h-20 text-zinc-800 mb-6 drop-shadow-2xl" />
            <p className="text-base font-medium text-zinc-600">Select an alert to initiate forensic graph rendering</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
