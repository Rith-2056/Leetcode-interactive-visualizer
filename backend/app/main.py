"""FastAPI application entrypoint.

Run locally with:  uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

app = FastAPI(
    title="AlgoVision Execution Engine",
    description="Traces code execution into immutable visualization snapshots.",
    version="0.1.0",
)

# The frontend dev server origin(s). Comma-separated env override for deploys.
_origins = os.getenv(
    "ALGOVISION_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "algovision", "docs": "/docs"}
