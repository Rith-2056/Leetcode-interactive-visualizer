"""Pydantic request/response schemas for the execution API.

These are the public contract between the frontend and backend. Keep them
stable and additive — the frontend's TypeScript types mirror this shape.
"""
from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

Language = Literal["python"]


class ExecuteRequest(BaseModel):
    """Incoming request to trace a piece of code."""

    language: Language = "python"
    code: str = Field(..., max_length=20_000, description="User source code.")
    # Optional named function to invoke after defining the module. When set,
    # the engine calls `entrypoint(*args)` so LeetCode-style solutions can be
    # driven by custom inputs without the user writing a harness.
    entrypoint: Optional[str] = Field(
        default=None, description="Function name to call after module load."
    )
    # JSON-serialisable positional arguments for the entrypoint.
    args: list[Any] = Field(default_factory=list)
    # Safety caps. Bounded server-side regardless of what the client sends.
    max_steps: int = Field(default=2000, ge=1, le=10_000)
    timeout_seconds: float = Field(default=5.0, ge=0.1, le=15.0)


class SerializedValue(BaseModel):
    """A type-tagged, JSON-safe representation of a runtime value."""

    type: str
    # Inline value for primitives/containers, or a short repr for opaque objects.
    value: Any = None
    # Stable id for reference types so the frontend can render the heap / detect
    # aliasing. None for value types.
    ref: Optional[str] = None


class StackFrame(BaseModel):
    """One frame of the call stack at a given step."""

    function: str
    line: int
    locals: dict[str, SerializedValue]


class Snapshot(BaseModel):
    """An immutable point-in-time view of program execution."""

    step_number: int
    current_line: int
    event: Literal["call", "line", "return", "exception"]
    variables: dict[str, SerializedValue]
    changed_variables: list[str]
    call_stack: list[StackFrame]
    stdout: str
    explanation: str
    return_value: Optional[SerializedValue] = None


class ExecuteResponse(BaseModel):
    """Full trace result returned to the client."""

    success: bool
    snapshots: list[Snapshot]
    total_steps: int
    stdout: str
    # Populated when execution failed (syntax error, blocked operation, runtime
    # exception, timeout, or step-limit). The frontend surfaces this verbatim.
    error: Optional[str] = None
    truncated: bool = False
