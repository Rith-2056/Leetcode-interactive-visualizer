"use client";

import type { Snapshot } from "@/types/execution";
import { useEntrance } from "@/animations";

interface ExecutionLogProps {
  snapshot: Snapshot | null;
}

/** The narration panel: explains what the current step does and why. */
export function ExecutionLog({ snapshot }: ExecutionLogProps) {
  // Re-announce the content as playback advances to the next step.
  const ref = useEntrance<HTMLDivElement>([snapshot?.step_number ?? -1]);

  if (!snapshot) {
    return <p className="text-sm text-zinc-500">Step explanations will appear here.</p>;
  }

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="rounded bg-surface-raised px-2 py-0.5 font-mono">
          line {snapshot.current_line}
        </span>
        <span className="rounded bg-surface-raised px-2 py-0.5 font-mono uppercase">
          {snapshot.event}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-zinc-100">{snapshot.explanation}</p>

      {snapshot.changed_variables.length > 0 && (
        <p className="text-xs text-zinc-400">
          Changed:{" "}
          {snapshot.changed_variables.map((v) => (
            <span key={v} className="mr-1 font-mono text-accent-soft">
              {v}
            </span>
          ))}
        </p>
      )}

      {snapshot.return_value && (
        <p className="text-xs text-success">
          returns <span className="font-mono">{String(snapshot.return_value.value)}</span>
        </p>
      )}

      {snapshot.stdout && (
        <pre className="max-h-28 overflow-auto rounded-lg bg-bg-subtle p-2 font-mono text-xs text-zinc-300">
          {snapshot.stdout}
        </pre>
      )}
    </div>
  );
}
