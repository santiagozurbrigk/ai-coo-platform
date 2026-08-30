import { cn } from "@ai-coo/ui";
import { Info } from "lucide-react";
import { DECISIVE_RATIOS, getUniversalKpi, type ComputedMetric } from "@/lib/funnels";
import { formatFunnelValue, NO_DATA } from "./funnel-format";
import { CompositeSourceTag } from "./source-tag";

/**
 * Los KPIs universales de la sección 03 del documento.
 *
 * Van en su propio bloque y no mezclados con las métricas del embudo porque son
 * de otra naturaleza: el documento los pone **por encima de cualquier embudo**,
 * como la forma de compararlos entre sí. Un embudo nuevo no define sus propias
 * versiones de estos.
 *
 * ⭐ **Las dos ratios decisivas van primero y más grandes.** El documento cierra
 * la sección con esto, y es la jerarquía de lectura que pide:
 *
 *   "every funnel, whatever its shape, is judged on EPL vs CPL to know if it
 *    works and LTV vs CAC to know if it scales. The stage-by-stage tables tell
 *    you WHERE a funnel is broken; these two ratios tell you WHETHER it is."
 *
 * ⚠️ **No hay semáforo de salud.** El estado de salud (bandas de §04) está en
 * pausa por decisión del usuario: mostrar un número en verde o rojo es una
 * afirmación sobre el negocio, y esa afirmación todavía no se habilitó.
 */

/** De dónde sale cada KPI, para la etiqueta que el documento pide. */
const KPI_SOURCES: Record<string, string[]> = {
  cac: ["Meta", "Checkout"],
  roas_blended: ["Checkout", "Meta"],
  roas_by_source: ["Hyros"],
  epl: ["Checkout", "CRM"],
  epc: ["Checkout", "Meta"],
  cpl: ["Meta", "CRM"],
  aov: ["Checkout"],
  ltv: ["Checkout"],
  cash_collected_vs_contracted: ["Checkout"],
  ltv_cac_ratio: ["Checkout", "Meta"],
  epl_cpl_ratio: ["Checkout", "Meta", "CRM"],
};

export function FunnelKpiPanel({
  kpis,
  currency,
}: {
  kpis: ComputedMetric[];
  currency: string;
}) {
  const byId = new Map(kpis.map((k) => [k.metricId, k]));
  const decisive = DECISIVE_RATIOS.map((id) => byId.get(id)).filter(
    (k): k is ComputedMetric => Boolean(k)
  );
  const rest = kpis.filter(
    (k) => !(DECISIVE_RATIOS as readonly string[]).includes(k.metricId)
  );

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">KPIs universales</h3>
        <p className="text-xs text-muted-foreground">
          Misma fórmula en todos los embudos: es lo que los hace comparables.
        </p>
      </div>

      {/* Las dos ratios que el documento llama decisivas. */}
      <div className="grid gap-3 sm:grid-cols-2">
        {decisive.map((kpi) => {
          const definition = getUniversalKpi(kpi.metricId);
          return (
            <div
              key={kpi.metricId}
              className="rounded-2xl border border-primary/30 bg-primary/5 p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  {kpi.label}
                </p>
                <CompositeSourceTag parts={KPI_SOURCES[kpi.metricId] ?? []} />
              </div>
              <p
                className={cn(
                  "mt-2 text-3xl font-semibold tabular-nums",
                  kpi.value === null && "text-muted-foreground"
                )}
              >
                {formatFunnelValue(kpi.value, kpi.unit, currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {definition?.formula}
              </p>
              {kpi.value === null ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Falta alguno de sus insumos. Sin ellos no se puede calcular, y un
                  número aproximado acá llevaría a decidir mal.
                </p>
              ) : definition?.note ? (
                <p className="mt-2 text-xs text-muted-foreground">{definition.note}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((kpi) => {
          const definition = getUniversalKpi(kpi.metricId);
          return (
            <div
              key={kpi.metricId}
              className="rounded-2xl border border-border bg-card p-4 dark:border-glass dark:bg-glass"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 truncate text-xs text-muted-foreground">
                  {kpi.label}
                </p>
                <CompositeSourceTag parts={KPI_SOURCES[kpi.metricId] ?? []} />
              </div>
              <p
                className={cn(
                  "mt-1 text-xl font-semibold tabular-nums",
                  kpi.value === null && "text-muted-foreground"
                )}
              >
                {formatFunnelValue(kpi.value, kpi.unit, currency)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{definition?.formula}</p>
            </div>
          );
        })}
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          {NO_DATA} significa <strong>sin datos</strong>, no cero. Las dos ROAS usan
          medidas distintas a propósito: la general cruza el cobro de la pasarela con
          el gasto de Meta, la atribuida sale entera de Hyros. No tienen por qué
          coincidir.
        </span>
      </p>
    </section>
  );
}
