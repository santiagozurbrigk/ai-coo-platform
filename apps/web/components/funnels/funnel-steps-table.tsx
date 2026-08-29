import { cn } from "@ai-coo/ui";
import { AlertTriangle } from "lucide-react";
import {
  getInstrumentationTool,
  getSpineStage,
  type ComputedFunnel,
  type FunnelTemplate,
} from "@/lib/funnels";
import type { StepProvenance } from "@/lib/funnels/resolve";
import { formatCount, formatFunnelValue } from "./funnel-format";

/**
 * Tabla de steps, con la misma estructura que la tabla del documento fuente:
 * etapa del spine, paso del embudo, métrica y rango sano.
 *
 * Suma dos columnas que el documento no tiene pero el software necesita: el
 * valor medido y de dónde salió. El documento pide etiquetar cada figura con su
 * fuente, y un step sin fuente configurada se marca como tal en vez de mostrar
 * un cero.
 */
export function FunnelStepsTable({
  template,
  computed,
  provenance,
  currency,
}: {
  template: FunnelTemplate;
  computed: ComputedFunnel;
  provenance: StepProvenance[];
  currency: string;
}) {
  const metricById = new Map(computed.metrics.map((m) => [m.metricId, m]));
  const provenanceByStep = new Map(provenance.map((p) => [p.stepId, p]));
  const countByStep = new Map(
    computed.stages.flatMap((stage) =>
      stage.stepIds.map((id) => [id, stage.stepIds[0] === id ? stage.count : null] as const)
    )
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card dark:border-glass dark:bg-glass">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Etapa
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Paso del embudo
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Métrica
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Valor
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Rango sano
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Origen
            </th>
          </tr>
        </thead>
        <tbody>
          {template.steps.map((step) => {
            const prov = provenanceByStep.get(step.id);
            const unbound = prov?.unbound ?? true;
            const tool = prov?.provenance ? getInstrumentationTool(prov.provenance) : null;

            return (
              <tr key={step.id} className="border-b border-border/60 last:border-b-0 align-top">
                <td className="px-4 py-3 font-medium text-primary">
                  {getSpineStage(step.stageId).label}
                </td>
                <td className="px-4 py-3">
                  <p>{step.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    {formatCount(countByStep.get(step.id) ?? null)} personas
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {step.metrics.map((metric) => (
                      <p key={metric.id} className="text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {step.metrics.map((metric) => {
                      const computedMetric = metricById.get(metric.id);
                      const value = computedMetric?.value ?? null;
                      return (
                        <p
                          key={metric.id}
                          className={cn(
                            "text-xs tabular-nums",
                            value === null && "text-muted-foreground"
                          )}
                        >
                          {formatFunnelValue(value, metric.unit, currency)}
                        </p>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                  {step.benchmarkLabel}
                </td>
                <td className="px-4 py-3 text-xs">
                  {unbound ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Sin fuente
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{tool?.label ?? "—"}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
