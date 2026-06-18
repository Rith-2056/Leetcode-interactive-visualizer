"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { SerializedValue } from "@/types/execution";
import { formatValue } from "@/utils/format";

interface HashMapViewProps {
  name: string;
  value: SerializedValue;
  highlighted: boolean;
}

/** Key→value pairs as animated cards; new keys fade/slide in on insertion. */
export function HashMapView({ name, value, highlighted }: HashMapViewProps) {
  const entries = (value.value as [SerializedValue, SerializedValue][]) ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-accent-soft">{name}</span>
        <span className="text-xs text-zinc-500">dict · {entries.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {entries.length === 0 && <span className="text-sm italic text-zinc-600">empty</span>}
        <AnimatePresence initial={false}>
          {entries.map(([k, v]) => (
            <motion.div
              key={formatValue(k)}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`flex items-center overflow-hidden rounded-md border font-mono text-sm ${
                highlighted ? "border-accent" : "border-surface-border"
              }`}
            >
              <span className="bg-surface-raised px-2 py-1.5 text-accent-soft">{formatValue(k)}</span>
              <span className="bg-bg-subtle px-2 py-1.5 text-zinc-200">{formatValue(v)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
