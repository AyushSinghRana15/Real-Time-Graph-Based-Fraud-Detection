import { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import type { GraphData, TransactionNode } from '../../types';
import * as THREE from 'three';

interface ForceGraphContainerProps {
  data: GraphData | undefined;
  isLoading: boolean;
  onNodeClick: (node: TransactionNode) => void;
  maxTimestamp: Date;
}

export function ForceGraphContainer({ data, isLoading, onNodeClick, maxTimestamp }: ForceGraphContainerProps) {
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const container = document.getElementById('graph-container');
    if (container) {
      const updateDimensions = () => {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      const chargeForce = graphRef.current.d3Force('charge');
      if (chargeForce) chargeForce.strength(-150);
      const linkForce = graphRef.current.d3Force('link');
      if (linkForce) (linkForce as any).distance(50);
    }
  }, [data]);

  const filterDataByTime = useCallback((graphData: GraphData) => {
    const filteredNodes = graphData.nodes.filter(node => 
      new Date(node.lastSeen) <= maxTimestamp
    );
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return nodeIds.has(sourceId) && nodeIds.has(targetId) && 
             new Date(link.timestamp) <= maxTimestamp;
    });
    return { nodes: filteredNodes, links: filteredLinks };
  }, [maxTimestamp]);

  const getNodeColor = useCallback((node: any) => {
    const score = node.riskScore ?? 0;
    if (score >= 0.85) return '#ef4444';
    if (score >= 0.6) return '#f97316';
    if (score >= 0.3) return '#eab308';
    return '#22c55e';
  }, []);

  const nodeThreeObject = useCallback((node: any) => {
    const score = node.riskScore ?? 0;
    const isHighRisk = score >= 0.6;
    
    const group = new THREE.Group();
    
    const sphereGeom = new THREE.SphereGeometry(isHighRisk ? 4 : 2, 16, 16);
    const sphereMat = new THREE.MeshPhongMaterial({ 
      color: getNodeColor(node),
      transparent: true,
      opacity: 0.9,
      emissive: getNodeColor(node),
      emissiveIntensity: isHighRisk ? 0.5 : 0.2,
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    group.add(sphere);
    
    if (isHighRisk) {
      const ringGeom = new THREE.RingGeometry(6, 7, 32);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: getNodeColor(node), 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide 
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.userData.isPulseRing = true;
      ring.userData.pulsePhase = Math.random() * Math.PI * 2;
      group.add(ring);
    }
    
    return group;
  }, [getNodeColor]);

  useEffect(() => {
    let time = 0;
    const animate = () => {
      time += 0.02;
      
      if (graphRef.current) {
        const scene = graphRef.current.scene();
        if (scene) {
          scene.children.forEach((child: any) => {
            if (child.userData?.isPulseRing) {
              const scale = 1 + Math.sin(time * 2 + child.userData.pulsePhase) * 0.2;
              child.scale.set(scale, scale, scale);
              child.material.opacity = 0.3 - Math.sin(time * 2 + child.userData.pulsePhase) * 0.15;
            }
          });
        }
      }
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-black/50 rounded">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lime-400 font-mono text-sm tracking-widest">LOADING GRAPH DATA...</p>
        </div>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-black/50 rounded">
        <p className="text-zinc-500 font-mono text-sm tracking-widest">AWAITING INPUT STREAM...</p>
      </div>
    );
  }

  const filteredData = filterDataByTime(data);

  return (
    <div id="graph-container" className="h-full w-full">
      <ForceGraph3D
        ref={graphRef}
        graphData={filteredData}
        nodeId="id"
        nodeLabel="label"
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleColor={() => '#f97316'}
        linkDirectionalParticleSpeed={0.01}
        onNodeClick={(node: any) => onNodeClick(node as TransactionNode)}
        onNodeRightClick={(node: any) => {
          graphRef.current?.centerAt(node.x, node.y, node.z, 500);
          graphRef.current?.zoom(3, 500);
        }}
        cooldownTicks={100}
        backgroundColor="#000000"
        width={dimensions.width}
        height={dimensions.height}
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        controlType="orbit"
      />
    </div>
  );
}
