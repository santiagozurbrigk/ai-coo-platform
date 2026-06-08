"use client";

import { LayoutList, Network } from "lucide-react";
import { cn } from "@ai-coo/ui";
import {
  segmentedNavContainerClass,
  segmentedNavItemClass,
} from "@/components/shared/segmented-nav-styles";

export type ProductViewMode = "spatial" | "detail";

export function ProductViewToggle({
  mode,
  onChange,
}: {
  mode: ProductViewMode;
  onChange: (mode: ProductViewMode) => void;
}) {
  const isSpatial = mode === "spatial";

  return (
    <div className={segmentedNavContainerClass}>
      <button
        type="button"
        onClick={() => onChange("spatial")}
        className={cn(segmentedNavItemClass(isSpatial), "inline-flex items-center gap-2")}
      >
        <Network className="h-3.5 w-3.5" />
        Vista espacial
      </button>
      <button
        type="button"
        onClick={() => onChange("detail")}
        className={cn(segmentedNavItemClass(!isSpatial), "inline-flex items-center gap-2")}
      >
        <LayoutList className="h-3.5 w-3.5" />
        Vista detalle
      </button>
    </div>
  );
}
