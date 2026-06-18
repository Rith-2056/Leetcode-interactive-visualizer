"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import type { SerializedValue, TreeNodeValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { layoutTree } from "@/utils/treeLayout";

interface BinaryTreeViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

const NODE_R = 18; // node radius, matched to the SVG/box sizing below

/**
 * Renders a binary tree with positioned nodes and SVG edges. Layout is memoized
 * on the tree payload so we only recompute when the structure actually changes.
 */
export function BinaryTreeView({ name, value, highlighted }: BinaryTreeViewProps) {
  const tree = value.value as TreeNodeValue | null;

  const layout = useMemo(
    () => layoutTree(tree, (n) => formatValue(n.val)),
    [tree],
  );

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
        <svg width={layout.width} height={layout.height} className="block">
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
            <motion.g
              key={n.ref}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.3), type: "spring", stiffness: 400, damping: 26 }}
            >
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
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}
