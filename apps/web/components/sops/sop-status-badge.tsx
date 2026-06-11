import { cn } from "@ai-coo/ui";
import type { SopStatus } from "@ai-coo/types";

const CONFIG: Record<
  SopStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "bg-emerald-900/30 text-emerald-400 border-emerald-500/30",
  },
  draft: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground border-border/40",
  },
  outdated: {
    label: "Desactualizado",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
};

export function SopStatusBadge({ status }: { status: SopStatus }) {
  const config = CONFIG[status];
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
