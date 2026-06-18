/** Shared animation tokens so timing/easing stay consistent across the app. */
export const EASE = "easeOutCubic";
export const EASE_SPRING = "spring(1, 80, 12, 0)";

export const DURATION = {
  fast: 220,
  base: 340,
  slow: 520,
} as const;

export const STAGGER = 28; // ms between staggered children
