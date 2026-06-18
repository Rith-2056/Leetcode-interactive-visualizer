# AlgoVision — Interactive Algorithm Execution Visualizer

Paste Python, provide inputs, and **watch your algorithm execute one line at a
time** — a blend of NeetCode animations, Python Tutor, and a VS Code debugger
with a polished, premium UI.

> **Status: Phases 1–3 complete + a polished, intuitive UX layer.**
> End-to-end working: editor → sandboxed tracer → snapshot stream → animated
> playback. Visualizers for **arrays, stacks, hash maps, linked lists, binary
> trees, and graphs**; a live variable inspector, call stack, and per-step
> explanations. Custom test-case inputs, light/dark themes, keyboard shortcuts,
> and an in-app help guide.

---

## Architecture

The defining decision: **the execution engine is fully decoupled from the UI.**
The backend turns code into an immutable list of execution *snapshots*; the
frontend is a pure consumer that "plays" them like a video.

```
┌─────────────────────────┐         POST /api/execute        ┌──────────────────────────┐
│  Frontend (Next.js/TS)  │  ───────────────────────────▶   │   Backend (FastAPI)      │
│                         │                                  │                          │
│  Monaco editor          │     { snapshots: [ ... ] }       │  sandbox  → validate     │
│  Playback engine        │  ◀───────────────────────────   │  tracer   → settrace     │
│  Visualizers (animated) │                                  │  explainer→ AST analysis │
└─────────────────────────┘                                  │  serializer→ JSON-safe   │
                                                             └──────────────────────────┘
```

### Why `sys.settrace` + AST (not a hand-written interpreter)

The spec asks for an AST-based engine that never naively `exec()`s untrusted
code. Writing a full Python-in-Python interpreter is a multi-month effort and
the wrong tool for a production Phase 1. Instead — exactly like **Python
Tutor** — we:

1. **Statically analyse** the AST (`parser/explainer.py`) to pre-generate a
   human explanation for every line ("Push `c` onto `stack`", "Loop over `s`").
2. **Validate** the AST (`engine/sandbox.py`) to reject forbidden constructs
   *before* anything runs (no `open`/`eval`/`exec`/`__import__`, no dunder
   attribute escapes, import allow-list).
3. **Trace** execution under `sys.settrace` (`engine/tracer.py`), capturing an
   immutable `Snapshot` at every line: current line, locals, full call stack,
   stdout, and which variables changed.

Each snapshot matches a stable contract (`models/schemas.py`), mirrored exactly
by the frontend's `types/execution.ts`.

### Snapshot shape

```jsonc
{
  "step_number": 4,
  "current_line": 8,
  "event": "line",
  "variables": { "stack": { "type": "list", "value": [/* ... */] } },
  "changed_variables": ["stack"],
  "call_stack": [ { "function": "is_valid", "line": 8, "locals": { /* ... */ } } ],
  "stdout": "",
  "explanation": "Push c onto stack.",
  "return_value": null
}
```

---

## Project layout

```
backend/
  app/
    api/        FastAPI routes (thin adapter over the engine)
    engine/     tracer · sandbox · serializer   ← the core, UI-agnostic
    parser/     AST explainer
    models/     Pydantic schemas (the wire contract)
    main.py     app factory + CORS
  tests/        engine tests (no HTTP needed)

frontend/
  src/
    animations/   anime.js hooks: useEntrance · useStaggerChildren (+ tokens)
    api/          typed fetch client (single network seam)
    components/   editor, controls, test-case, help, panels, visualizers/
    hooks/        useExecution · usePlayback · useTheme · useKeyboardShortcuts
    lib/          sample problems
    types/        wire types mirroring the backend
    ui/           Button, Panel, cn primitives
    utils/        value formatting
    app/          Next.js App Router (layout, page, globals)
```

---

## Running locally

**Backend** (Python 3.11+):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # docs at http://localhost:8000/docs
pytest                                       # run the engine tests
```

**Frontend** (Node 18+):

```bash
cd frontend
cp .env.local.example .env.local             # points at http://localhost:8000
npm install
npm run dev                                  # http://localhost:3000
```

Pick a sample problem, edit the **Test Case** (function name + JSON args) or
paste your own Python, hit **Run**, and use the transport bar
(play/pause/step/scrub, 0.25×–4×).

**Keyboard shortcuts:** `Space` play/pause · `←/→` step · `R` reset ·
`⌘/Ctrl+Enter` run. Toggle light/dark with the ☀/☾ button; the `?` button opens
an in-app guide.

---

## Security posture

The sandbox (`engine/sandbox.py`) is **defence-in-depth, not a complete
boundary**. It blocks the obvious footguns (filesystem, network, dynamic
import/eval, dunder escapes), curates builtins, and enforces a step cap +
wall-clock timeout. **Before exposing this to untrusted public input it must be
paired with OS-level isolation** (subprocess + seccomp / container / gVisor)
and cgroup resource limits. That hardening is the first item on the Phase 4
backlog.

---

## Roadmap

- **Phase 1 ✅** Project setup · Monaco editor · playback controls · execution
  engine · live line highlighting.
- **Phase 2 ✅** Variable inspector · array, stack & hash-map visualizers ·
  call stack · per-step explanations.
- **Phase 3 ✅** Linked lists · binary trees · graphs (BFS/DFS-ready).
- **UX layer ✅** Custom test-case inputs · light/dark themes · keyboard
  shortcuts · in-app help · onboarding & error/truncation states.
- **Phase 4 (next)** OS-level sandbox hardening · multi-language (Java/C++/JS) ·
  AI explanations · accounts · shareable sessions · timeline virtualization ·
  swap/index & two-pointer/sliding-window overlays.
```
