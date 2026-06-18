"""AST-based static analysis that maps each source line to a human explanation.

Run once before tracing. The tracer looks up `explain(lineno)` at every step and
combines this static description with runtime facts (which variables changed).
Keeping explanation generation separate from execution keeps the engine modular
and makes the descriptions deterministic and testable.
"""
from __future__ import annotations

import ast


class Explainer:
    """Pre-computes a one-line natural-language description for each statement."""

    def __init__(self, code: str) -> None:
        self._by_line: dict[int, str] = {}
        try:
            tree = ast.parse(code)
        except SyntaxError:
            # Caller handles syntax errors; leave the map empty.
            return
        self._visit(tree)

    def explain(self, lineno: int) -> str:
        return self._by_line.get(lineno, "Execute statement.")

    # --- internal -----------------------------------------------------------

    def _set(self, node: ast.AST, text: str) -> None:
        line = getattr(node, "lineno", None)
        if line is not None and line not in self._by_line:
            self._by_line[line] = text

    def _visit(self, node: ast.AST) -> None:
        for child in ast.walk(node):
            self._describe(child)

    def _describe(self, node: ast.AST) -> None:  # noqa: C901 - flat dispatch
        if isinstance(node, ast.FunctionDef):
            args = ", ".join(a.arg for a in node.args.args)
            self._set(node, f"Define function {node.name}({args}).")
        elif isinstance(node, ast.Return):
            self._set(node, f"Return {self._expr(node.value)}.")
        elif isinstance(node, ast.Assign):
            targets = ", ".join(self._expr(t) for t in node.targets)
            self._set(node, f"Assign {self._expr(node.value)} to {targets}.")
        elif isinstance(node, ast.AugAssign):
            op = self._op(node.op)
            self._set(node, f"Update {self._expr(node.target)} {op}= {self._expr(node.value)}.")
        elif isinstance(node, ast.For):
            self._set(node, f"Loop over {self._expr(node.iter)} as {self._expr(node.target)}.")
        elif isinstance(node, ast.While):
            self._set(node, f"While {self._expr(node.test)}.")
        elif isinstance(node, ast.If):
            self._set(node, f"Check if {self._expr(node.test)}.")
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            self._set(node, self._describe_call(node.value))
        elif isinstance(node, ast.Break):
            self._set(node, "Break out of the loop.")
        elif isinstance(node, ast.Continue):
            self._set(node, "Continue to the next iteration.")

    def _describe_call(self, call: ast.Call) -> str:
        # Method calls like stack.append(x) get domain-aware phrasing.
        if isinstance(call.func, ast.Attribute):
            obj = self._expr(call.func.value)
            method = call.func.attr
            arg = self._expr(call.args[0]) if call.args else ""
            verbs = {
                "append": f"Push {arg} onto {obj}.",
                "pop": f"Pop from {obj}.",
                "push": f"Push {arg} onto {obj}.",
                "add": f"Add {arg} to {obj}.",
                "popleft": f"Dequeue from {obj}.",
                "appendleft": f"Enqueue {arg} into {obj}.",
                "get": f"Look up {arg} in {obj}.",
            }
            if method in verbs:
                return verbs[method]
            return f"Call {obj}.{method}()."
        return f"Call {self._expr(call.func)}()."

    def _expr(self, node: ast.AST | None) -> str:
        """Best-effort short rendering of an expression for prose."""
        if node is None:
            return "None"
        try:
            text = ast.unparse(node)
        except Exception:
            return "value"
        return text if len(text) <= 40 else text[:37] + "..."

    @staticmethod
    def _op(op: ast.operator) -> str:
        return {
            ast.Add: "+",
            ast.Sub: "-",
            ast.Mult: "*",
            ast.Div: "/",
            ast.Mod: "%",
            ast.Pow: "**",
            ast.FloorDiv: "//",
        }.get(type(op), "?")
