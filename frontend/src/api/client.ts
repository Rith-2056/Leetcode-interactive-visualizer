/**
 * Typed client for the execution API. The single network seam between the
 * frontend and backend — everything else consumes plain typed data.
 */
import type { ExecuteRequest, ExecuteResponse } from "@/types/execution";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export class ApiError extends Error {}

export async function executeCode(
  request: ExecuteRequest,
  signal?: AbortSignal,
): Promise<ExecuteResponse> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(
      "Could not reach the execution server. Is the backend running on :8000?",
    );
  }

  if (!response.ok) {
    throw new ApiError(`Server responded with ${response.status}.`);
  }

  return (await response.json()) as ExecuteResponse;
}
