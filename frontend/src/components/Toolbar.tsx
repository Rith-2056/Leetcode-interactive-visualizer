"use client";

import { Button } from "@/ui/Button";
import { SAMPLE_PROBLEMS, type SampleProblem } from "@/lib/sampleProblems";

interface ToolbarProps {
  selectedId: string;
  loading: boolean;
  onSelectProblem: (problem: SampleProblem) => void;
  onRun: () => void;
}

/** Top bar: brand, problem picker, and the primary Run action. */
export function Toolbar({ selectedId, loading, onSelectProblem, onRun }: ToolbarProps) {
  return (
    <header className="flex items-center gap-4 border-b border-surface-border bg-surface/60 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-sm font-bold text-white shadow-glow">
          ƒ
        </div>
        <span className="text-sm font-semibold tracking-tight">AlgoVision</span>
      </div>

      <div className="ml-2 flex items-center gap-2">
        <label className="text-xs text-zinc-500">Problem</label>
        <select
          value={selectedId}
          onChange={(e) => {
            const problem = SAMPLE_PROBLEMS.find((p) => p.id === e.target.value);
            if (problem) onSelectProblem(problem);
          }}
          className="rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-sm text-zinc-200 focus:border-accent focus:outline-none"
        >
          {SAMPLE_PROBLEMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <Button variant="primary" size="md" className="ml-auto" onClick={onRun} disabled={loading}>
        {loading ? "Running…" : "▶ Run"}
      </Button>
    </header>
  );
}
