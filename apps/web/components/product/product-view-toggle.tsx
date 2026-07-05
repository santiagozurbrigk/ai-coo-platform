"use client";

import { LayoutList, Network, GitFork } from "lucide-react";
import { cn } from "@ai-coo/ui";
import {
  segmentedNavContainerClass,
  segmentedNavItemClass,
} from "@/components/shared/segmented-nav-styles";

export type ProductViewMode = "spatial" | "detail" | "graph";

export function ProductViewToggle({
  mode,
  onChange,
}: {
  mode: ProductViewMode;
  onChange: (mode: ProductViewMode) => void;
}) {
  return (
    <div className={segmentedNavContainerClass}>
      <button
        type="button"
        onClick={() => onChange("graph")}
        className={cn(segmentedNavItemClass(mode === "graph"), "inline-flex items-center gap-2")}
      >
        <GitFork className="h-3.5 w-3.5" />
        Grafo
      </button>
      <button
        type="button"
        onClick={() => onChange("spatial")}
        className={cn(segmentedNavItemClass(mode === "spatial"), "inline-flex items-center gap-2")}
      >
        <Network className="h-3.5 w-3.5" />
        Espacial
      </button>
      <button
        type="button"
        onClick={() => onChange("detail")}
        className={cn(segmentedNavItemClass(mode === "detail"), "inline-flex items-center gap-2")}
      >
        <LayoutList className="h-3.5 w-3.5" />
        Detalle
      </button>
    </div>
  );
}
