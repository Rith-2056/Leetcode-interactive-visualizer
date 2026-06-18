/**
 * Wire types mirroring the backend `app.models.schemas` contract.
 *
 * Field names are snake_case to match the JSON emitted by Pydantic exactly —
 * this avoids a fragile case-mapping layer. UI-facing derived types live in
 * the components that consume them.
 */

export type ExecutionEvent = "call" | "line" | "return" | "exception";

/** A type-tagged, JSON-safe runtime value. */
export interface SerializedValue {
  type: string;
  value: unknown;
  ref: string | null;
}

export interface StackFrame {
  function: string;
  line: number;
  locals: Record<string, SerializedValue>;
}

/** One immutable point-in-time view of execution. */
export interface Snapshot {
  step_number: number;
  current_line: number;
  event: ExecutionEvent;
  variables: Record<string, SerializedValue>;
  changed_variables: string[];
  call_stack: StackFrame[];
  stdout: string;
  explanation: string;
  return_value: SerializedValue | null;
}

export interface ExecuteRequest {
  language: "python";
  code: string;
  entrypoint?: string | null;
  args?: unknown[];
  max_steps?: number;
  timeout_seconds?: number;
}

export interface ExecuteResponse {
  success: boolean;
  snapshots: Snapshot[];
  total_steps: number;
  stdout: string;
  error: string | null;
  truncated: boolean;
}
