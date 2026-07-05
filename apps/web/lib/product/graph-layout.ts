/**
 * Computes a simple top-down tree layout.
 *
 * Each node is placed so that its subtree width is evenly distributed.
 * Nodes without a stored position are assigned via this algorithm;
 * nodes that already have a saved position bypass it.
 */

export type LayoutTreeNode = {
  id: string;
  children: string[];
};

export function computeTreeLayout(
  treeNodes: LayoutTreeNode[],
  rootId: string,
  opts: { nodeWidth?: number; xGap?: number; yGap?: number } = {}
): Record<string, { x: number; y: number }> {
  const { nodeWidth = 200, xGap = 60, yGap = 200 } = opts;

  const byId = new Map(treeNodes.map((n) => [n.id, n]));
  const positions: Record<string, { x: number; y: number }> = {};

  function subtreeWidth(id: string): number {
    const node = byId.get(id);
    if (!node || node.children.length === 0) return nodeWidth;
    const childWidths = node.children.map((c) => subtreeWidth(c));
    const total = childWidths.reduce((a, b) => a + b, 0);
    const gaps = (node.children.length - 1) * xGap;
    return Math.max(nodeWidth, total + gaps);
  }

  function assign(id: string, left: number, width: number, depth: number): void {
    positions[id] = { x: left + width / 2 - nodeWidth / 2, y: depth * yGap };

    const node = byId.get(id);
    if (!node || node.children.length === 0) return;

    const childWidths = node.children.map((c) => subtreeWidth(c));
    const total = childWidths.reduce((a, b) => a + b, 0);
    const gaps = (node.children.length - 1) * xGap;

    let x = left + width / 2 - (total + gaps) / 2;
    for (let i = 0; i < node.children.length; i++) {
      assign(node.children[i]!, x, childWidths[i]!, depth + 1);
      x += childWidths[i]! + xGap;
    }
  }

  const rootWidth = subtreeWidth(rootId);
  assign(rootId, 0, rootWidth, 0);

  return positions;
}
