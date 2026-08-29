import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { PageHeader } from "@/components/shared/page-header";
import { FunnelSpineStrip } from "@/components/funnels/funnel-spine-strip";
import { FunnelStepsTable } from "@/components/funnels/funnel-steps-table";
import { formatFunnelValue } from "@/components/funnels/funnel-format";
import { getFunnelAction } from "@/app/funnels/actions";
import {
  FUNNEL_PERIOD_PRESETS,
  DEFAULT_PERIOD_PRESET,
  isPeriodPresetId,
  getInstrumentationTool,
} from "@/lib/funnels";
import { paths } from "@/routes/paths";

/**
 * Detalle de un embudo.
 *
 * Página GENÉRICA: renderiza cualquier plantilla. Si al agregar un tipo de
 * embudo hiciera falta tocar este archivo, la arquitectura falló
 * (docs/FUNNELS_ARCHITECTURE.md §0).
 *
 * El período va como query param para que se preserve al cambiar de embudo:
 * comparar la misma ventana entre embudos es el trabajo real del usuario.
 */
export default async function FunnelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ funnelId: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const { funnelId } = await params;
  const { period: periodParam } = await searchParams;

  const presetId =
    periodParam && isPeriodPresetId(periodParam) ? periodParam : DEFAULT_PERIOD_PRESET;

  const data = await getFunnelAction(funnelId, presetId);
  if (!data) notFound();

  const { instance, template, computed, provenance, period } = data;

  const metricById = new Map(computed.metrics.map((m) => [m.metricId, m]));
  const pointer = (metricId: string) => metricById.get(metricId) ?? null;

  const unboundSteps = provenance.filter((p) => p.unbound);
  const missingTools = [
    ...new Set(
      template.steps
        .filter((s) => unboundSteps.some((u) => u.stepId === s.id))
        .map((s) => getInstrumentationTool(s.sourceHint).label)
    ),
  ];

  const northStar = pointer(template.northStar.metricId);
  const leading = pointer(template.leadingIndicator.metricId);
  const governing = pointer(template.governingRate.metricId);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={instance.name}
        description={`${template.label} · ${template.badge}`}
        actions={
          <div className="flex gap-1">
            {FUNNEL_PERIOD_PRESETS.map((preset) => (
              <Link
                key={preset.id}
                href={`${paths.platform.funnels.detail(funnelId)}?period=${preset.id}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  preset.id === presetId
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {preset.label}
              </Link>
            ))}
          </div>
        }
      />

      <p className="text-xs text-muted-foreground">
        Período: {period.start} a {period.end} · Zona horaria de reporte:{" "}
        {instance.reporting_timezone}
      </p>

      {missingTools.length > 0 ? (
        <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <div className="text-sm">
            <p className="font-medium">Faltan fuentes para {unboundSteps.length} paso(s)</p>
            <p className="mt-1 text-muted-foreground">
              Sin estas integraciones los pasos quedan sin datos, que no es lo mismo que
              tener cero: {missingTools.join(", ")}.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "North-star", pointer: template.northStar, metric: northStar },
          { label: "Indicador adelantado", pointer: template.leadingIndicator, metric: leading },
          { label: "Tasa que gobierna", pointer: template.governingRate, metric: governing },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-card p-4 dark:border-glass dark:bg-glass"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-medium">{item.pointer.label}</p>
            <p
              className={cn(
                "mt-1 text-2xl font-semibold tabular-nums",
                item.metric?.value === null && "text-muted-foreground"
              )}
            >
              {item.metric
                ? formatFunnelValue(item.metric.value, item.metric.unit, instance.currency)
                : "—"}
            </p>
          </div>
        ))}
      </div>

      <FunnelSpineStrip stages={computed.stages} transitions={computed.transitions} />

      <FunnelStepsTable
        template={template}
        computed={computed}
        provenance={provenance}
        currency={instance.currency}
      />
    </div>
  );
}
