"use client";

import { cn } from "@/ui/cn";

interface TestCasePanelProps {
  entrypoint: string;
  argsText: string;
  argsError: string | null;
  description: string;
  onEntrypoint: (value: string) => void;
  onArgs: (value: string) => void;
}

/**
 * Lets the user drive their own code: which function to call and the JSON
 * arguments to pass. Args are parsed by the parent; we surface the parse error
 * inline so invalid JSON is obvious before running.
 */
export function TestCasePanel({
  entrypoint,
  argsText,
  argsError,
  description,
  onEntrypoint,
  onArgs,
}: TestCasePanelProps) {
  return (
    <div className="space-y-3 rounded-xl border border-surface-border bg-surface/80 p-4 shadow-card backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Test Case
        </h2>
        <span className="truncate text-xs text-zinc-500">{description}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-zinc-500">Function</span>
          <input
            value={entrypoint}
            onChange={(e) => onEntrypoint(e.target.value)}
            spellCheck={false}
            placeholder="e.g. two_sum"
            className="rounded-lg border border-surface-border bg-bg-subtle px-3 py-1.5 font-mono text-sm text-zinc-100 focus:border-accent focus:outline-none"
          />
        </label>

        <label className="flex flex-[2] flex-col gap-1">
          <span className="text-xs text-zinc-500">Arguments (JSON array)</span>
          <input
            value={argsText}
            onChange={(e) => onArgs(e.target.value)}
            spellCheck={false}
            placeholder='e.g. [[2, 7, 11, 15], 9]'
            className={cn(
              "rounded-lg border bg-bg-subtle px-3 py-1.5 font-mono text-sm text-zinc-100 focus:outline-none",
              argsError ? "border-danger focus:border-danger" : "border-surface-border focus:border-accent",
            )}
          />
        </label>
      </div>

      {argsError && <p className="text-xs text-danger">{argsError}</p>}
    </div>
  );
}
