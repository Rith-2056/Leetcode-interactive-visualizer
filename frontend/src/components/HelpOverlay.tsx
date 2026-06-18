"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/ui/Button";

interface HelpOverlayProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  "Pick a sample problem (or paste your own Python).",
  "Set the function to call and its JSON arguments in Test Case.",
  "Hit Run, then play, pause, step, or scrub through every line.",
];

const SHORTCUTS: [string, string][] = [
  ["Space", "Play / pause"],
  ["→ / ←", "Next / previous step"],
  ["R", "Reset to start"],
  ["⌘/Ctrl + Enter", "Run"],
];

/** A lightweight modal that explains the app and lists keyboard shortcuts. */
export function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">How AlgoVision works</h2>
              <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close">
                ✕
              </Button>
            </div>

            <ol className="mt-4 space-y-2">
              {STEPS.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Keyboard shortcuts
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SHORTCUTS.map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-sm text-zinc-300">
                  <kbd className="rounded-md border border-surface-border bg-bg-subtle px-2 py-0.5 font-mono text-xs">
                    {key}
                  </kbd>
                  <span className="text-zinc-400">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
