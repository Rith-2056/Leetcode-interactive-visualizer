"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";

interface StackViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

/**
 * Vertical stack visualization. New elements slide in from the top (push) and
 * removed elements shrink away (pop) via AnimatePresence. The top-of-stack is
 * labelled so the LIFO nature is obvious.
 */
export function StackView({ name, value, highlighted }: StackViewProps) {
  const items = (value.value as SerializedValue[]) ?? [];
  // Render top-of-stack first (visually on top).
  const reversed = items.map((v, i) => ({ v, i })).reverse();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <span className="text-xs text-zinc-500">stack · {items.length}</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {reversed.length === 0 && (
            <span className="text-sm italic text-zinc-600">empty</span>
          )}
          {reversed.map(({ v, i }, pos) => (
            <motion.div
              key={`${i}-${formatValue(v)}`}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className={`flex w-32 items-center justify-center rounded-md border px-3 py-2 font-mono text-sm ${
                pos === 0 && highlighted
                  ? "border-accent bg-accent/20 text-white shadow-glow"
                  : "border-surface-border bg-surface-raised text-zinc-200"
              }`}
            >
              {formatValue(v)}
              {pos === 0 && (
                <span className="ml-2 text-[10px] uppercase text-accent-soft">top</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
