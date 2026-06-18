"""The execution engine: produce an immutable list of snapshots from user code.

Strategy (documented in README): we compile the user code in a sandboxed
namespace and run it under `sys.settrace`. At every executed line we capture a
Snapshot — current line, the active frame's locals, the full user call stack,
captured stdout, and a static explanation enriched with the variables that
changed since the previous step.

This file is intentionally UI-agnostic. It knows nothing about React; it only
emits the snapshot contract from app.models.schemas.
"""
from __future__ import annotations

import io
import sys
import threading
from contextlib import redirect_stdout
from types import FrameType
from typing import Any, Optional

from app.engine.sandbox import SandboxError, build_safe_builtins, validate
from app.engine.serializer import serialize, serialize_namespace
from app.models.schemas import (
    ExecuteResponse,
    Snapshot,
    StackFrame,
)
from app.parser.explainer import Explainer

# Internal sentinel filename so the trace function only reacts to user code,
# never to library internals it might step into.
_USER_FILENAME = "<user_code>"


class _StepLimitReached(Exception):
    """Raised internally to abort tracing once max_steps is hit."""


class Tracer:
    """Runs one program and accumulates its execution snapshots."""

    def __init__(self, code: str, max_steps: int) -> None:
        self._code = code
        self._max_steps = max_steps
        self._explainer = Explainer(code)
        self._snapshots: list[Snapshot] = []
        self._stdout = io.StringIO()
        self._prev_vars: dict[str, Any] = {}
        self._truncated = False

    # --- public -------------------------------------------------------------

    def run(self, entrypoint: Optional[str], args: list[Any]) -> tuple[list[Snapshot], bool]:
        compiled = compile(self._code, _USER_FILENAME, "exec")
        namespace: dict[str, Any] = {
            "__builtins__": build_safe_builtins(),
            "__name__": "__main__",
        }

        sys.settrace(self._trace)
        try:
            with redirect_stdout(self._stdout):
                exec(compiled, namespace)  # noqa: S102 - sandboxed namespace, see sandbox.py
                if entrypoint:
                    func = namespace.get(entrypoint)
                    if not callable(func):
                        raise SandboxError(f"Entrypoint '{entrypoint}' is not a function.")
                    result = func(*args)
                    self._record_return(result)
        except _StepLimitReached:
            self._truncated = True
        finally:
            sys.settrace(None)

        return self._snapshots, self._truncated

    @property
    def stdout(self) -> str:
        return self._stdout.getvalue()

    # --- tracing ------------------------------------------------------------

    def _trace(self, frame: FrameType, event: str, arg: Any):
        # Only trace frames that belong to user code.
        if frame.f_code.co_filename != _USER_FILENAME:
            return self._trace
        if event in ("line", "call", "return"):
            self._capture(frame, event, arg)
        return self._trace

    def _capture(self, frame: FrameType, event: str, arg: Any) -> None:
        if len(self._snapshots) >= self._max_steps:
            raise _StepLimitReached

        local_vars = serialize_namespace(frame.f_locals)
        changed = self._diff(frame.f_locals)

        return_value = serialize(arg) if event == "return" else None

        self._snapshots.append(
            Snapshot(
                step_number=len(self._snapshots),
                current_line=frame.f_lineno,
                event=event,  # type: ignore[arg-type]
                variables=local_vars,
                changed_variables=changed,
                call_stack=self._build_call_stack(frame),
                stdout=self._stdout.getvalue(),
                explanation=self._explainer.explain(frame.f_lineno),
                return_value=return_value,
            )
        )

    def _build_call_stack(self, frame: FrameType) -> list[StackFrame]:
        """Walk f_back from the current frame down to the module level."""
        stack: list[StackFrame] = []
        current: Optional[FrameType] = frame
        while current is not None:
            if current.f_code.co_filename == _USER_FILENAME:
                stack.append(
                    StackFrame(
                        function=current.f_code.co_name,
                        line=current.f_lineno,
                        locals=serialize_namespace(current.f_locals),
                    )
                )
            current = current.f_back
        stack.reverse()  # outermost (module) first, current frame last
        return stack

    def _diff(self, current_locals: dict[str, Any]) -> list[str]:
        """Names whose serialized value differs from the previous snapshot."""
        changed: list[str] = []
        for name, value in current_locals.items():
            if name.startswith("__"):
                continue
            try:
                repr_now = repr(value)
            except Exception:
                repr_now = id(value)
            if self._prev_vars.get(name) != repr_now:
                changed.append(name)
            self._prev_vars[name] = repr_now
        return changed

    def _record_return(self, result: Any) -> None:
        """Append a synthetic final snapshot carrying the entrypoint result."""
        if not self._snapshots:
            return
        last = self._snapshots[-1]
        self._snapshots.append(
            last.model_copy(
                update={
                    "step_number": len(self._snapshots),
                    "event": "return",
                    "changed_variables": [],
                    "explanation": "Return final result.",
                    "return_value": serialize(result),
                    "stdout": self._stdout.getvalue(),
                }
            )
        )


def execute(
    code: str,
    entrypoint: Optional[str],
    args: list[Any],
    max_steps: int,
    timeout_seconds: float,
) -> ExecuteResponse:
    """Validate, then trace user code with a hard wall-clock timeout.

    The trace runs on a worker thread so we can abandon it if it overruns. We
    cannot force-kill a thread in CPython, but settrace lets us request an abort
    via the step counter; the timeout primarily guards against C-level blocking,
    which the sandbox already forbids (no I/O / sleeping APIs are exposed).
    """
    # Phase 1: reject forbidden constructs before running anything.
    try:
        validate(code)
    except SyntaxError as exc:
        return _error(f"Syntax error: {exc.msg} (line {exc.lineno}).")
    except SandboxError as exc:
        return _error(str(exc))

    tracer = Tracer(code, max_steps)
    result: dict[str, Any] = {}

    def _worker() -> None:
        try:
            snapshots, truncated = tracer.run(entrypoint, args)
            result["snapshots"] = snapshots
            result["truncated"] = truncated
        except SandboxError as exc:
            result["error"] = str(exc)
        except Exception as exc:  # surface runtime errors to the user
            result["error"] = f"{type(exc).__name__}: {exc}"

    thread = threading.Thread(target=_worker, daemon=True)
    thread.start()
    thread.join(timeout_seconds)

    if thread.is_alive():
        return _error(
            f"Execution timed out after {timeout_seconds}s. "
            "Check for an infinite loop."
        )

    if "error" in result:
        # Still return any snapshots gathered before the error for context.
        return ExecuteResponse(
            success=False,
            snapshots=tracer._snapshots,  # noqa: SLF001 - same package, intentional
            total_steps=len(tracer._snapshots),
            stdout=tracer.stdout,
            error=result["error"],
            truncated=tracer._truncated,
        )

    snapshots: list[Snapshot] = result.get("snapshots", [])
    return ExecuteResponse(
        success=True,
        snapshots=snapshots,
        total_steps=len(snapshots),
        stdout=tracer.stdout,
        truncated=result.get("truncated", False),
    )


def _error(message: str) -> ExecuteResponse:
    return ExecuteResponse(
        success=False, snapshots=[], total_steps=0, stdout="", error=message
    )
