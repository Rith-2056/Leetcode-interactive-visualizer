"""Convert live Python runtime values into JSON-safe, type-tagged snapshots.

The frontend never sees raw Python objects — only the shape produced here.
Serialization is bounded in depth and width so a pathological structure (deep
recursion, huge list) can't blow up the payload or the response time.
"""
from __future__ import annotations

from typing import Any

from app.models.schemas import SerializedValue

# Limits keep payloads small and rendering predictable.
_MAX_DEPTH = 6
_MAX_ITEMS = 100
_MAX_STR = 200

_PRIMITIVES = (int, float, bool, str, type(None))


def _ref(obj: Any) -> str:
    """Stable identity key for a reference-type object (used for aliasing)."""
    return f"0x{id(obj):x}"


def serialize(value: Any, _depth: int = 0) -> SerializedValue:
    """Recursively serialize a single value into a SerializedValue."""
    # Order matters: bool is an int subclass, so it's handled by the explicit
    # type checks below rather than the int branch.
    if value is None:
        return SerializedValue(type="None", value=None)
    if isinstance(value, bool):
        return SerializedValue(type="bool", value=value)
    if isinstance(value, int):
        return SerializedValue(type="int", value=value)
    if isinstance(value, float):
        # JSON can't represent inf/nan — fall back to a string form.
        if value != value or value in (float("inf"), float("-inf")):
            return SerializedValue(type="float", value=str(value))
        return SerializedValue(type="float", value=value)
    if isinstance(value, str):
        truncated = value[:_MAX_STR]
        return SerializedValue(type="str", value=truncated)

    if _depth >= _MAX_DEPTH:
        return SerializedValue(type="...", value="<max depth>")

    if isinstance(value, (list, tuple)):
        items = [serialize(v, _depth + 1) for v in value[:_MAX_ITEMS]]
        return SerializedValue(
            type="list" if isinstance(value, list) else "tuple",
            value=[i.model_dump() for i in items],
            ref=_ref(value),
        )

    if isinstance(value, set):
        items = [serialize(v, _depth + 1) for v in list(value)[:_MAX_ITEMS]]
        return SerializedValue(
            type="set",
            value=[i.model_dump() for i in items],
            ref=_ref(value),
        )

    if isinstance(value, dict):
        entries = []
        for k, v in list(value.items())[:_MAX_ITEMS]:
            entries.append(
                [serialize(k, _depth + 1).model_dump(), serialize(v, _depth + 1).model_dump()]
            )
        return SerializedValue(type="dict", value=entries, ref=_ref(value))

    # Common LeetCode helper classes get structured handling so the frontend can
    # render linked lists / trees. We detect by attribute shape, not by import,
    # so any class with the conventional fields works.
    cls = type(value).__name__
    if hasattr(value, "val") and hasattr(value, "next"):
        return _serialize_linked_list(value)
    if hasattr(value, "val") and (hasattr(value, "left") or hasattr(value, "right")):
        return _serialize_tree(value)

    return SerializedValue(type=cls, value=_safe_repr(value), ref=_ref(value))


def _serialize_linked_list(head: Any) -> SerializedValue:
    """Walk the `.next` chain into a flat node list, detecting cycles."""
    nodes: list[dict[str, Any]] = []
    seen: set[str] = set()
    cyclic = False
    current = head
    while current is not None and len(nodes) < _MAX_ITEMS:
        ref = _ref(current)
        if ref in seen:
            cyclic = True
            break
        seen.add(ref)
        nodes.append(
            {"ref": ref, "val": serialize(getattr(current, "val", None), _MAX_DEPTH).model_dump()}
        )
        current = getattr(current, "next", None)
    return SerializedValue(
        type="ListNode", ref=_ref(head), value={"nodes": nodes, "cyclic": cyclic}
    )


def _serialize_tree(root: Any) -> SerializedValue:
    """Recursively serialize a binary tree, bounded by depth and visited set."""

    def walk(node: Any, depth: int, seen: set[str]) -> Any:
        if node is None or depth > _MAX_DEPTH:
            return None
        ref = _ref(node)
        if ref in seen:  # guard against malformed cyclic "trees"
            return None
        seen.add(ref)
        return {
            "ref": ref,
            "val": serialize(getattr(node, "val", None), _MAX_DEPTH).model_dump(),
            "left": walk(getattr(node, "left", None), depth + 1, seen),
            "right": walk(getattr(node, "right", None), depth + 1, seen),
        }

    return SerializedValue(type="TreeNode", ref=_ref(root), value=walk(root, 0, set()))


def _safe_repr(value: Any) -> str:
    try:
        text = repr(value)
    except Exception:  # repr can raise for misbehaving objects
        text = f"<{type(value).__name__}>"
    return text[:_MAX_STR]


# Names that are module/builtin noise rather than user variables.
def serialize_namespace(namespace: dict[str, Any]) -> dict[str, SerializedValue]:
    """Serialize a frame's locals, skipping internal / non-data names."""
    result: dict[str, SerializedValue] = {}
    for name, value in namespace.items():
        if name.startswith("__"):
            continue
        if callable(value) and not isinstance(value, _PRIMITIVES):
            # Skip functions/classes — they're code, not inspectable state.
            if isinstance(value, type) or hasattr(value, "__call__"):
                continue
        result[name] = serialize(value)
    return result
