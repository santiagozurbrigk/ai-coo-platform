"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MockPhaseBadge } from "./mock-phase-badge";
import { ProductRagSuggestButton } from "./product-rag-suggest";
import { ProductViewToggle, type ProductViewMode } from "./product-view-toggle";
import { ProductSpatialView } from "./spatial-view";
import { ProductGraphView } from "./graph-view";
import { ProductDetailView } from "./detail-view";
import { EmptyState } from "@/components/shared/empty-state";
import type { GraphData, ProductData, SpatialProductNode } from "@/types/product";

export function ProductModule({
  productData,
  spatialNodes,
  graphData,
  hasRealData,
  canEdit,
}: {
  productData: ProductData;
  spatialNodes: SpatialProductNode[];
  graphData: GraphData;
  hasRealData: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const [mode, setMode] = useState<ProductViewMode>(
    viewParam === "detail" ? "detail" : viewParam === "spatial" ? "spatial" : "graph"
  );

  useEffect(() => {
    setMode(
      viewParam === "detail" ? "detail" : viewParam === "spatial" ? "spatial" : "graph"
    );
  }, [viewParam]);

  const handleModeChange = useCallback(
    (next: ProductViewMode) => {
      setMode(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "graph") {
        params.delete("view");
      } else {
        params.set("view", next);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="flex min-h-0 h-full flex-col">
      {/* Header row — fijo en alto natural */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="space-y-2">
          <p className="max-w-xl text-sm text-muted-foreground">
            Mapa de avatares, ofertas y propuesta de valor — contexto que alimenta al Agente de
            negocio.
          </p>
          <MockPhaseBadge hasRealData={hasRealData} />
          <ProductRagSuggestButton
            hasRealData={hasRealData}
            canEdit={canEdit}
            onSaved={refresh}
          />
        </div>
        <ProductViewToggle mode={mode} onChange={handleModeChange} />
      </div>

      {/* Content — grafo llena el resto; Espacial/Detalle son scrollables */}
      {mode === "graph" ? (
        <div className="product-graph-fill">
          <ProductGraphView graphData={graphData} hasRealData={hasRealData} />
        </div>
      ) : mode === "spatial" ? (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <ProductSpatialView nodes={spatialNodes} hasRealData={hasRealData} />
        </div>
      ) : !hasRealData ? (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <EmptyState
            title="Sin datos de producto configurados"
            description="Agregá tu primer avatar y oferta en la vista detalle para construir tu mapa de producto."
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <ProductDetailView
            productData={productData}
            hasRealData={hasRealData}
            canEdit={canEdit}
            onUpdated={refresh}
          />
        </div>
      )}
    </div>
  );
}
