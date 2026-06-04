"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductViewToggle, type ProductViewMode } from "./product-view-toggle";
import { ProductSpatialView } from "./spatial-view";
import { ProductDetailView } from "./detail-view";

export function ProductModule() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const [mode, setMode] = useState<ProductViewMode>(
    viewParam === "detail" ? "detail" : "spatial"
  );

  useEffect(() => {
    setMode(viewParam === "detail" ? "detail" : "spatial");
  }, [viewParam]);

  const handleModeChange = useCallback(
    (next: ProductViewMode) => {
      setMode(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "spatial") {
        params.delete("view");
      } else {
        params.set("view", "detail");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-muted-foreground">
          Mapa de avatares, ofertas y propuesta de valor — contexto que alimenta al Agente de
          negocio.
        </p>
        <ProductViewToggle mode={mode} onChange={handleModeChange} />
      </div>

      {mode === "spatial" ? <ProductSpatialView /> : <ProductDetailView />}
    </div>
  );
}
