import { cn } from "@ai-coo/ui";
import { AlertTriangle, Minus } from "lucide-react";
import type { ComputedStage, ComputedTransition } from "@/lib/funnels";
import { formatCount, formatRate } from "./funnel-format";

/**
 * El spine de 7 etapas con su conteo y la conversión entre etapas consecutivas.
 *
 * Distingue visualmente los tres estados de etapa, que significan cosas
 * distintas (§9.1):
 *  - salteada       → gris tenue, sin alerta. El embudo no la usa por diseño.
 *  - sin datos      → ámbar con icono. Falta instrumentación, no es un problema
 *                     de negocio.
 *  - medida         → normal.
 */
export function FunnelSpineStrip({
  stages,
  transitions,
}: {
  stages: ComputedStage[];
  transitions: ComputedTransition[];
}) {
  const rateBetween = (fromStageId: string) =>
    transitions.find((t) => t.fromStageId === fromStageId)?.rate ?? null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 dark:border-glass dark:bg-glass">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {stages.map((stage, index) => {
          const skipped = stage.state === "skipped";
          const noData = stage.state === "no_data";
          const rate = rateBetween(stage.stageId);
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.stageId} className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    skipped && "bg-muted text-muted-foreground/60",
                    noData && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    stage.state === "measured" && "bg-primary/15 text-primary"
                  )}
                >
                  {index + 1}
                </span>
                {noData ? (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                ) : null}
                {skipped ? (
                  <Minus className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                ) : null}
              </div>

              <p
                className={cn(
                  "mt-2 truncate text-sm font-medium",
                  skipped && "text-muted-foreground/60"
                )}
              >
                {stage.label}
              </p>

              <p
                className={cn(
                  "mt-0.5 text-lg font-semibold tabular-nums",
                  skipped && "text-muted-foreground/40",
                  noData && "text-amber-600 dark:text-amber-400"
                )}
              >
                {skipped ? "—" : formatCount(stage.count)}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {skipped
                  ? "no aplica"
                  : noData
                    ? "sin datos"
                    : !isLast && rate !== null
                      ? `${formatRate(rate)} a la siguiente`
                      : " "}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
