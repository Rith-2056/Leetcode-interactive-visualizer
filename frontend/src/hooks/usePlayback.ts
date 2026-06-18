/**
 * Drives "video-like" playback over a list of immutable snapshots.
 *
 * Pure timeline logic: current step, play/pause, speed, and stepping. It never
 * touches the network or the visualizers, so it's trivially testable and
 * reusable. The animation clock uses setTimeout rescheduled per step so speed
 * changes take effect immediately without drift.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const SPEEDS = [0.25, 0.5, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];

const BASE_STEP_MS = 800; // duration of one step at 1x

export function usePlayback(totalSteps: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastIndex = Math.max(0, totalSteps - 1);
  const atEnd = step >= lastIndex;
  const atStart = step <= 0;

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const goTo = useCallback(
    (target: number) => {
      setStep(Math.min(Math.max(target, 0), lastIndex));
    },
    [lastIndex],
  );

  const next = useCallback(() => goTo(step + 1), [goTo, step]);
  const prev = useCallback(() => goTo(step - 1), [goTo, step]);
  const reset = useCallback(() => {
    setPlaying(false);
    setStep(0);
  }, []);

  const play = useCallback(() => {
    if (totalSteps === 0) return;
    // Replay from the start if we're already at the end.
    setStep((s) => (s >= totalSteps - 1 ? 0 : s));
    setPlaying(true);
  }, [totalSteps]);

  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);

  // The playback clock: advance one step on an interval scaled by speed.
  useEffect(() => {
    clear();
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => {
      setStep((s) => Math.min(s + 1, lastIndex));
    }, BASE_STEP_MS / speed);
    return clear;
  }, [playing, step, speed, atEnd, lastIndex]);

  // Reset to a clean state whenever the underlying trace changes length.
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [totalSteps]);

  const progress = useMemo(
    () => (totalSteps <= 1 ? 0 : step / (totalSteps - 1)),
    [step, totalSteps],
  );

  return {
    step,
    playing,
    speed,
    atStart,
    atEnd,
    progress,
    setSpeed,
    play,
    pause,
    toggle,
    next,
    prev,
    reset,
    goTo,
  };
}
