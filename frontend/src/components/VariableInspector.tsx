"use client";

import type { SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";
import { signatureOf, useStaggerChildren } from "@/animations";
import { cn } from "@/ui/cn";

interface VariableInspectorProps {
  variables: Record<string, SerializedValue>;
  changed: string[];
}

/** Live table of in-scope variables. Recently changed rows flash with accent. */
export function VariableInspector({ variables, changed }: VariableInspectorProps) {
  const entries = Object.entries(variables);
  const changedSet = new Set(changed);
  // Re-stagger rows only when the set of variable names changes.
  const bodyRef = useStaggerChildren<HTMLTableSectionElement>(
    signatureOf(entries.map(([n]) => n)),
    { fadeOnly: true },
  );

  if (entries.length === 0) {
    return <p className="text-sm text-zinc-500">No variables in scope yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-surface-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg-subtle text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-3 py-2 font-medium">Variable</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Value</th>
          </tr>
        </thead>
        <tbody ref={bodyRef}>
          {entries.map(([name, value]) => (
            <tr
              key={name}
              className={cn(
                "border-t border-surface-border transition-colors duration-500",
                changedSet.has(name) ? "bg-accent/20" : "bg-transparent",
              )}
            >
              <td className="px-3 py-2 font-mono font-medium text-accent-soft">{name}</td>
              <td className="px-3 py-2 font-mono text-xs text-zinc-500">{value.type}</td>
              <td className="max-w-[16rem] truncate px-3 py-2 font-mono text-zinc-200">
                {formatValue(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
