import { Loader2 } from "lucide-react";
import { cn } from "@ai-coo/ui";

export function PageLoading({
  label = "Cargando…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin text-violet-400" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
