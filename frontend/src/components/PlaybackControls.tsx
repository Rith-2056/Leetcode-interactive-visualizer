"use client";

import { Button } from "@/ui/Button";
import { SPEEDS, type Speed } from "@/hooks/usePlayback";
import { cn } from "@/ui/cn";

interface PlaybackControlsProps {
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  speed: Speed;
  step: number;
  totalSteps: number;
  progress: number;
  disabled: boolean;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSpeed: (s: Speed) => void;
  onScrub: (step: number) => void;
}

/** The transport bar: reset / prev / play-pause / next, speed, and a scrubber. */
export function PlaybackControls(props: PlaybackControlsProps) {
  const { playing, atStart, atEnd, disabled, step, totalSteps } = props;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface/80 px-4 py-3 shadow-card backdrop-blur">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={props.onReset} disabled={disabled} aria-label="Reset">
          ⏮
        </Button>
        <Button size="icon" variant="ghost" onClick={props.onPrev} disabled={disabled || atStart} aria-label="Previous step">
          ◀
        </Button>
        <Button
          size="icon"
          variant="primary"
          onClick={props.onToggle}
          disabled={disabled || (atEnd && !playing && totalSteps <= 1)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶"}
        </Button>
        <Button size="icon" variant="ghost" onClick={props.onNext} disabled={disabled || atEnd} aria-label="Next step">
          ▶
        </Button>

        <div className="ml-2 flex items-center gap-1 rounded-lg bg-bg-subtle p-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => props.onSpeed(s)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                props.speed === s ? "bg-accent text-white" : "text-zinc-400 hover:text-white",
              )}
            >
              {s}x
            </button>
          ))}
        </div>

        <span className="ml-auto font-mono text-xs text-zinc-400">
          {totalSteps === 0 ? "0 / 0" : `${step + 1} / ${totalSteps}`}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, totalSteps - 1)}
        value={step}
        disabled={disabled || totalSteps === 0}
        onChange={(e) => props.onScrub(Number(e.target.value))}
        className="av-scrubber"
        aria-label="Timeline scrubber"
        style={{ ["--progress" as string]: `${props.progress * 100}%` }}
      />
    </div>
  );
}
