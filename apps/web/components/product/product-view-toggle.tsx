"use client";

import { LayoutList, Network } from "lucide-react";
import { cn } from "@ai-coo/ui";

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
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border p-1",
        isSpatial
          ? "border-white/8 bg-white/6"
          : "border-border bg-muted/40 dark:border-white/10 dark:bg-white/5"
      )}
    >
      <button
        type="button"
        onClick={() => onChange("spatial")}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all duration-150",
          isSpatial
            ? "bg-white/10 font-medium text-white/90"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Network className="h-3.5 w-3.5" />
        Vista espacial
      </button>
      <button
        type="button"
        onClick={() => onChange("detail")}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all duration-150",
          !isSpatial
            ? "bg-background font-medium text-foreground shadow-sm dark:bg-white/10 dark:text-white/90"
            : isSpatial
              ? "text-white/40 hover:text-white/65"
              : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutList className="h-3.5 w-3.5" />
        Vista detalle
      </button>
    </div>
  );
}
