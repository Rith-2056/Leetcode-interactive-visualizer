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
];
