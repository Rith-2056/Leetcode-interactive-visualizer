"""Engine tests — these exercise the core contract without the HTTP layer."""
from __future__ import annotations

from app.engine.tracer import execute


def _run(code: str, entrypoint=None, args=None, **kw):
    return execute(code, entrypoint, args or [], max_steps=kw.get("max_steps", 2000),
                   timeout_seconds=kw.get("timeout_seconds", 5.0))


def test_simple_assignment_produces_snapshots():
    res = _run("x = 1\ny = x + 2\n")
    assert res.success
    assert res.total_steps >= 2
    # Final snapshot should know about both variables.
    last = res.snapshots[-1]
    assert "x" in last.variables
    assert last.variables["y"].value == 3


def test_changed_variables_tracked():
    res = _run("a = 1\na = 2\nb = 3\n")
    assert res.success
    # The step that sets b should report b as changed, not a.
    changes = [s.changed_variables for s in res.snapshots]
    assert any("b" in c for c in changes)


def test_valid_brackets_entrypoint():
    code = (
        "def is_valid(s):\n"
        "    stack = []\n"
        "    pairs = {')': '(', ']': '[', '}': '{'}\n"
        "    for c in s:\n"
        "        if c in pairs:\n"
        "            if not stack or stack.pop() != pairs[c]:\n"
        "                return False\n"
        "        else:\n"
        "            stack.append(c)\n"
        "    return not stack\n"
    )
    res = _run(code, entrypoint="is_valid", args=["()[]{}"])
    assert res.success
    assert res.snapshots[-1].return_value is not None
    assert res.snapshots[-1].return_value.value is True


def test_call_stack_depth_for_recursion():
    code = (
        "def fact(n):\n"
        "    if n <= 1:\n"
        "        return 1\n"
        "    return n * fact(n - 1)\n"
    )
    res = _run(code, entrypoint="fact", args=[4])
    assert res.success
    max_depth = max(len(s.call_stack) for s in res.snapshots)
    assert max_depth >= 4  # fact(4) -> fact(3) -> fact(2) -> fact(1)


def test_explanations_present():
    res = _run("stack = []\nstack.append(1)\n")
    assert res.success
    texts = [s.explanation for s in res.snapshots]
    assert any("Push" in t for t in texts)


def test_syntax_error_is_reported():
    res = _run("def f(:\n  pass\n")
    assert not res.success
    assert "Syntax error" in res.error


def test_forbidden_open_blocked():
    res = _run("open('/etc/passwd')\n")
    assert not res.success
    assert "not allowed" in res.error


def test_dunder_escape_blocked():
    res = _run("().__class__\n")
    assert not res.success
    assert "not allowed" in res.error


def test_infinite_loop_times_out():
    res = _run("while True:\n    x = 1\n", max_steps=50)
    # Step-limit truncation kicks in well before the timeout.
    assert res.truncated or not res.success


def test_runtime_error_surfaced():
    res = _run("x = 1 / 0\n")
    assert not res.success
    assert "ZeroDivisionError" in res.error


def test_allowed_import_works():
    res = _run("import math\nx = math.gcd(12, 8)\n")
    assert res.success
    assert res.snapshots[-1].variables["x"].value == 4


def test_linked_list_serialized_as_chain():
    code = (
        "class ListNode:\n"
        "    def __init__(self, val=0, next=None):\n"
        "        self.val = val\n"
        "        self.next = next\n"
        "def build(vals):\n"
        "    head = None\n"
        "    for v in reversed(vals):\n"
        "        head = ListNode(v, head)\n"
        "    return head\n"
    )
    res = _run(code, entrypoint="build", args=[[1, 2, 3]])
    assert res.success
    ret = res.snapshots[-1].return_value
    assert ret is not None and ret.type == "ListNode"
    nodes = ret.value["nodes"]
    assert [n["val"]["value"] for n in nodes] == [1, 2, 3]
    assert ret.value["cyclic"] is False


def test_linked_list_cycle_detected():
    code = (
        "class ListNode:\n"
        "    def __init__(self, val=0, next=None):\n"
        "        self.val = val\n"
        "        self.next = next\n"
        "def make_cycle():\n"
        "    a = ListNode(1)\n"
        "    b = ListNode(2)\n"
        "    a.next = b\n"
        "    b.next = a\n"
        "    return a\n"
    )
    res = _run(code, entrypoint="make_cycle", args=[])
    assert res.success
    assert res.snapshots[-1].return_value.value["cyclic"] is True


def test_binary_tree_serialized_recursively():
    code = (
        "class TreeNode:\n"
        "    def __init__(self, val=0, left=None, right=None):\n"
        "        self.val = val\n"
        "        self.left = left\n"
        "        self.right = right\n"
        "def build():\n"
        "    return TreeNode(1, TreeNode(2), TreeNode(3))\n"
    )
    res = _run(code, entrypoint="build", args=[])
    assert res.success
    tree = res.snapshots[-1].return_value
    assert tree.type == "TreeNode"
    assert tree.value["val"]["value"] == 1
    assert tree.value["left"]["val"]["value"] == 2
    assert tree.value["right"]["val"]["value"] == 3
