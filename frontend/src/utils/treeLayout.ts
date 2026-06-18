/** Compute pixel positions for a binary tree using classic in-order layout. */
import type { TreeNodeValue } from "@/types/execution";

export interface LaidOutNode {
  ref: string;
  label: string;
  x: number;
  y: number;
}

export interface LaidOutEdge {
  from: string;
  to: string;
}

export interface TreeLayout {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  width: number;
  height: number;
}

const H_GAP = 64; // horizontal spacing per in-order slot
const V_GAP = 72; // vertical spacing per depth level
const PAD = 32;

/**
 * In-order traversal assigns each node an increasing x slot, which guarantees
 * a non-overlapping left-to-right layout; depth maps to y. This is simple and
 * robust for the tree sizes we visualize (it can lean for skewed trees, which
 * is acceptable and even instructive).
 */
export function layoutTree(
  root: TreeNodeValue | null,
  labelOf: (n: TreeNodeValue) => string,
): TreeLayout {
  const nodes: LaidOutNode[] = [];
  const edges: LaidOutEdge[] = [];
  let slot = 0;
  let maxDepth = 0;

  const walk = (node: TreeNodeValue | null, depth: number) => {
    if (!node) return;
    walk(node.left, depth + 1);
    const x = PAD + slot * H_GAP;
    const y = PAD + depth * V_GAP;
    slot += 1;
    maxDepth = Math.max(maxDepth, depth);
    nodes.push({ ref: node.ref, label: labelOf(node), x, y });
    if (node.left) edges.push({ from: node.ref, to: node.left.ref });
    if (node.right) edges.push({ from: node.ref, to: node.right.ref });
    walk(node.right, depth + 1);
  };

  walk(root, 0);

  return {
    nodes,
    edges,
    width: PAD * 2 + Math.max(0, slot - 1) * H_GAP + 40,
    height: PAD * 2 + maxDepth * V_GAP + 40,
  };
}
