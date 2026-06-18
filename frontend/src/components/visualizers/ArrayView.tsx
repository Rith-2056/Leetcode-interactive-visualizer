"use client";

import type { SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { signatureOf, useStaggerChildren } from "@/animations";
import { cn } from "@/ui/cn";

interface ArrayViewProps {
  name: string;
  value: SerializedValue;
  /** True if this array was touched on the current step. */
  highlighted: boolean;
}

/** Renders a list/tuple as a row of indexed boxes; items re-settle on change. */
export function ArrayView({ name, value, highlighted }: ArrayViewProps) {
  const items = (value.value as SerializedValue[]) ?? [];
  const containerRef = useStaggerChildren<HTMLDivElement>(signatureOf(items.map(formatValue)));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <span className="text-xs text-zinc-500">{value.type}</span>
      </div>
      <div ref={containerRef} className="flex flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-sm italic text-zinc-600">empty</span>}
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-11 min-w-[2.75rem] items-center justify-center rounded-md border px-2 font-mono text-sm transition-colors duration-300",
                highlighted
                  ? "border-accent bg-accent/15 text-zinc-100"
                  : "border-surface-border bg-surface-raised text-zinc-200",
              )}
            >
              {formatValue(item)}
            </div>
            <span className="mt-1 font-mono text-[10px] text-zinc-600">{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
