"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { LinkedListValue, SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { cn } from "@/ui/cn";

interface LinkedListViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

/**
 * Renders a linked list as a row of node boxes joined by arrows. Nodes animate
 * in/out as the chain changes (e.g. during reversal), and a cycle is shown with
 * a wrap-around marker rather than looping forever.
 */
export function LinkedListView({ name, value, highlighted }: LinkedListViewProps) {
  const ll = value.value as LinkedListValue | null;
  const nodes = ll?.nodes ?? [];

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
        <div className="flex flex-wrap items-center gap-1">
          <AnimatePresence initial={false} mode="popLayout">
            {nodes.map((node, i) => (
              <motion.div
                key={node.ref}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="flex items-center"
              >
                <div
                  className={cn(
                    "flex h-11 min-w-[2.75rem] items-center justify-center rounded-md border px-2 font-mono text-sm",
                    highlighted && i === 0
                      ? "border-accent bg-accent/20 text-white shadow-glow"
                      : "border-surface-border bg-surface-raised text-zinc-200",
                  )}
                >
                  {formatValue(node.val)}
                </div>
                {i < nodes.length - 1 && (
                  <span className="px-1 text-accent-soft">→</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <span className="px-1 text-xs text-zinc-600">{ll?.cyclic ? "↺" : "→ ∅"}</span>
        </div>
      )}
    </div>
  );
}
