"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

import { DURATION, EASE } from "./config";

/**
 * Fades + lifts an element into view whenever `deps` change. Used for panels
 * (mount) and for content that should re-announce itself on update (e.g. the
 * step explanation as playback advances).
 */
export function useEntrance<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    anime.remove(el);
    anime({
      targets: el,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: DURATION.base,
      easing: EASE,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
