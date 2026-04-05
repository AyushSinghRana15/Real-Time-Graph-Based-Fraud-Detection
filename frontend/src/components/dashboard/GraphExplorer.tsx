import { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphData, TransactionNode } from '../../types';

interface GraphExplorerProps {
  data: GraphData | undefined;
  isLoading: boolean;
  onNodeClick: (node: TransactionNode) => void;
}

export function GraphExplorer({ data, isLoading, onNodeClick }: GraphExplorerProps) {
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const container = graphRef.current?.parentElement;
    if (container) {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge')?.strength(-300);
    }
  }, []);

  const getNodeColor = useCallback((node: any) => {
    const score = node.riskScore ?? 0;
    if (score >= 0.85) return '#ef4444';
    if (score >= 0.6) return '#f97316';
    if (score >= 0.3) return '#eab308';
    return '#22c55e';
  }, []);

  const getNodeGlow = useCallback((node: any) => {
    const score = node.riskScore ?? 0;
    if (score >= 0.6) return 12;
    if (score >= 0.3) return 6;
    return 0;
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
        <div className="w-12 h-12 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
        <p className="text-zinc-500 text-sm">Select an alert to view network</p>
      </div>
    );
  }

  const graphData = {
    nodes: data.nodes.map(n => ({ ...n })),
    links: data.links.map(l => ({ ...l })),
  };

  return (
    <div className="h-full bg-zinc-900/30 rounded-2xl border border-zinc-800/50 overflow-hidden">
      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Network Explorer</h3>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Low
          </span>
        </div>
      </div>
      <div className="h-[calc(100%-60px)]">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="label"
          nodeColor={getNodeColor}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
            const label = node.label;
            const x = node.x;
            const y = node.y;
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = '#a1a1aa';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, y - 14 / globalScale);
            const glow = getNodeGlow(node);
            if (glow > 0) {
              ctx.shadowColor = getNodeColor(node);
              ctx.shadowBlur = glow * globalScale;
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI);
              ctx.fillStyle = getNodeColor(node);
              ctx.fill();
            }
          }}
          linkColor={() => '#3f3f46'}
          linkWidth={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => '#f97316'}
          linkDirectionalParticleSpeed={0.005}
          onNodeClick={(node: any) => onNodeClick(node as TransactionNode)}
          cooldownTicks={100}
          backgroundColor="transparent"
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
    </div>
  );
}
