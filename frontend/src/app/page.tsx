"use client";

import { useEffect, useMemo, useState } from "react";

import { CallStackView } from "@/components/CallStackView";
import { CodeEditor } from "@/components/CodeEditor";
import { ExecutionLog } from "@/components/ExecutionLog";
import { PlaybackControls } from "@/components/PlaybackControls";
import { Toolbar } from "@/components/Toolbar";
import { VariableInspector } from "@/components/VariableInspector";
import { VisualizationPanel } from "@/components/VisualizationPanel";
import { useExecution } from "@/hooks/useExecution";
import { usePlayback } from "@/hooks/usePlayback";
import { SAMPLE_PROBLEMS, type SampleProblem } from "@/lib/sampleProblems";
import { Panel } from "@/ui/Panel";

export default function Home() {
  const [problem, setProblem] = useState<SampleProblem>(SAMPLE_PROBLEMS[0]);
  const [code, setCode] = useState<string>(SAMPLE_PROBLEMS[0].code);

  const { result, loading, error, run } = useExecution();
  const snapshots = useMemo(() => result?.snapshots ?? [], [result]);
  const playback = usePlayback(snapshots.length);

  const current = snapshots[playback.step] ?? null;
  const hasTrace = snapshots.length > 0;

  const handleSelect = (next: SampleProblem) => {
    setProblem(next);
    setCode(next.code);
  };

  const handleRun = () => {
    run({ code, entrypoint: problem.entrypoint, args: problem.args });
  };

  // Auto-play once a fresh, successful trace arrives.
  useEffect(() => {
    if (result?.success && result.snapshots.length > 0) {
      playback.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar
        selectedId={problem.id}
        loading={loading}
        onSelectProblem={handleSelect}
        onRun={handleRun}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-2">
        {/* Left column: editor + transport */}
        <div className="flex min-h-0 flex-col gap-4">
          <Panel title="Python" className="flex-1" bodyClassName="p-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              activeLine={current?.current_line ?? null}
              readOnly={playback.playing}
            />
          </Panel>

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
    </div>
  );
}
