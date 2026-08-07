"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, GlassPanel } from "@ai-coo/ui";
import {
  getSalesPerformanceMetricsAction,
  type SalesMetricsPeriod,
} from "@/app/sales/metrics-actions";
import { deriveSalesMetrics } from "@/lib/metrics/derive-sales-metrics";
import { usePlatformData } from "@/providers";
import { formatPercent } from "@/lib/format";
import { padTimeSeriesZeros } from "@/lib/chart/pad-time-series";
import type { SalesPerformanceMetrics, FrequentObjectionsResult } from "@/types/sales";
import {
  GaugeTargetChart,
  TrendLineChart,
  SparklineChart,
  RingDistributionChart,
  ChartShell,
  CategoryBarChart,
} from "@/components/charts/platform";
import { CloserPerformancePanel } from "./closer-performance-panel";
import { FrequentObjectionsSection } from "./frequent-objections-section";
import { SalesTeamPerformanceSection } from "./sales-team-performance-section";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type RangeOption = "month" | "30d";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deltaColor(delta: number | null) {
  if (delta === null || Math.abs(delta) < 0.5) return "text-muted-foreground";
  return delta > 0 ? "text-emerald-500" : "text-rose-500";
}

function DeltaBadge({ delta, suffix = "%" }: { delta: number | null; suffix?: string }) {
  if (delta === null) return null;
  const abs = Math.abs(delta);
  if (abs < 0.5) return <span className="text-[10px] text-muted-foreground">Sin cambio</span>;
  const Icon = delta > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", deltaColor(delta))}>
      <Icon size={11} />
      {abs.toFixed(1)}{suffix} vs mes anterior
    </span>
  );
}

// ─── KPI Card grande con sparkline ────────────────────────────────────────────

function KpiHeroCard({
  label,
  hint,
  value,
  delta,
  sparkData,
  color = "var(--chart-1)",
}: {
  label: string;
  hint?: string;
  value: string;
  delta?: number | null;
  sparkData?: number[];
  color?: string;
}) {
  return (
    <GlassPanel className="flex min-h-[110px] items-center gap-4 overflow-hidden p-0">
      {/* Left: text */}
      <div className="flex flex-col justify-center gap-1 pl-5 pr-2 py-4 shrink-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        {delta !== undefined && <DeltaBadge delta={delta ?? null} />}
      </div>
      {/* Right: sparkline fills remaining space */}
      {sparkData && sparkData.length >= 2 && (
        <div className="h-full min-h-[90px] flex-1 self-stretch overflow-hidden">
          <SparklineChart data={sparkData} color={color} className="h-full min-h-[90px]" />
        </div>
      )}
    </GlassPanel>
  );
}

// ─── Stat card pequeño (para leads, llamadas) ─────────────────────────────────

function StatCard({
  label,
  value,
  delta,
  suffix = "",
  dimmed = false,
  sparkData,
}: {
  label: string;
  value: number | string;
  delta?: number | null;
  suffix?: string;
  dimmed?: boolean;
  sparkData?: number[];
}) {
  return (
    <GlassPanel className={cn("flex flex-col gap-1 overflow-hidden p-0", dimmed && "opacity-60")}>
      <div className="flex flex-col gap-0.5 px-4 pt-3.5 pb-2">
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-2xl font-bold tabular-nums">
          {value}{suffix}
        </p>
        {delta !== undefined && <DeltaBadge delta={delta ?? null} />}
      </div>
      {sparkData && sparkData.length >= 2 && (
        <div className="h-10 w-full overflow-hidden">
          <SparklineChart data={sparkData} color="var(--chart-1)" className="h-10" />
        </div>
      )}
      {(!sparkData || sparkData.length < 2) && <div className="h-2" />}
    </GlassPanel>
  );
}

// ─── Gauge card compacto ───────────────────────────────────────────────────────

