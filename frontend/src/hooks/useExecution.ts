/**
 * Owns the request lifecycle for tracing code: loading, result, error.
 * Knows nothing about playback — it just turns source code into snapshots.
 */
import { useCallback, useRef, useState } from "react";

import { ApiError, executeCode } from "@/api/client";
import type { ExecuteResponse } from "@/types/execution";

interface ExecutionState {
  result: ExecuteResponse | null;
  loading: boolean;
  error: string | null;
}

export interface RunOptions {
  code: string;
  entrypoint?: string | null;
  args?: unknown[];
}

export function useExecution() {
  const [state, setState] = useState<ExecutionState>({
    result: null,
    loading: false,
    error: null,
  });
  // Abort an in-flight request if the user re-runs quickly.
  const inflight = useRef<AbortController | null>(null);

  const run = useCallback(async (options: RunOptions) => {
    inflight.current?.abort();
    const controller = new AbortController();
    inflight.current = controller;

    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await executeCode(
        {
          language: "python",
          code: options.code,
          entrypoint: options.entrypoint ?? null,
          args: options.args ?? [],
        },
        controller.signal,
      );
      setState({ result, loading: false, error: result.success ? null : result.error });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message =
        err instanceof ApiError ? err.message : "Unexpected error while executing.";
      setState({ result: null, loading: false, error: message });
    }
  }, []);

  const reset = useCallback(() => {
    inflight.current?.abort();
    setState({ result: null, loading: false, error: null });
  }, []);

  return { ...state, run, reset };
}
