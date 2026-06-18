"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

import { DURATION, EASE, STAGGER } from "./config";

interface Options {
  /** CSS selector for the targets; defaults to direct children. */
  selector?: string;
  /** Fade only (no transform) — required for SVG <g> nodes to avoid shifting. */
  fadeOnly?: boolean;
}

/**
 * Re-runs a staggered entrance over a container's items whenever `signature`
 * changes. Callers pass a content hash as the signature so the animation fires
 * on structural change (push/pop/swap/insert) but not on unrelated steps.
 *
 * This is the workhorse behind the data-structure visualizers — it gives the
 * "items settle into place" feel without a per-frame physics simulation.
 */
export function useStaggerChildren<T extends Element>(signature: string, options: Options = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = options.selector
      ? el.querySelectorAll(options.selector)
      : (el.children as unknown as NodeListOf<Element>);
    if (!targets || targets.length === 0) return;

    anime.remove(targets);
    anime({
      targets,
      opacity: [0, 1],
      ...(options.fadeOnly
        ? {}
        : { translateY: [8, 0], scale: [0.9, 1] }),
      delay: anime.stagger(STAGGER),
      duration: options.fadeOnly ? DURATION.base : DURATION.fast,
      easing: EASE,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return ref;
}
