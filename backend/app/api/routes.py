"""HTTP routes. Thin adapter layer over the execution engine."""
from __future__ import annotations

from fastapi import APIRouter

from app.engine.tracer import execute
from app.models.schemas import ExecuteRequest, ExecuteResponse

router = APIRouter(prefix="/api", tags=["execution"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/execute", response_model=ExecuteResponse)
def execute_code(request: ExecuteRequest) -> ExecuteResponse:
    """Trace a snippet and return the full list of execution snapshots."""
    return execute(
        code=request.code,
        entrypoint=request.entrypoint,
        args=request.args,
        max_steps=request.max_steps,
        timeout_seconds=request.timeout_seconds,
    )
