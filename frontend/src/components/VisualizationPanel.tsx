"use client";

import type { SerializedValue, Snapshot } from "@/types/execution";
import { ArrayView } from "@/components/visualizers/ArrayView";
import { StackView } from "@/components/visualizers/StackView";
import { HashMapView } from "@/components/visualizers/HashMapView";
import { LinkedListView } from "@/components/visualizers/LinkedListView";
import { BinaryTreeView } from "@/components/visualizers/BinaryTreeView";
import { GraphView } from "@/components/visualizers/GraphView";

/** A dict looks like an adjacency list when every value is a list/tuple. */
function isAdjacencyList(name: string, value: SerializedValue): boolean {
  if (value.type !== "dict") return false;
  if (!/graph|adj|edges|neighbou?rs/i.test(name)) return false;
  const entries = (value.value as [SerializedValue, SerializedValue][]) ?? [];
  return entries.length > 0 && entries.every(([, v]) => v.type === "list" || v.type === "tuple");
}

interface VisualizationPanelProps {
  snapshot: Snapshot | null;
}

/**
 * Chooses the right visualizer per variable based on its type and name. This
 * dispatch is the seam where future structures (linked lists, trees, graphs)
 * plug in — each becomes another case, no changes to consumers required.
 */
export function VisualizationPanel({ snapshot }: VisualizationPanelProps) {
  if (!snapshot) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-2xl">
          ✨
        </div>
        <p className="max-w-xs text-sm text-zinc-400">
          Press <span className="font-semibold text-zinc-200">Run</span> to watch your
          algorithm execute. Arrays, stacks, hash maps, linked lists, trees and graphs
          animate here automatically.
        </p>
      </div>
    );
  }

  const changed = new Set(snapshot.changed_variables);
  const entries = Object.entries(snapshot.variables);

  const VISUALIZABLE = new Set(["list", "tuple", "dict", "ListNode", "TreeNode"]);
  const visuals = entries.filter(([, v]) => VISUALIZABLE.has(v.type));

  if (visuals.length === 0) {
    return <p className="text-sm text-zinc-500">No visualizable structures in scope.</p>;
  }

  return (
    <div className="space-y-6">
      {visuals.map(([name, value]) => {
        const highlighted = changed.has(name);
        if (value.type === "ListNode") {
          return <LinkedListView key={name} name={name} value={value} highlighted={highlighted} />;
        }
        if (value.type === "TreeNode") {
          return <BinaryTreeView key={name} name={name} value={value} highlighted={highlighted} />;
        }
        if (isAdjacencyList(name, value)) {
          return <GraphView key={name} name={name} value={value} highlighted={highlighted} />;
        }
        if (value.type === "dict") {
          return <HashMapView key={name} name={name} value={value} highlighted={highlighted} />;
        }
        // Name heuristic distinguishes a stack from a plain array.
        if (/stack/i.test(name)) {
          return <StackView key={name} name={name} value={value} highlighted={highlighted} />;
        }
        return <ArrayView key={name} name={name} value={value} highlighted={highlighted} />;
      })}
    </div>
  );
}
