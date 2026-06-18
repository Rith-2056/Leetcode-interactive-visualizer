/** Curated starter problems so the visualizer is useful on first load. */

export interface SampleProblem {
  id: string;
  name: string;
  description: string;
  entrypoint: string;
  args: unknown[];
  code: string;
}

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: "valid-parentheses",
    name: "Valid Parentheses",
    description: "Stack-based bracket matching.",
    entrypoint: "is_valid",
    args: ["()[]{}"],
    code: `def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs:
            top = stack.pop() if stack else '#'
            if top != pairs[c]:
                return False
        else:
            stack.append(c)
    return not stack
`,
  },
  {
    id: "two-sum",
    name: "Two Sum",
    description: "Hash map lookup of complements.",
    entrypoint: "two_sum",
    args: [[2, 7, 11, 15], 9],
    code: `def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        need = target - nums[i]
        if need in seen:
            return [seen[need], i]
        seen[nums[i]] = i
    return []
`,
  },
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    description: "Array swaps with two indices.",
    entrypoint: "bubble_sort",
    args: [[5, 2, 9, 1, 7]],
    code: `def bubble_sort(nums):
    n = len(nums)
    for i in range(n):
        for j in range(0, n - i - 1):
            if nums[j] > nums[j + 1]:
                nums[j], nums[j + 1] = nums[j + 1], nums[j]
    return nums
`,
  },
  {
    id: "fibonacci",
    name: "Fibonacci (recursive)",
    description: "Recursion and the call stack.",
    entrypoint: "fib",
    args: [6],
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
`,
  },
  {
    id: "reverse-linked-list",
    name: "Reverse Linked List",
    description: "Pointer rewiring on a linked list.",
    entrypoint: "solve",
    args: [[1, 2, 3, 4, 5]],
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev

def solve(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return reverse_list(head)
`,
  },
  {
    id: "max-depth-tree",
    name: "Max Depth of Binary Tree",
    description: "Recursive DFS over a binary tree.",
    entrypoint: "solve",
    args: [[3, 9, 20, null, null, 15, 7]],
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def max_depth(root):
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

def solve(level_order):
    if not level_order:
        return 0
    nodes = [TreeNode(v) if v is not None else None for v in level_order]
    kids = nodes[1:]
    for node in nodes:
        if node is None:
            continue
        if kids:
            node.left = kids.pop(0)
        if kids:
            node.right = kids.pop(0)
    return max_depth(nodes[0])
`,
  },
];
