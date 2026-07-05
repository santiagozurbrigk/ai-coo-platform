"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type OnNodeDrag,
} from "@xyflow/react";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { saveGraphNodePositionAction } from "@/app/product/graph-positions";
import type { GraphData, GraphNodeData } from "@/types/product";
import { GRAPH_NODE_TYPES } from "./graph-nodes";

const DEFAULT_EDGE_OPTIONS = {
  type: "smoothstep",
  style: { stroke: "rgba(124,58,237,0.25)", strokeWidth: 1.5 },
  animated: false,
};

export function ProductGraphView({
  graphData,
  hasRealData,
}: {
  graphData: GraphData;
  hasRealData: boolean;
}) {
  const router = useRouter();
  const [nodes, , onNodesChange] = useNodesState(graphData.nodes as Node[]);
  const [edges, , onEdgesChange] = useEdgesState(graphData.edges);

  // Debounce save so rapid drags only fire one write
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNodeDragStop = useCallback<OnNodeDrag<Node>>(
    (_, node) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveGraphNodePositionAction(node.id, node.position.x, node.position.y);
      }, 400);
    },
    []
  );

  const handleNodeClick = useCallback(
    (_evt: React.MouseEvent, node: Node) => {
      const href = (node.data as GraphNodeData).href;
      if (href) router.push(href);
    },
    [router]
  );

  if (!hasRealData || nodes.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8" />}
        title="Sin datos de producto configurados"
        description="Agregá tu primer avatar y oferta para construir el mapa del negocio."
      />
    );
  }

  return (
    <div className="product-graph-canvas relative overflow-hidden rounded-xl border border-border/60 bg-background dark:bg-card/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={GRAPH_NODE_TYPES}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.25}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(124,58,237,0.10)"
        />
        <Controls
          showInteractive={false}
          className="!bottom-4 !left-4 !top-auto"
        />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "root":
                return "rgba(124,58,237,0.5)";
              case "avatar":
                return "rgba(59,130,246,0.5)";
              case "product":
                return "rgba(139,92,246,0.5)";
              case "ladder-step":
                return "rgba(16,185,129,0.5)";
              case "framework":
                return "rgba(249,115,22,0.5)";
              case "proposition":
                return "rgba(245,158,11,0.5)";
              default:
                return "rgba(100,100,100,0.3)";
            }
          }}
          className="!bottom-4 !right-4 !top-auto rounded-lg border border-border/40 bg-card shadow-sm"
          maskColor="rgba(0,0,0,0.05)"
        />
      </ReactFlow>
    </div>
  );
}
