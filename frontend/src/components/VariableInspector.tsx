"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";

interface VariableInspectorProps {
  variables: Record<string, SerializedValue>;
  changed: string[];
}

/** Live table of in-scope variables. Recently changed rows flash with accent. */
export function VariableInspector({ variables, changed }: VariableInspectorProps) {
  const entries = Object.entries(variables);
  const changedSet = new Set(changed);

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
        <tbody>
          <AnimatePresence initial={false}>
            {entries.map(([name, value]) => {
              const isChanged = changedSet.has(name);
              return (
                <motion.tr
                  key={name}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    backgroundColor: isChanged ? "rgba(124,92,255,0.18)" : "rgba(0,0,0,0)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-surface-border"
                >
                  <td className="px-3 py-2 font-mono font-medium text-accent-soft">{name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-zinc-500">{value.type}</td>
                  <td className="max-w-[16rem] truncate px-3 py-2 font-mono text-zinc-200">
                    {formatValue(value)}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
