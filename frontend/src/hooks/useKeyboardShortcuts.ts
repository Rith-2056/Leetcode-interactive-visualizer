"use client";

import { useEffect } from "react";

export interface ShortcutHandlers {
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onRun: () => void;
}

/** True when focus is in a text field or the code editor — we stay out of the way. */
function isEditingContext(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    el.isContentEditable ||
    !!el.closest(".monaco-editor")
  );
}

/**
 * Global playback shortcuts: Space play/pause, ←/→ step, R reset, Enter run.
 * Disabled while typing so they never hijack the editor or input fields.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditingContext(e.target)) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          handlers.onToggle();
          break;
        case "ArrowRight":
          e.preventDefault();
          handlers.onNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlers.onPrev();
          break;
        case "r":
        case "R":
          handlers.onReset();
          break;
        case "Enter":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handlers.onRun();
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}
