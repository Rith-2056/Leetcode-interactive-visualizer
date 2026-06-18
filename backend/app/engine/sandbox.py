"""Lightweight sandboxing for user code.

This is defence-in-depth, NOT a security boundary on its own. It removes the
obvious footguns (filesystem, network, process, dynamic import/eval) and provides
a curated builtins set. For untrusted public deployment this MUST be paired with
OS-level isolation (subprocess + seccomp / container / gVisor) and resource
limits — see README "Security" for the hardening roadmap.
"""
from __future__ import annotations

import ast

# Builtins we expose to user code. Deliberately excludes open/exec/eval/input/
# __import__/compile/globals/locals/vars/getattr-by-name escapes.
_SAFE_BUILTIN_NAMES = (
    "abs", "all", "any", "bin", "bool", "bytearray", "bytes", "chr", "complex",
    "dict", "divmod", "enumerate", "filter", "float", "format", "frozenset",
    "hash", "hex", "int", "isinstance", "issubclass", "iter", "len", "list",
    "map", "max", "min", "next", "oct", "ord", "pow", "print", "range", "repr",
    "reversed", "round", "set", "slice", "sorted", "str", "sum", "tuple", "type",
    "zip", "True", "False", "None", "Exception", "ValueError", "TypeError",
    "IndexError", "KeyError", "StopIteration", "RuntimeError", "ZeroDivisionError",
)

# AST node names that we refuse to run at all.
_FORBIDDEN_NAMES = {
    "eval", "exec", "compile", "open", "input", "__import__", "globals",
    "locals", "vars", "getattr", "setattr", "delattr", "memoryview", "exit",
    "quit", "help", "breakpoint",
}

# A small, safe standard-library allowlist mounted as importable modules.
_ALLOWED_IMPORTS = {"math", "collections", "heapq", "itertools", "functools", "bisect", "string"}


class SandboxError(Exception):
    """Raised when user code uses a forbidden construct."""


def build_safe_builtins() -> dict[str, object]:
    import builtins

    safe: dict[str, object] = {}
    for name in _SAFE_BUILTIN_NAMES:
        if hasattr(builtins, name):
            safe[name] = getattr(builtins, name)
    # Required so user code can define its own classes (e.g. ListNode/TreeNode);
    # the `class` statement compiles to a __build_class__ call.
    safe["__build_class__"] = builtins.__build_class__
    safe["__name__"] = "__main__"
    safe["__import__"] = _guarded_import
    return safe


def _guarded_import(name, globals=None, locals=None, fromlist=(), level=0):  # noqa: A002
    root = name.split(".")[0]
    if root not in _ALLOWED_IMPORTS:
        raise SandboxError(f"Import of '{name}' is not allowed.")
    import importlib

    return importlib.import_module(name)


def validate(code: str) -> None:
    """Static AST scan that rejects forbidden names and attribute escapes.

    Raises SyntaxError (bad code) or SandboxError (disallowed construct).
    """
    tree = ast.parse(code)  # SyntaxError propagates to the caller.
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and node.id in _FORBIDDEN_NAMES:
            raise SandboxError(f"Use of '{node.id}' is not allowed.")
        # Block dunder attribute access used for sandbox escapes
        # (e.g. ().__class__.__bases__[0].__subclasses__()).
        if isinstance(node, ast.Attribute) and node.attr.startswith("__"):
            raise SandboxError(f"Access to '{node.attr}' is not allowed.")
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            module = node.names[0].name if isinstance(node, ast.Import) else (node.module or "")
            root = module.split(".")[0]
            if root not in _ALLOWED_IMPORTS:
                raise SandboxError(f"Import of '{module}' is not allowed.")
