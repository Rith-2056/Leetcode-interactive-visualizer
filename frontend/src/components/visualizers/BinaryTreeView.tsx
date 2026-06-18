"use client";

import { useMemo } from "react";

import type { SerializedValue, TreeNodeValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { layoutTree } from "@/utils/treeLayout";
import { signatureOf, useStaggerChildren } from "@/animations";

interface BinaryTreeViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

const NODE_R = 18;

/**
 * Renders a binary tree with positioned nodes and SVG edges. Layout is memoized
 * on the tree payload; nodes fade in (no transform, to keep SVG coordinates
 * intact) with a stagger whenever the structure changes.
 */
export function BinaryTreeView({ name, value, highlighted }: BinaryTreeViewProps) {
  const tree = value.value as TreeNodeValue | null;
  const layout = useMemo(() => layoutTree(tree, (n) => formatValue(n.val)), [tree]);
  const svgRef = useStaggerChildren<SVGSVGElement>(signatureOf(layout.nodes.map((n) => n.label)), {
    selector: "g.av-node",
    fadeOnly: true,
  });

  if (!tree) {
    return (
      <div className="space-y-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <p className="text-sm italic text-zinc-600">empty tree</p>
      </div>
    );
  }

  const byRef = new Map(layout.nodes.map((n) => [n.ref, n]));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <span className="text-xs text-zinc-500">tree · {layout.nodes.length}</span>
      </div>

      <div className="overflow-auto">
        <svg ref={svgRef} width={layout.width} height={layout.height} className="block">
          {layout.edges.map((e) => {
            const a = byRef.get(e.from);
            const b = byRef.get(e.to);
            if (!a || !b) return null;
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className="stroke-surface-border"
                strokeWidth={2}
              />
            );
          })}
          {layout.nodes.map((n, i) => (
            <g key={n.ref} className="av-node">
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R}
                className={
                  highlighted && i === 0
                    ? "fill-accent stroke-accent-soft"
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
    </div>
  );
}
