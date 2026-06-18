/** Presentation helpers for serialized runtime values. */
import type { SerializedValue } from "@/types/execution";

/** Render a SerializedValue as a compact, human-readable string. */
export function formatValue(v: SerializedValue): string {
  switch (v.type) {
    case "None":
      return "None";
    case "bool":
      return v.value ? "True" : "False";
    case "str":
      return `"${v.value as string}"`;
    case "list":
    case "tuple": {
      const items = (v.value as SerializedValue[]) ?? [];
      const open = v.type === "list" ? "[" : "(";
      const close = v.type === "list" ? "]" : ")";
      return `${open}${items.map(formatValue).join(", ")}${close}`;
    }
    case "set": {
      const items = (v.value as SerializedValue[]) ?? [];
      return items.length ? `{${items.map(formatValue).join(", ")}}` : "set()";
    }
    case "dict": {
      const entries = (v.value as [SerializedValue, SerializedValue][]) ?? [];
      return `{${entries
        .map(([k, val]) => `${formatValue(k)}: ${formatValue(val)}`)
        .join(", ")}}`;
    }
    default:
      return String(v.value);
  }
}

/** A friendly label for the type column of the inspector. */
export function typeLabel(v: SerializedValue): string {
  return v.type;
}

/** True when a value is an array-like worth rendering as boxes. */
export function isArrayLike(v: SerializedValue): boolean {
  return v.type === "list" || v.type === "tuple";
}
