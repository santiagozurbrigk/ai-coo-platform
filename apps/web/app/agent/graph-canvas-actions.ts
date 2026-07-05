"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getProductPageData } from "@/lib/product/queries";
import type { GraphData, GraphNodeInit, GraphEdgeInit } from "@/types/product";
import type { GraphProposal } from "@/types/agent";

const ENTITY_TYPE_TO_NODE_TYPE: Record<string, string> = {
  customer_avatar: "avatar",
  product: "product",
  value_ladder_step: "ladder-step",
  sales_framework: "framework",
  value_proposition: "proposition",
};

/**
 * Loads the current graph data and builds preview nodes for pending proposals,
 * returning the augmented GraphData and the set of pending node IDs.
 */
export async function getGraphDataForCanvasAction(
  _conversationId: string,
  pendingProposals: GraphProposal[]
): Promise<{ graphData: GraphData; pendingNodeIds: string[] }> {
  if (!isSupabaseConfigured()) {
    return { graphData: { nodes: [], edges: [] }, pendingNodeIds: [] };
  }

  // Auth guard — throws if not authenticated / no org
  await requireOrganizationId();

  let graphData: GraphData = { nodes: [], edges: [] };
  try {
    const pageData = await getProductPageData();
    graphData = pageData.graphData;
  } catch {
    // Return empty graph on error
  }

  if (pendingProposals.length === 0) {
    return { graphData, pendingNodeIds: [] };
  }

  const pendingNodeIds: string[] = [];

  // Place pending nodes below the existing graph
  const maxY = graphData.nodes.reduce(
    (acc, n) => Math.max(acc, n.position.y),
    0
  );
  const baseY = maxY + 200;

  const extraNodes: GraphNodeInit[] = [];
  const extraEdges: GraphEdgeInit[] = [];

  pendingProposals.forEach((proposal, idx) => {
    const nodeId = `proposal:${proposal.id}`;
    pendingNodeIds.push(nodeId);

    const nodeType = ENTITY_TYPE_TO_NODE_TYPE[proposal.entityType] ?? "product";
    const payload = proposal.payload;
    const label =
      typeof payload.name === "string"
        ? payload.name
        : typeof payload.avatar === "string"
          ? payload.avatar
          : "Propuesta";

    const sublabel =
      typeof payload.mainPain === "string"
        ? payload.mainPain
        : typeof payload.result === "string"
          ? `→ ${payload.result}`
          : proposal.action === "update"
            ? "Actualización propuesta"
            : "Nueva entidad propuesta";

    const x = 100 + idx * 220;
    const y = baseY;

    extraNodes.push({
      id: nodeId,
      type: nodeType,
      position: { x, y },
      data: {
        label,
        sublabel,
        href: "",
        pending: true,
      },
    });

    // Edge: if it's a CREATE, connect to root. If UPDATE, connect to existing node.
    if (proposal.action === "update" && proposal.entityId) {
      const existingNodeId = `${nodeType}:${proposal.entityId}`;
      const existsInGraph = graphData.nodes.some((n) => n.id === existingNodeId);
      if (existsInGraph) {
        extraEdges.push({
          id: `edge-proposal-${proposal.id}`,
          source: existingNodeId,
          target: nodeId,
        });
      } else {
        extraEdges.push({
          id: `edge-proposal-${proposal.id}`,
          source: "root",
          target: nodeId,
        });
      }
    } else {
      extraEdges.push({
        id: `edge-proposal-${proposal.id}`,
        source: "root",
        target: nodeId,
      });
    }
  });

  return {
    graphData: {
      nodes: [...graphData.nodes, ...extraNodes],
      edges: [...graphData.edges, ...extraEdges],
    },
    pendingNodeIds,
  };
}
