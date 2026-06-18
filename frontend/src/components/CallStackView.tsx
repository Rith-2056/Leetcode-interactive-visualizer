"use client";

import type { StackFrame } from "@/types/execution";
import { signatureOf, useStaggerChildren } from "@/animations";

interface CallStackViewProps {
  frames: StackFrame[];
}

/** Shows the active call stack, innermost frame highlighted. */
export function CallStackView({ frames }: CallStackViewProps) {
  // Innermost (current) frame on top.
  const ordered = [...frames].reverse();
  const containerRef = useStaggerChildren<HTMLDivElement>(
    signatureOf(ordered.map((f) => `${f.function}:${f.line}`)),
  );

  if (frames.length === 0) {
    return <p className="text-sm text-zinc-500">Not currently inside a call.</p>;
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      {ordered.map((frame, i) => (
        <div
          key={`${frame.function}-${frames.length - i}`}
          className={`rounded-lg border px-3 py-2 ${
            i === 0 ? "border-accent bg-accent/10" : "border-surface-border bg-surface-raised"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-zinc-100">
              {frame.function === "<module>" ? "module" : `${frame.function}()`}
            </span>
            <span className="font-mono text-[10px] text-zinc-500">line {frame.line}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
