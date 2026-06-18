"use client";

import type { SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { signatureOf, useStaggerChildren } from "@/animations";
import { cn } from "@/ui/cn";

interface HashMapViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

/** Key→value pairs as cards; new keys stagger in as they're inserted. */
export function HashMapView({ name, value, highlighted }: HashMapViewProps) {
  const entries = (value.value as [SerializedValue, SerializedValue][]) ?? [];
  const containerRef = useStaggerChildren<HTMLDivElement>(
    signatureOf(entries.map(([k, v]) => `${formatValue(k)}:${formatValue(v)}`)),
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <span className="text-xs text-zinc-500">dict · {entries.length}</span>
      </div>
      <div ref={containerRef} className="flex flex-wrap gap-1.5">
        {entries.length === 0 && <span className="text-sm italic text-zinc-600">empty</span>}
        {entries.map(([k, v]) => (
          <div
            key={formatValue(k)}
            className={cn(
              "flex items-center overflow-hidden rounded-md border font-mono text-sm",
              highlighted ? "border-accent" : "border-surface-border",
            )}
          >
            <span className="bg-surface-raised px-2 py-1.5 text-accent-soft">{formatValue(k)}</span>
            <span className="bg-bg-subtle px-2 py-1.5 text-zinc-200">{formatValue(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