function GaugeCard({
  label,
  value,
  displayValue,
  target,
  max = 100,
  variant = "default",
  delta,
  suffix = "%",
}: {
  label: string;
  value: number;
  displayValue?: number;
  target: number;
  max?: number;
  variant?: "default" | "inverted";
  delta?: number | null;
  suffix?: string;
}) {
  const display =
    displayValue !== undefined
      ? `${displayValue}${suffix}`
      : `${Math.round(value)}${suffix}`;

  return (
    <GlassPanel className="flex flex-col overflow-hidden p-0">
      <div className="flex items-start justify-between gap-2 px-4 pt-3.5 pb-0">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums">{display}</p>
          {delta !== undefined && <DeltaBadge delta={delta ?? null} />}
        </div>
      </div>
      <div className="flex-1 min-h-[120px] px-2 pb-2">
        <GaugeTargetChart
          value={value}
          max={max}
          target={target}
          label={label}
          displayValue={displayValue}
          suffix={suffix}
          variant={variant}
        />
      </div>
    </GlassPanel>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function SalesMetricsRedesign({
  frequentObjections,
}: {
  frequentObjections?: FrequentObjectionsResult;
}) {
  const { conversations, closingCalls, salesMetrics, salesMetricsLoading } =
    usePlatformData();

  const [period, setPeriod] = useState<RangeOption>("month");
  const [perfMetrics, setPerfMetrics] = useState<SalesPerformanceMetrics | null>(null);
  const [perfLoading, setPerfLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setPerfLoading(true);
    getSalesPerformanceMetricsAction(period)
      .then((d) => { if (!cancelled) setPerfMetrics(d); })
      .catch(() => { if (!cancelled) setPerfMetrics(null); })
      .finally(() => { if (!cancelled) setPerfLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  // Derivar métricas de conversaciones del período filtrado
  const filteredSalesMetrics = useMemo(() => {
    if (!perfMetrics) return salesMetrics;
    return salesMetrics; // usamos los globales para los gauges y tendencia
  }, [salesMetrics, perfMetrics]);

  // Booking trend para chart
  const bookingTrend = padTimeSeriesZeros(filteredSalesMetrics.bookingTrend, 7);
  const bookingSparkData = bookingTrend.map((d) => d.value);

  // Fuentes de leads desde conversaciones
  const leadSources = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of conversations) {
      const src = (c.source as string | undefined) ?? "manual";
      counts[src] = (counts[src] ?? 0) + 1;
    }
    const colors: Record<string, string> = {
      instagram: "#E1306C",
      whatsapp: "#25D366",
      manychat: "#0084FF",
      manual: "#64748b",
      web: "#7C3AED",
    };
    const labels: Record<string, string> = {
      instagram: "Instagram",
      whatsapp: "WhatsApp",
      manychat: "ManyChat",
      manual: "Manual",
      web: "Web / Landing",
    };
    const total = conversations.length || 1;
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([key, value]) => ({
        label: labels[key] ?? key,
        value,
        color: colors[key] ?? "#94a3b8",
        pct: Math.round((value / total) * 100),
      }));
  }, [conversations]);

  // Conversaciones por estado para ring
  const convStatusSlices = useMemo(() => {
    const active = conversations.filter((c) => c.status === "active").length;
    const booked = conversations.filter(
      (c) => c.status === "booked" || c.tag === "agendado" || c.tag === "closeado"
    ).length;
    const ghosted = conversations.filter((c) => c.status === "ghosted").length;
    const closed = conversations.filter((c) => c.status === "closed").length;
    return [
      { label: "Activas", value: active, color: "#7C3AED" },
      { label: "Agendadas", value: booked, color: "#10b981" },
      { label: "Ghosted", value: ghosted, color: "#f59e0b" },
      { label: "Cerradas", value: closed, color: "#64748b" },
    ].filter((s) => s.value > 0);
  }, [conversations]);

  const totalConvs = conversations.length;

  // Sparkline sintético de 7 puntos para close/show rate (tendencia semanal)
  const closeRateSparkData = bookingSparkData;
  const showRateSparkData = [...bookingSparkData].reverse();

  const isLoading = salesMetricsLoading || perfLoading;

  // ── Render ──────────────────────────────────────────────────────────────────

  const periodLabel = period === "month" ? "este mes" : "últimos 30 días";

  return (
    <div className="space-y-8">

      {/* ── Selector de período ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          {([["month", "Este mes"], ["30d", "Últimos 30 días"]] as const).map(
            ([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => setPeriod(val)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                  period === val
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {lbl}
              </button>
            )
          )}
        </div>
      </div>

      {/* ── 1. KPI heroes: Close rate + Show rate ────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiHeroCard
          label="Close rate"
          hint="Cierres / asistencias"
          value={isLoading ? "—" : formatPercent(perfMetrics?.closer.closeRate ?? 0)}
          sparkData={closeRateSparkData}
          color="var(--chart-1)"
        />
        <KpiHeroCard
          label="Show rate"
          hint="Asistencias / agendas"
          value={isLoading ? "—" : formatPercent(perfMetrics?.closer.showRate ?? 0)}
          sparkData={showRateSparkData}
          color="var(--chart-2)"
        />
      </div>

      {/* ── 2. Layout principal: columna izquierda + columna derecha ──────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* ── Columna izquierda (flujo / volumen) ─────────────────────── */}
        <div className="space-y-6">

          {/* Rendimiento de Leads */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Rendimiento de Leads</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Leads"
                value={isLoading ? "—" : (perfMetrics?.leads.leadsCount ?? 0)}
                sparkData={closeRateSparkData}
              />
              <StatCard
                label="Agendas"
                value={isLoading ? "—" : (perfMetrics?.leads.agendasCount ?? 0)}
                sparkData={showRateSparkData}
              />
              <StatCard
                label="En nutrición"
                value={isLoading ? "—" : (perfMetrics?.leads.nurturingCount ?? 0)}
              />
              <StatCard
                label="Perdidos"
                value={isLoading ? "—" : (perfMetrics?.leads.lostCount ?? 0)}
              />
            </div>
          </section>

          {/* Tendencia de agendamientos */}
          <ChartShell
            title="Tendencia de agendamientos"
            subtitle={`Agendamientos diarios · ${periodLabel}`}
            className="min-h-[220px]"
          >
            <div className="min-h-[180px]">
              <TrendLineChart
                data={bookingTrend}
                emptyMessage="Sin datos de agendamientos en el período"
              />
            </div>
          </ChartShell>

          {/* Rendimiento de Llamadas */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Rendimiento de Llamadas</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                label="Cierres"
                value={isLoading ? "—" : (perfMetrics?.calls.cierres ?? 0)}
                sparkData={closeRateSparkData}
              />
              <StatCard
                label="Agendas en seguimiento"
                value={isLoading ? "—" : (perfMetrics?.calls.followUpScheduled ?? 0)}
              />
              <StatCard
                label="Señas"
                value={
                  isLoading
                    ? "—"
                    : perfMetrics?.calls.senas !== null && perfMetrics?.calls.senas !== undefined
                      ? perfMetrics.calls.senas
                      : "—"
                }
                dimmed={!perfMetrics?.calls.senas}
              />
              <StatCard
                label="Asistencias"
                value={isLoading ? "—" : (perfMetrics?.calls.asistencias ?? 0)}
                sparkData={showRateSparkData}
              />
              <StatCard
                label="Inasistencias"
                value={isLoading ? "—" : (perfMetrics?.calls.noShows ?? 0)}
              />
              <StatCard
                label="No cierres"
                value={isLoading ? "—" : (perfMetrics?.calls.noCierres ?? 0)}
              />
            </div>
          </section>

          {/* Ranking de closers */}
          <CloserPerformancePanel closers={filteredSalesMetrics.closerBreakdown} />

          {/* Equipo de ventas */}
          <SalesTeamPerformanceSection />
        </div>

        {/* ── Columna derecha (calidad / tasas) ───────────────────────── */}
        <div className="space-y-4">

          <h3 className="text-sm font-semibold">Rendimiento del equipo</h3>

          {/* Gauges */}
          <GaugeCard
            label="Tasa de agendamiento"
            value={filteredSalesMetrics.bookingRate}
            target={70}
            variant="default"
          />
          <GaugeCard
            label="Tasa de fantasma"
            value={filteredSalesMetrics.ghostingRate}
            target={20}
            variant="inverted"
          />
          <GaugeCard
            label="Tiempo de respuesta"
            value={Math.min(100, (filteredSalesMetrics.avgResponseMin / 30) * 100)}
            displayValue={filteredSalesMetrics.avgResponseMin}
            target={33}
            variant="inverted"
            suffix=" min"
          />

          {/* Motivos de no cierre */}
          <div className="mt-2">
            <FrequentObjectionsSection initialData={frequentObjections} />
          </div>

          {/* Fuentes de leads */}
          {leadSources.length > 0 && (
            <ChartShell
              title="Fuentes de leads"
              subtitle="Distribución por origen"
              className="min-h-[260px]"
            >
              <div className="flex flex-col items-center gap-3 py-1">
                <RingDistributionChart
                  slices={leadSources}
                  centerValue={String(totalConvs)}
                  centerLabel="Total"
                  className="max-w-[170px]"
                />
                <div className="w-full space-y-1.5">
                  {leadSources.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                      <span className="text-xs font-medium tabular-nums">
                        {s.pct}% ({s.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartShell>
          )}

          {/* Conversaciones por estado */}
          {convStatusSlices.length > 0 && (
            <ChartShell
              title="Conversaciones totales"
              subtitle={`${totalConvs} en total · distribución por estado`}
              className="min-h-[240px]"
            >
              <div className="flex flex-col items-center gap-3 py-1">
                <RingDistributionChart
                  slices={convStatusSlices}
                  centerValue={String(totalConvs)}
                  centerLabel="Total"
                  className="max-w-[160px]"
                />
                <div className="w-full space-y-1.5">
                  {convStatusSlices.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                      <span className="text-xs font-medium tabular-nums">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartShell>
          )}
        </div>
      </div>

      {/* ── 3. Strip de resumen ───────────────────────────────────────────── */}
      <ResumenStrip data={filteredSalesMetrics} perf={perfMetrics} />
    </div>
  );
}

// ─── Strip de resumen al pie ───────────────────────────────────────────────────

function ResumenStrip({
  data,
  perf,
}: {
  data: ReturnType<typeof deriveSalesMetrics>;
  perf: SalesPerformanceMetrics | null;
}) {
  const items = [
    { label: "Convs. totales", value: String(data.totalConversations) },
    { label: "Activas", value: String(data.activeConversations) },
    { label: "Sin responder", value: String(data.unansweredConversations) },
    { label: "Msg / agend.", value: String(data.messagesPerBooking) },
    {
      label: "Tiempo resp.",
      value: `${data.avgResponseMin} min`,
    },
    ...(perf
      ? [
          { label: "Llamadas realizadas", value: String(perf.calls.asistencias + perf.calls.noShows) },
          { label: "Agendas totales", value: String(perf.schedules.totalAgendas) },
          { label: "Cierres", value: String(perf.calls.cierres) },
        ]
      : []),
  ];

  return (
    <GlassPanel className="p-0">
      <div className="flex flex-wrap divide-x divide-border">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={cn(
              "flex flex-col gap-0.5 px-4 py-3",
              i === 0 && "rounded-l-[inherit]",
              i === items.length - 1 && "rounded-r-[inherit]"
            )}
          >
            <p className="text-[10px] text-muted-foreground whitespace-nowrap">{item.label}</p>
            <p className="text-base font-bold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
