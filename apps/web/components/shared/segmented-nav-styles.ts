import { cn } from "@ai-coo/ui";

/** Contenedor tipo segmented control (mismo patrón que ProductViewToggle). */
export const segmentedNavContainerClass =
  "flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1 dark:border-white/10 dark:bg-white/5";

export function segmentedNavItemClass(active: boolean) {
  return cn(
    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
    active
      ? "bg-background text-foreground shadow-sm dark:bg-white/10 dark:text-white/90"
      : "text-muted-foreground hover:text-foreground"
  );
}
