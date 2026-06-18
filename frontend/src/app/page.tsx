"use client";

import { useEffect, useMemo, useState } from "react";

import { CallStackView } from "@/components/CallStackView";
import { CodeEditor } from "@/components/CodeEditor";
import { ExecutionLog } from "@/components/ExecutionLog";
import { HelpOverlay } from "@/components/HelpOverlay";
import { PlaybackControls } from "@/components/PlaybackControls";
import { TestCasePanel } from "@/components/TestCasePanel";
import { Toolbar } from "@/components/Toolbar";
import { VariableInspector } from "@/components/VariableInspector";
import { VisualizationPanel } from "@/components/VisualizationPanel";
import { useExecution } from "@/hooks/useExecution";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePlayback } from "@/hooks/usePlayback";
import { useTheme } from "@/hooks/useTheme";
import { SAMPLE_PROBLEMS, type SampleProblem } from "@/lib/sampleProblems";
import { Panel } from "@/ui/Panel";

/** Parse the JSON args field, returning either the value or a friendly error. */
function parseArgs(text: string): { args: unknown[] | null; error: string | null } {
  if (text.trim() === "") return { args: [], error: null };
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return { args: null, error: "Arguments must be a JSON array." };
    return { args: parsed, error: null };
  } catch {
    return { args: null, error: "Invalid JSON." };
  }
}

export default function Home() {
  const { theme, toggle: toggleTheme } = useTheme();

  const [problem, setProblem] = useState<SampleProblem>(SAMPLE_PROBLEMS[0]);
  const [code, setCode] = useState<string>(SAMPLE_PROBLEMS[0].code);
  const [entrypoint, setEntrypoint] = useState<string>(SAMPLE_PROBLEMS[0].entrypoint);
  const [argsText, setArgsText] = useState<string>(JSON.stringify(SAMPLE_PROBLEMS[0].args));
  const [helpOpen, setHelpOpen] = useState(false);

  const { result, loading, error, run } = useExecution();
  const snapshots = useMemo(() => result?.snapshots ?? [], [result]);
  const playback = usePlayback(snapshots.length);

  const current = snapshots[playback.step] ?? null;
  const hasTrace = snapshots.length > 0;
  const { args, error: argsError } = useMemo(() => parseArgs(argsText), [argsText]);

  const handleSelect = (next: SampleProblem) => {
    setProblem(next);
    setCode(next.code);
    setEntrypoint(next.entrypoint);
    setArgsText(JSON.stringify(next.args));
  };

  const handleRun = () => {
    if (argsError) return;
    run({ code, entrypoint: entrypoint.trim() || null, args: args ?? [] });
  };

  useKeyboardShortcuts({
    onToggle: playback.toggle,
    onNext: playback.next,
    onPrev: playback.prev,
    onReset: playback.reset,
    onRun: handleRun,
  });

  // Auto-play once a fresh, successful trace arrives.
  useEffect(() => {
    if (result?.success && result.snapshots.length > 0) playback.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar
        selectedId={problem.id}
        loading={loading}
        theme={theme}
        onSelectProblem={handleSelect}
        onRun={handleRun}
        onToggleTheme={toggleTheme}
        onHelp={() => setHelpOpen(true)}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        {/* Left column: editor + inputs + transport */}
        <div className="flex min-h-0 flex-col gap-4">
          <Panel title="Python" className="flex-1" bodyClassName="p-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              activeLine={current?.current_line ?? null}
              readOnly={playback.playing}
              theme={theme}
            />
          </Panel>

          <TestCasePanel
            entrypoint={entrypoint}
            argsText={argsText}
            argsError={argsError}
            description={problem.description}
            onEntrypoint={setEntrypoint}
            onArgs={setArgsText}
          />

          <PlaybackControls
            playing={playback.playing}
            atStart={playback.atStart}
            atEnd={playback.atEnd}
            speed={playback.speed}
            step={playback.step}
            totalSteps={snapshots.length}
            progress={playback.progress}
            disabled={!hasTrace}
            onToggle={playback.toggle}
            onNext={playback.next}
            onPrev={playback.prev}
            onReset={playback.reset}
            onSpeed={playback.setSpeed}
            onScrub={playback.goTo}
          />

          {error && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          {result?.truncated && (
            <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
              Trace truncated at the step limit — only the first {snapshots.length} steps are shown.
            </div>
          )}
        </div>

        {/* Right column: visualization + inspection */}
        <div className="grid min-h-0 grid-rows-[1.2fr_1fr] gap-4">
          <Panel title="Visualization">
            <VisualizationPanel snapshot={current} />
          </Panel>

          <div className="grid min-h-0 grid-cols-2 gap-4">
            <Panel title="Variables" className="col-span-2 lg:col-span-1">
              <VariableInspector
                variables={current?.variables ?? {}}
                changed={current?.changed_variables ?? []}
              />
            </Panel>
            <div className="grid min-h-0 grid-rows-2 gap-4">
              <Panel title="Call Stack">
                <CallStackView frames={current?.call_stack ?? []} />
              </Panel>
              <Panel title="Explanation">
                <ExecutionLog snapshot={current} />
              </Panel>
            </div>
          </div>
        </div>
      </main>

      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
