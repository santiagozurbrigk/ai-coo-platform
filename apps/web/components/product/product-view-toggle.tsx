"use client";

import { LayoutGrid, Map } from "lucide-react";
import { cn } from "@ai-coo/ui";

export type ProductViewMode = "spatial" | "detail";

export function ProductViewToggle({
  mode,
  onChange,
}: {
  mode: ProductViewMode;
  onChange: (mode: ProductViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        onClick={() => onChange("spatial")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          mode === "spatial"
            ? "bg-background text-foreground shadow-sm dark:bg-white/10"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Map className="h-3.5 w-3.5" />
        Vista espacial
      </button>
      <button
        type="button"
        onClick={() => onChange("detail")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          mode === "detail"
            ? "bg-background text-foreground shadow-sm dark:bg-white/10"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Vista detalle
      </button>
    </div>
  );
}
