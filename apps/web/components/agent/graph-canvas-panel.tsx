"use client";

import "@xyflow/react/dist/style.css";

import { useEffect, useState } from "react";
import { X, GitFork, Loader2 } from "lucide-react";
import { getGraphDataForCanvasAction } from "@/app/agent/graph-canvas-actions";
import { ProductGraphView } from "@/components/product/graph-view";
import type { GraphData } from "@/types/product";
import type { GraphProposal } from "@/types/agent";

interface GraphCanvasPanelProps {
  conversationId: string;
  pendingProposals: GraphProposal[];
  onClose: () => void;
}

/**
 * Canvas panel that shows the business mental model graph,
 * with pending AI-proposed nodes highlighted (dashed border).
 */
export function GraphCanvasPanel({
  conversationId,
  pendingProposals,
  onClose,
}: GraphCanvasPanelProps) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [pendingNodeIds, setPendingNodeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const result = await getGraphDataForCanvasAction(
          conversationId,
          pendingProposals
        );
        if (cancelled) return;
        setGraphData(result.graphData);
        setPendingNodeIds(new Set(result.pendingNodeIds));
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId, pendingProposals]);

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-medium text-foreground">
            Grafo — vista previa
          </span>
          {pendingProposals.length > 0 && (
            <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-300">
              {pendingProposals.length} pendiente{pendingProposals.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Cerrar canvas"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : graphData ? (
          <ProductGraphView
            graphData={graphData}
            hasRealData={graphData.nodes.length > 0}
            readonly
            pendingNodeIds={pendingNodeIds}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No se pudo cargar el grafo del negocio.
          </p>
        )}
      </div>

      {pendingProposals.length > 0 && (
        <div className="shrink-0 border-t border-border bg-muted/40 px-4 py-2">
          <p className="text-xs text-muted-foreground">
            Los nodos con borde punteado son cambios propuestos. Aprobá o descartá cada propuesta en el chat.
          </p>
        </div>
      )}
    </div>
  );
}
