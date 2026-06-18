export { useEntrance } from "./useEntrance";
export { useStaggerChildren } from "./useStaggerChildren";
export { DURATION, EASE, STAGGER } from "./config";

/** Shorthand to build a stable content signature for stagger triggers. */
export function signatureOf(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
