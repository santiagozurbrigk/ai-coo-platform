"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Target,
  Users,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  PhoneCall,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  UserMinus,
  Heart,
  BarChart2,
  Activity,
} from "lucide-react";
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
  GaugeMetricChart,
  HeroAreaChart,
  FunnelChartPanel,
  RingDistributionChart,
  PieDistributionChart,
  SparklineChart,
  TrendLineChart,
  ChartShell,
  CategoryBarChart,
  DualAreaChart,
} from "@/components/charts/platform";
import { FrequentObjectionsSection } from "./frequent-objections-section";
import { CloserPerformancePanel } from "./closer-performance-panel";
import { SalesTeamPerformanceSection } from "./sales-team-performance-section";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type RangeOption = "month" | "30d";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DeltaBadge({
  delta,
  suffix = "%",
  inverse = false,
}: {
  delta: number | null;
  suffix?: string;
  inverse?: boolean;
}) {
  if (delta === null) return null;
  const abs = Math.abs(delta);
  if (abs < 0.5) return <span className="text-[10px] text-muted-foreground">Sin cambio</span>;
  const isPositive = inverse ? delta < 0 : delta > 0;
  const Icon = delta > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-[11px] font-medium",
        isPositive ? "text-emerald-500" : "text-rose-500"
      )}
    >
      <Icon size={11} />
      {abs.toFixed(1)}{suffix} vs mes anterior
    </span>
  );
}

// ─── KPI hero card (icono + número + sparkline) ────────────────────────────────

function KpiHeroCard({
  label,
  hint,
  value,
  delta,
  deltaInverse,
  sparkData,
  icon: Icon,
  iconColor = "bg-violet-500/15 text-violet-500",
  chartColor = "var(--chart-1)",
}: {
  label: string;
  hint?: string;
  value: string;
  delta?: number | null;
  deltaInverse?: boolean;
  sparkData?: number[];
  icon: React.ElementType;
  iconColor?: string;
  chartColor?: string;
}) {
  return (
    <GlassPanel className="flex min-h-[120px] items-center gap-0 overflow-hidden p-0">
      <div className="flex flex-col justify-center gap-1.5 py-5 pl-5 pr-3 shrink-0 min-w-[180px]">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", iconColor)}>
            <Icon size={14} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        </div>
        <p className="text-[2.2rem] font-bold tabular-nums leading-none tracking-tight">{value}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        {delta !== undefined && delta !== null && (
          <DeltaBadge delta={delta} inverse={deltaInverse} />
        )}
      </div>
      {sparkData && sparkData.length >= 2 && (
        <div className="h-full min-h-[100px] flex-1 self-stretch overflow-hidden opacity-80">
          <SparklineChart data={sparkData} color={chartColor} className="h-full min-h-[100px]" />
        </div>
      )}
    </GlassPanel>
  );
}

