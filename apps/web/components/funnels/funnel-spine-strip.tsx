import { cn } from "@ai-coo/ui";
import { AlertTriangle, ChevronRight, Minus } from "lucide-react";
import type { ComputedStage, ComputedTransition } from "@/lib/funnels";
import { formatCount, formatRate } from "./funnel-format";

/**
 * El spine de 7 etapas, con el conteo de cada una y la conversión entre
 * consecutivas.
 *
 * ⭐ **Los tres estados de etapa se ven distinto porque significan cosas
 * distintas** (§9.1). Es la decisión visual central del módulo:
 *
 * | Estado | Se ve | Significa |
 * |---|---|---|
 * | `skipped` | gris tenue, sin alerta | el embudo no usa esa etapa **por diseño** |
 * | `no_data` | ámbar con icono | falta instrumentación, **no** es un problema de negocio |
 * | `measured` | normal | hay datos |
 *
 * Una etapa salteada no lleva alerta a propósito: el VSL no tiene Lead porque no
 * hay opt-in, y marcarlo como problema entrenaría al usuario a ignorar las
 * alertas de verdad.
 *
 * La conversión entre etapas se muestra **en el conector**, no dentro de la
 * tarjeta: pertenece al paso entre dos etapas, no a ninguna de las dos.
 */
export function FunnelSpineStrip({
  stages,
  transitions,
}: {
  stages: ComputedStage[];
  transitions: ComputedTransition[];
}) {
  const rateFrom = (stageId: string) =>
    transitions.find((t) => t.fromStageId === stageId)?.rate ?? null;

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Las siete etapas</h3>
        <p className="text-xs text-muted-foreground">
          Iguales en todos los embudos. Lo que cambia son los pasos que las llenan.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card p-5 dark:border-glass dark:bg-glass">
        <ol className="flex min-w-[900px] items-stretch gap-0">
          {stages.map((stage, index) => {
            const skipped = stage.state === "skipped";
            const noData = stage.state === "no_data";
            const isLast = index === stages.length - 1;
            const rate = rateFrom(stage.stageId);

            return (
              <li key={stage.stageId} className="flex min-w-0 flex-1 items-stretch">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
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
                      "mt-2 truncate text-xs font-medium",
                      skipped && "text-muted-foreground/60"
                    )}
                    title={stage.label}
                  >
                    {stage.label}
                  </p>

                  <p
                    className={cn(
                      "mt-1 text-2xl font-semibold tabular-nums",
                      skipped && "text-muted-foreground/40",
                      noData && "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {skipped ? "—" : formatCount(stage.count)}
                  </p>

                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {skipped ? "no aplica" : noData ? "sin datos" : " "}
                  </p>
                </div>

                {!isLast ? (
                  <div className="flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 px-1">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                    <span
                      className={cn(
                        "text-[11px] tabular-nums",
                        rate === null ? "text-muted-foreground/50" : "text-muted-foreground"
                      )}
                      title={rate === null ? "Sin datos suficientes para la tasa" : undefined}
                    >
                      {formatRate(rate)}
                    </span>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
