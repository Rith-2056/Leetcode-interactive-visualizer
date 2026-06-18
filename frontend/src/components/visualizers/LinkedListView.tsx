"use client";

import type { LinkedListValue, SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { signatureOf, useStaggerChildren } from "@/animations";
import { cn } from "@/ui/cn";

interface LinkedListViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

/**
 * Renders a linked list as node boxes joined by arrows. Nodes stagger in as the
 * chain changes (e.g. during reversal); a cycle is shown with a wrap marker
 * rather than looping forever.
 */
export function LinkedListView({ name, value, highlighted }: LinkedListViewProps) {
  const ll = value.value as LinkedListValue | null;
  const nodes = ll?.nodes ?? [];
  const containerRef = useStaggerChildren<HTMLDivElement>(
    signatureOf([nodes.map((n) => formatValue(n.val)), ll?.cyclic]),
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <span className="text-xs text-zinc-500">
          linked list · {nodes.length}
          {ll?.cyclic ? " · cyclic" : ""}
        </span>
      </div>

      {nodes.length === 0 ? (
        <span className="text-sm italic text-zinc-600">None</span>
      ) : (
        <div ref={containerRef} className="flex flex-wrap items-center gap-1">
          {nodes.map((node, i) => (
            <div key={node.ref} className="flex items-center">
              <div
                className={cn(
                  "flex h-11 min-w-[2.75rem] items-center justify-center rounded-md border px-2 font-mono text-sm transition-colors duration-300",
                  highlighted && i === 0
                    ? "border-accent bg-accent/20 text-zinc-100 shadow-glow"
                    : "border-surface-border bg-surface-raised text-zinc-200",
                )}
              >
                {formatValue(node.val)}
              </div>
              {i < nodes.length - 1 && <span className="px-1 text-accent-soft">→</span>}
            </div>
          ))}
          <span className="px-1 text-xs text-zinc-600">{ll?.cyclic ? "↺" : "→ ∅"}</span>
        </div>
      )}
    </div>
  );
}