// ─── Stat card con icono ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta,
  deltaInverse,
  suffix = "",
  icon: Icon,
  iconColor = "bg-muted text-muted-foreground",
  dimmed = false,
}: {
  label: string;
  value: number | string;
  delta?: number | null;
  deltaInverse?: boolean;
  suffix?: string;
  icon?: React.ElementType;
  iconColor?: string;
  dimmed?: boolean;
}) {
  return (
    <GlassPanel className={cn("flex flex-col gap-2 p-4", dimmed && "opacity-50")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
        {Icon && (
          <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", iconColor)}>
            <Icon size={12} />
          </div>
        )}
      </div>
      <p className="text-[1.6rem] font-bold tabular-nums leading-none">
        {value}{suffix}
      </p>
      {delta !== undefined && delta !== null && (
        <DeltaBadge delta={delta} inverse={deltaInverse} />
      )}
    </GlassPanel>
  );
}

// ─── Metric inline para el sidebar derecho ────────────────────────────────────

function SideMetricRow({
  label,
  value,
  sub,
  delta,
  deltaInverse,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number | null;
  deltaInverse?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        {delta !== undefined && delta !== null && (
          <DeltaBadge delta={delta} inverse={deltaInverse} />
        )}
      </div>
    </div>
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

  const isLoading = salesMetricsLoading || perfLoading;

  // Booking trend
  const bookingTrend = padTimeSeriesZeros(salesMetrics.bookingTrend, 7);
  const bookingSparkData = bookingTrend.map((d) => d.value);

  // Close/Show rate sparks
  const closeRateSparkData = bookingSparkData;
  const showRateSparkData = [...bookingSparkData].reverse();

  // Agendas trend (últimas 4 semanas — para HeroAreaChart)
  const agendasTrend = useMemo(() => {
    const weeks = 5;
    const now = new Date();
    return Array.from({ length: weeks }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weeks - 1 - i) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const label = weekStart.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
      const count = closingCalls.filter((c) => {
        const d = c.scheduledAt ? new Date(c.scheduledAt) : null;
        return d && d >= weekStart && d < weekEnd;
      }).length;
      return { label, value: count };
    });
  }, [closingCalls]);

  // Conversaciones por semana (DualAreaChart: nuevas vs agendadas)
  const convsTrend = useMemo(() => {
    const weeks = 6;
    const now = new Date();
    return Array.from({ length: weeks }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weeks - 1 - i) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const label = weekStart.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
      const total = conversations.filter((c) => {
        const d = new Date(c.lastMessageAt);
        return d >= weekStart && d < weekEnd;
      }).length;
      const booked = conversations.filter((c) => {
        const d = new Date(c.lastMessageAt);
        return d >= weekStart && d < weekEnd && (c.status === "booked" || c.tag === "agendado");
      }).length;
      return { label, primary: total, secondary: booked };
    });
  }, [conversations]);

  // Fuentes de leads (PieDistributionChart)
  const leadSourceSlices = useMemo(() => {
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

  // Conversaciones por estado (RingDistributionChart)
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

  // Embudo de conversión (FunnelChart)
  const funnelStages = useMemo(() => {
    const leads = perfMetrics?.leads.leadsCount ?? totalConvs;
    const agendas = perfMetrics?.leads.agendasCount ?? 0;
    const asistencias = perfMetrics?.calls.asistencias ?? 0;
    const cierres = perfMetrics?.calls.cierres ?? 0;
    return [
      { label: "Leads", value: leads },
      { label: "Agendas", value: agendas },
      { label: "Asistencias", value: asistencias },
      { label: "Cierres", value: cierres },
    ].filter((s) => s.value > 0);
  }, [perfMetrics, totalConvs]);

  const periodLabel = period === "month" ? "este mes" : "últimos 30 días";

  return (
    <div className="space-y-6">

      {/* ── Selector de período ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5">
          {([["month", "Este mes"], ["30d", "Últimos 30 días"]] as const).map(([val, lbl]) => (
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
          ))}
        </div>
      </div>

      {/* ── 1. KPI heroes: Close rate + Show rate ─────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiHeroCard
          label="Close Rate"
          hint="Cierres / asistencias"
          value={isLoading ? "—" : formatPercent(perfMetrics?.closer.closeRate ?? 0)}
          delta={null}
          icon={Target}
          iconColor="bg-violet-500/15 text-violet-500"
          sparkData={closeRateSparkData}
          chartColor="var(--chart-1)"
        />
        <KpiHeroCard
          label="Show Rate"
          hint="Asistencias / agendas"
          value={isLoading ? "—" : formatPercent(perfMetrics?.closer.showRate ?? 0)}
          delta={null}
          icon={Users}
          iconColor="bg-emerald-500/15 text-emerald-500"
          sparkData={showRateSparkData}
          chartColor="var(--chart-2)"
        />
      </div>

      {/* ── 2. Layout principal: columna izquierda + sidebar ──────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_310px]">

        {/* ── Columna izquierda ─────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Leads */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold tracking-tight">Rendimiento de Leads</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Leads totales"
                value={isLoading ? "—" : (perfMetrics?.leads.leadsCount ?? 0)}
                icon={Users}
                iconColor="bg-violet-500/15 text-violet-500"
              />
              <StatCard
                label="Agendas"
                value={isLoading ? "—" : (perfMetrics?.leads.agendasCount ?? 0)}
                icon={CalendarCheck}
                iconColor="bg-emerald-500/15 text-emerald-500"
              />
              <StatCard
                label="En nutrición"
                value={isLoading ? "—" : (perfMetrics?.leads.nurturingCount ?? 0)}
                icon={Heart}
                iconColor="bg-blue-500/15 text-blue-500"
              />
              <StatCard
                label="Perdidos"
                value={isLoading ? "—" : (perfMetrics?.leads.lostCount ?? 0)}
                icon={UserMinus}
                iconColor="bg-rose-500/15 text-rose-500"
              />
            </div>
          </section>

          {/* Agendas hero — HeroAreaChart */}
          <GlassPanel className="flex flex-col gap-0 overflow-hidden p-0 sm:flex-row">
            <div className="flex flex-col justify-center gap-1.5 px-5 py-5 shrink-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Agendas totales
              </p>
              <p className="text-[2.4rem] font-bold tabular-nums leading-none">
                {isLoading ? "—" : (perfMetrics?.leads.agendasCount ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">Semanas recientes · {periodLabel}</p>
            </div>
            <div className="flex-1 min-h-[140px] overflow-hidden">
              <HeroAreaChart
                data={agendasTrend}
                color="var(--chart-2)"
                className="h-full min-h-[140px]"
                emptyMessage="Sin agendas en el período"
              />
            </div>
          </GlassPanel>

          {/* Llamadas */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold tracking-tight">Rendimiento de Llamadas</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                label="Cierres"
                value={isLoading ? "—" : (perfMetrics?.calls.cierres ?? 0)}
                icon={CheckCircle}
                iconColor="bg-emerald-500/15 text-emerald-500"
              />
              <StatCard
                label="Asistencias"
                value={isLoading ? "—" : (perfMetrics?.calls.asistencias ?? 0)}
                icon={PhoneCall}
                iconColor="bg-blue-500/15 text-blue-500"
              />
              <StatCard
                label="Inasistencias"
                value={isLoading ? "—" : (perfMetrics?.calls.noShows ?? 0)}
                icon={XCircle}
                iconColor="bg-amber-500/15 text-amber-500"
              />
              <StatCard
                label="Seguimientos"
                value={isLoading ? "—" : (perfMetrics?.calls.followUpScheduled ?? 0)}
                icon={CalendarCheck}
                iconColor="bg-violet-500/15 text-violet-500"
              />
              <StatCard
                label="No cierres"
                value={isLoading ? "—" : (perfMetrics?.calls.noCierres ?? 0)}
                icon={XCircle}
                iconColor="bg-rose-500/15 text-rose-500"
              />
              <StatCard
                label="Señas"
                value={
                  isLoading ? "—"
                  : (perfMetrics?.calls.senas ?? "—")
                }
                icon={Activity}
                iconColor="bg-muted text-muted-foreground"
                dimmed={!perfMetrics?.calls.senas}
              />
            </div>
          </section>

          {/* DualAreaChart: conversaciones nuevas vs agendadas por semana */}
          <ChartShell
            title="Tendencia semanal"
            subtitle="Conversaciones nuevas vs agendadas"
            className="min-h-[220px]"
          >
            <div className="min-h-[170px]">
              <DualAreaChart
                data={convsTrend}
                primaryKey="primary"
                secondaryKey="secondary"
                primaryLabel="Conversaciones"
                secondaryLabel="Agendadas"
              />
            </div>
          </ChartShell>

          {/* Fuentes de leads — PieDistributionChart */}
          {leadSourceSlices.length > 0 && (
            <ChartShell
              title="Fuentes de leads"
              subtitle={`${totalConvs} conversaciones totales · distribución por origen`}
              className="min-h-[240px]"
            >
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  <PieDistributionChart
                    slices={leadSourceSlices}
                    className="max-w-[200px]"
                  />
                </div>
                <div className="w-full space-y-2">
                  {leadSourceSlices.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                      <div className="flex flex-1 items-center gap-2">
                        <span className="text-xs text-muted-foreground flex-1">{s.label}</span>
                        <div className="h-1.5 flex-[3] overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${s.pct}%`, background: s.color }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums w-16 text-right">
                          {s.pct}% ({s.value})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartShell>
          )}

          {/* Embudo de conversión — FunnelChartPanel */}
          {funnelStages.length >= 2 && (
            <ChartShell
              title="Embudo de conversión"
              subtitle="Leads → Agendas → Asistencias → Cierres"
              className="min-h-[200px]"
            >
              <FunnelChartPanel
                stages={funnelStages}
                orientation="horizontal"
                className="min-h-[160px]"
              />
            </ChartShell>
          )}

          {/* Ranking de closers */}
          <CloserPerformancePanel closers={salesMetrics.closerBreakdown} />

          {/* Equipo de ventas */}
          <SalesTeamPerformanceSection />
        </div>

        {/* ── Columna derecha (sidebar) ─────────────────────────────────── */}
        <div className="space-y-4">

          <h3 className="text-[13px] font-semibold tracking-tight">Tasas de conversión</h3>

          {/* Gauge: Tasa de agendamiento */}
          <GlassPanel className="overflow-hidden p-0">
            <div className="px-4 pt-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tasa de agendamiento
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <p className="text-2xl font-bold tabular-nums">
                  {formatPercent(salesMetrics.bookingRate)}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">Objetivo: 70%</p>
            </div>
            <div className="px-2 pb-2">
              <GaugeMetricChart
                value={salesMetrics.bookingRate}
                max={100}
                label="Agendamiento"
                suffix="%"
                className="max-w-[220px]"
              />
            </div>
          </GlassPanel>

          {/* Ring + métrica: Tasa de fantasma */}
          <GlassPanel className="flex items-center gap-4 p-4">
            <div className="shrink-0">
              <RingDistributionChart
                slices={[
                  { label: "Ghosted", value: salesMetrics.ghostingRate, color: "#f59e0b" },
                  { label: "Resto", value: Math.max(0, 100 - salesMetrics.ghostingRate), color: "var(--border)" },
                ]}
                centerValue={`${Math.round(salesMetrics.ghostingRate)}%`}
                centerLabel="Fantasma"
                className="max-w-[90px] min-w-[90px]"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tasa de fantasma
              </p>
              <p className="text-2xl font-bold tabular-nums">{formatPercent(salesMetrics.ghostingRate)}</p>
              <p className="text-[11px] text-muted-foreground">Objetivo: &lt;20%</p>
            </div>
          </GlassPanel>

          {/* Tiempo de respuesta */}
          <GlassPanel className="flex items-center gap-4 p-4">
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              salesMetrics.avgResponseMin <= 10 ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
            )}>
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tiempo de respuesta
              </p>
              <p className="text-2xl font-bold tabular-nums">{salesMetrics.avgResponseMin} min</p>
              <p className="text-[11px] text-muted-foreground">Objetivo: &lt;10 min</p>
            </div>
          </GlassPanel>

          {/* Motivos de no cierre */}
          <GlassPanel className="p-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Motivos de no cierre
            </p>
            <FrequentObjectionsSection initialData={frequentObjections} />
          </GlassPanel>

          {/* Conversaciones por estado */}
          {convStatusSlices.length > 0 && (
            <GlassPanel className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Conversaciones totales
                </p>
                <span className="text-sm font-bold tabular-nums">{totalConvs}</span>
              </div>
              <div className="flex items-start gap-3">
                <RingDistributionChart
                  slices={convStatusSlices}
                  centerValue={String(totalConvs)}
                  centerLabel="Total"
                  className="max-w-[110px] min-w-[110px] shrink-0"
                />
                <div className="flex-1 space-y-2 pt-1">
                  {convStatusSlices.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Mensajes clave */}
          <GlassPanel className="p-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Eficiencia operativa
            </p>
            <div className="space-y-3 divide-y divide-border">
              <SideMetricRow
                label="Msg / agendamiento"
                value={String(salesMetrics.messagesPerBooking)}
                sub="Mensajes promedio hasta agenda"
              />
              <div className="pt-3">
                <SideMetricRow
                  label="Convs. sin responder"
                  value={String(salesMetrics.unansweredConversations)}
                  sub={`de ${salesMetrics.totalConversations} totales`}
                />
              </div>
              <div className="pt-3">
                <SideMetricRow
                  label="Convs. activas"
                  value={String(salesMetrics.activeConversations)}
                />
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ── 3. Strip de resumen ──────────────────────────────────────────── */}
      <GlassPanel className="p-0">
        <div className="flex flex-wrap divide-x divide-border">
          {[
            { label: "Convs. totales", value: String(salesMetrics.totalConversations) },
            { label: "Activas", value: String(salesMetrics.activeConversations) },
            { label: "Sin responder", value: String(salesMetrics.unansweredConversations) },
            { label: "Msg / agend.", value: String(salesMetrics.messagesPerBooking) },
            { label: "Tiempo resp.", value: `${salesMetrics.avgResponseMin} min` },
            ...(perfMetrics ? [
              { label: "Llamadas", value: String(perfMetrics.calls.asistencias + perfMetrics.calls.noShows) },
              { label: "Agendas", value: String(perfMetrics.schedules?.totalAgendas ?? 0) },
              { label: "Cierres", value: String(perfMetrics.calls.cierres) },
            ] : []),
          ].map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "flex flex-col gap-0.5 px-4 py-3",
                i === 0 && "rounded-l-[inherit]"
              )}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                {item.label}
              </p>
              <p className="text-lg font-bold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
