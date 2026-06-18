"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { StackFrame } from "@/types/execution";

interface CallStackViewProps {
  frames: StackFrame[];
}

/** Shows the active call stack, innermost frame highlighted. */
export function CallStackView({ frames }: CallStackViewProps) {
  if (frames.length === 0) {
    return <p className="text-sm text-zinc-500">Not currently inside a call.</p>;
  }
  // Innermost (current) frame on top.
  const ordered = [...frames].reverse();

  return (
    <div className="flex flex-col gap-1.5">
      <AnimatePresence initial={false}>
        {ordered.map((frame, i) => (
          <motion.div
            key={`${frame.function}-${frames.length - i}`}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-lg border px-3 py-2 ${
              i === 0
                ? "border-accent bg-accent/10"
                : "border-surface-border bg-surface-raised"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-zinc-100">
                {frame.function === "<module>" ? "module" : `${frame.function}()`}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">line {frame.line}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
