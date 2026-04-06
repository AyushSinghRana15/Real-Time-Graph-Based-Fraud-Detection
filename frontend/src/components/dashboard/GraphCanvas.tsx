import { useEffect, useState, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
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

interface GraphNode {
  id: string;
  label: string;
  risk: number;
  riskScore?: number;
  is_system?: boolean;
  x?: number;
  y?: number;
  z?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface TransformedNode extends GraphNode {
  riskScore: number;
}

interface TransformedLink {
  source: string;
  target: string;
  isCycle?: boolean;
}

const PROXY_DATA = {
  nodes: [
    { id: 'gateway_main', label: 'System Gateway Alpha', risk: 5, riskScore: 0.05 },
    { id: 'gateway_backup', label: 'System Gateway Beta', risk: 8, riskScore: 0.08 },
  ],
  links: [
    { source: 'gateway_main', target: 'gateway_backup' },
  ],
};

export const GraphCanvas = forwardRef<{ refresh: () => void }, GraphCanvasProps>(function GraphCanvas({ entityId: _entityId, onNodeClick, autoRotate = false, cycleNodes = [] }, ref) {
  const graphRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isInitialized, setIsInitialized] = useState(false);
  const [graphData, setGraphData] = useState(PROXY_DATA);
  const cycleNodeSet = useRef<Set<string>>(new Set(cycleNodes));

  useEffect(() => {
    cycleNodeSet.current = new Set(cycleNodes);
  }, [cycleNodes]);

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch('/api/graph/state');
      if (res.ok) {
        const data = await res.json();
        setGraphData({
          nodes: data.nodes ? data.nodes.map((n: GraphNode) => ({ ...n, riskScore: n.risk / 100 })) : [],
          links: data.edges ? data.edges.filter((l: GraphLink) => l.source && l.target) : [],
        });
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error fetching graph:', error);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
    const interval = setInterval(fetchGraph, 12000);
    return () => clearInterval(interval);
  }, [fetchGraph]);

  useImperativeHandle(ref, () => ({
    refresh: fetchGraph,
  }), [fetchGraph]);

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

  const transformedData = useMemo(() => {
    const nodeIds = new Set(graphData.nodes.map(n => n.id));
    const validLinks = graphData.links.filter(
      (l: GraphLink) => nodeIds.has(l.source) && nodeIds.has(l.target)
    );

    const cycleEdges = new Set<string>();
    validLinks.forEach((l: GraphLink) => {
      if (cycleNodeSet.current.has(l.source) && cycleNodeSet.current.has(l.target)) {
        cycleEdges.add(`${l.source}-${l.target}`);
      }
    });

    return {
      nodes: graphData.nodes.map((n: GraphNode) => ({ ...n, riskScore: n.risk / 100 })) as TransformedNode[],
      links: validLinks.map((l: GraphLink) => ({
        source: l.source,
        target: l.target,
        isCycle: cycleEdges.has(`${l.source}-${l.target}`)
      })) as TransformedLink[],
    };
  }, [graphData]);

  useEffect(() => {
    if (cycleNodes.length > 0 && graphRef.current && isInitialized && transformedData.nodes.length > 0) {
      const cycleNodeIds = new Set(cycleNodes);
      const cycleDataNodes = transformedData.nodes.filter((n: TransformedNode) => cycleNodeIds.has(n.id));
      
      if (cycleDataNodes.length > 0) {
        let centerX = 0, centerY = 0, centerZ = 0;
        cycleDataNodes.forEach((n: TransformedNode) => {
          centerX += n.x || 0;
          centerY += n.y || 0;
          centerZ += n.z || 0;
        });
        centerX /= cycleDataNodes.length;
        centerY /= cycleDataNodes.length;
        centerZ /= cycleDataNodes.length;
        
        graphRef.current.cameraPosition(
          { x: centerX + 50, y: centerY + 30, z: centerZ + 50 },
          { x: centerX, y: centerY, z: centerZ },
          1500
        );
        
        const control = graphRef.current.controls();
        if (control) {
          control.autoRotate = true;
          control.autoRotateSpeed = 1.5;
        }
      }
    }
  }, [cycleNodes, isInitialized, transformedData.nodes.length]);

  const nodeObj = useCallback((node: any) => {
    const score = node.riskScore ?? node.risk / 100;
    const isSystem = node.is_system === true || node.is_system === 1;
    const isInCycle = cycleNodeSet.current.has(node.id);
    const baseColor = isInCycle ? '#ef4444' : riskColor(score);
    const g = new THREE.Group();

    if (isSystem && !isInCycle) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 8, 8),
        new THREE.MeshPhongMaterial({
          color: '#52525b',
          transparent: true,
          opacity: 0.2,
          emissive: '#52525b',
          emissiveIntensity: 0.05
        }),
      );
      g.add(mesh);
      return g;
    }

    const isHighRisk = score >= 0.6 || isInCycle;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(isInCycle ? 6 : (isHighRisk ? 5 : 3.5), 16, 16),
      new THREE.MeshPhongMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.95,
        emissive: baseColor,
        emissiveIntensity: isInCycle ? 0.9 : (isHighRisk ? 0.6 : 0.3)
      }),
    );
    g.add(mesh);

    if (isInCycle) {
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(8, 9.5, 32),
        new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
      );
      outerRing.rotation.x = Math.PI / 2;
      g.add(outerRing);

      const innerRing = new THREE.Mesh(
        new THREE.RingGeometry(10, 11, 32),
        new THREE.MeshBasicMaterial({ color: '#fca5a5', transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
      );
      innerRing.rotation.x = Math.PI / 2;
      g.add(innerRing);
    } else if (isHighRisk) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(7, 8, 32),
        new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
      );
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    }

    return g;
  }, []);

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
});
