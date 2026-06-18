"use client";

import type { SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { signatureOf, useStaggerChildren } from "@/animations";
import { cn } from "@/ui/cn";

interface StackViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

/**
 * Vertical stack visualization (LIFO). The top-of-stack is labelled and items
 * re-settle with a stagger as elements are pushed/popped.
 */
export function StackView({ name, value, highlighted }: StackViewProps) {
  const items = (value.value as SerializedValue[]) ?? [];
  // Render top-of-stack first (visually on top).
  const reversed = items.map((v, i) => ({ v, i })).reverse();
  const containerRef = useStaggerChildren<HTMLDivElement>(signatureOf(items.map(formatValue)));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <span className="text-xs text-zinc-500">stack · {items.length}</span>
      </div>
      <div ref={containerRef} className="flex flex-col items-center gap-1.5">
        {reversed.length === 0 && <span className="text-sm italic text-zinc-600">empty</span>}
        {reversed.map(({ v }, pos) => (
          <div
            key={`${pos}-${formatValue(v)}`}
            className={cn(
              "flex w-32 items-center justify-center rounded-md border px-3 py-2 font-mono text-sm transition-colors duration-300",
              pos === 0 && highlighted
                ? "border-accent bg-accent/20 text-zinc-100 shadow-glow"
                : "border-surface-border bg-surface-raised text-zinc-200",
            )}
          >
            {formatValue(v)}
            {pos === 0 && <span className="ml-2 text-[10px] uppercase text-accent-soft">top</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
