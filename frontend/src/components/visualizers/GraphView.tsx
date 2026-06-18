"use client";

import { useMemo } from "react";

import type { SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { signatureOf, useStaggerChildren } from "@/animations";

interface GraphViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

const W = 340;
const H = 260;
const R = 96; // layout circle radius
const NODE_R = 18;

/**
 * Renders an adjacency-list dict ({ node: [neighbors] }) as a directed graph
 * using a circular layout — robust for small graphs without a physics sim.
 * Edges carry arrowheads to show direction; nodes fade in with a stagger.
 */
export function GraphView({ name, value, highlighted }: GraphViewProps) {
  const entries = (value.value as [SerializedValue, SerializedValue][]) ?? [];

  const { nodes, edges } = useMemo(() => {
    const labels = entries.map(([k]) => formatValue(k));
    const cx = W / 2;
    const cy = H / 2;
    const pos = new Map<string, { x: number; y: number }>();
    labels.forEach((label, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, labels.length) - Math.PI / 2;
      pos.set(label, { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) });
    });

    const e: { from: string; to: string }[] = [];
    entries.forEach(([k, neighbors]) => {
      const from = formatValue(k);
      const list = (neighbors.value as SerializedValue[]) ?? [];
      list.forEach((n) => {
        const to = formatValue(n);
        if (pos.has(to)) e.push({ from, to });
      });
    });

    return { nodes: labels.map((l) => ({ label: l, ...pos.get(l)! })), edges: e };
  }, [entries]);

  const svgRef = useStaggerChildren<SVGSVGElement>(signatureOf(nodes.map((n) => n.label)), {
    selector: "g.av-node",
    fadeOnly: true,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <span className="text-xs text-zinc-500">graph · {nodes.length} nodes</span>
      </div>

      <svg ref={svgRef} width={W} height={H} className="block">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className="fill-zinc-500" />
          </marker>
        </defs>
        {edges.map((edge, i) => {
          const a = nodes.find((n) => n.label === edge.from);
          const b = nodes.find((n) => n.label === edge.to);
          if (!a || !b) return null;
          // Shorten the segment so the arrowhead stops at the node border.
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          return (
            <line
              key={`${edge.from}-${edge.to}-${i}`}
              x1={a.x + ux * NODE_R}
              y1={a.y + uy * NODE_R}
              x2={b.x - ux * NODE_R}
              y2={b.y - uy * NODE_R}
              className="stroke-zinc-500"
              strokeWidth={1.5}
              markerEnd="url(#arrow)"
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.label} className="av-node">
            <circle
              cx={n.x}
              cy={n.y}
              r={NODE_R}
              className={
                highlighted
                  ? "fill-accent-muted stroke-surface-border"
                  : "fill-surface-raised stroke-surface-border"
              }
              strokeWidth={2}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              className="fill-zinc-100 font-mono"
              fontSize={12}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
