"use client";

import type { Snapshot } from "@/types/execution";
import { ArrayView } from "@/components/visualizers/ArrayView";
import { StackView } from "@/components/visualizers/StackView";
import { HashMapView } from "@/components/visualizers/HashMapView";

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
      <p className="text-sm text-zinc-500">
        Run your code to see data structures animate here.
      </p>
    );
  }

  const changed = new Set(snapshot.changed_variables);
  const entries = Object.entries(snapshot.variables);

  const visuals = entries.filter(
    ([, v]) => v.type === "list" || v.type === "tuple" || v.type === "dict",
  );

  if (visuals.length === 0) {
    return <p className="text-sm text-zinc-500">No visualizable structures in scope.</p>;
  }

  return (
    <div className="space-y-6">
      {visuals.map(([name, value]) => {
        const highlighted = changed.has(name);
        // Name heuristic distinguishes a stack from a plain array.
        const looksLikeStack = /stack/i.test(name);
        if (value.type === "dict") {
          return <HashMapView key={name} name={name} value={value} highlighted={highlighted} />;
        }
        if (looksLikeStack) {
          return <StackView key={name} name={name} value={value} highlighted={highlighted} />;
        }
        return <ArrayView key={name} name={name} value={value} highlighted={highlighted} />;
      })}
    </div>
  );
}
