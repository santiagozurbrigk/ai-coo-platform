"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Target,
  Users,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  PhoneCall,
  Clock,
  CheckCircle,
  XCircle,
  UserMinus,
  Heart,
  Activity,
} from "lucide-react";
import { cn, GlassPanel } from "@ai-coo/ui";
import {
  getSalesPerformanceMetricsAction,
  type SalesMetricsPeriod,
} from "@/app/sales/metrics-actions";
import { usePlatformData } from "@/providers";
import { formatPercent } from "@/lib/format";
import { padTimeSeriesZeros } from "@/lib/chart/pad-time-series";
import type { SalesPerformanceMetrics, FrequentObjectionsResult } from "@/types/sales";
import {
  GaugeMetricChart,
  FunnelChartPanel,
  RingDistributionChart,
  PieDistributionChart,
  SparklineChart,
  TrendLineChart,
  ChartShell,
  DualAreaChart,
} from "@/components/charts/platform";
import { FrequentObjectionsSection } from "./frequent-objections-section";
import { CloserPerformancePanel } from "./closer-performance-panel";
import { SalesTeamPerformanceSection } from "./sales-team-performance-section";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type RangeOption = "month" | "30d";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DeltaBadge({ delta, inverse = false }: { delta: number | null; inverse?: boolean }) {
  if (delta === null) return null;
  const abs = Math.abs(delta);
  if (abs < 0.5) return <span className="text-[10px] text-muted-foreground">Sin cambio</span>;
  const isPositive = inverse ? delta < 0 : delta > 0;
  const Icon = delta > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", isPositive ? "text-emerald-500" : "text-rose-500")}>
      <Icon size={11} />
      {abs.toFixed(1)}% vs mes anterior
    </span>
  );
}

// ─── KPI Hero Card — texto arriba, sparkline pegado al borde inferior ──────────
// SparklineChart no tiene min-height: funciona correctamente en altura fija.

function KpiHeroCard({
  label,
  hint,
  value,
  delta,
  deltaInverse,
  sparkData,
  icon: Icon,
}: {
  label: string;
  hint?: string;
  value: string;
  delta?: number | null;
  deltaInverse?: boolean;
  sparkData?: number[];
  icon: React.ElementType;
}) {
  return (
    <GlassPanel className="flex flex-col overflow-hidden p-0 min-h-[140px]">
      <div className="flex items-start gap-3 px-5 pt-5 pb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
          <Icon size={15} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-[2.2rem] font-bold tabular-nums leading-none tracking-tight">{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
          {delta !== undefined && delta !== null && <DeltaBadge delta={delta} inverse={deltaInverse} />}
        </div>
      </div>
      {/* Sparkline al borde inferior — sin min-height constraints */}
      {sparkData && sparkData.length >= 2 ? (
        <div className="mt-auto h-16 w-full overflow-hidden">
          <SparklineChart data={sparkData} color="var(--chart-1)" className="h-16 w-full" />
        </div>
      ) : (
        <div className="h-4" />
      )}
    </GlassPanel>
  );
}

// ─── Stat Card compacto con icono ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  delta,
  deltaInverse,
  suffix = "",
  icon: Icon,
  dimmed = false,
}: {
  label: string;
  value: number | string;
  delta?: number | null;
  deltaInverse?: boolean;
  suffix?: string;
  icon?: React.ElementType;
  dimmed?: boolean;
}) {
  return (
    <GlassPanel className={cn("flex flex-col gap-2 p-4", dimmed && "opacity-40")}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
        {Icon && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-500/15 text-violet-500">
            <Icon size={12} />
          </div>
        )}
      </div>
      <p className="text-[2rem] font-bold tabular-nums leading-none">{value}{suffix}</p>
      {delta !== undefined && delta !== null && <DeltaBadge delta={delta} inverse={deltaInverse} />}
    </GlassPanel>
  );
}

// ─── Gauge Card compacto para el sidebar ──────────────────────────────────────

function GaugeSideCard({
  label,
  value,
  displayValue,
  target,
  suffix = "%",
}: {
  label: string;
  value: number;
  displayValue?: string;
  target: string;
  suffix?: string;
}) {
  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="flex items-start justify-between px-4 pt-4 pb-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums">{displayValue ?? `${Math.round(value)}${suffix}`}</p>
          <p className="text-[11px] text-muted-foreground">{target}</p>
        </div>
      </div>
      {/* Gauge con altura controlada — GaugeMetricChart usa Gauge interno sin ChartWrapper */}
      <div className="flex justify-center px-4 pb-3">
        <GaugeMetricChart
          value={value}
          max={100}
          label={label}
          suffix={suffix}
          className="w-full max-w-[180px]"
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

  const isLoading = salesMetricsLoading || perfLoading;
  const periodLabel = period === "month" ? "este mes" : "últimos 30 días";

  // Sparkline para KPI heroes (booking trend aplanado a 7 puntos)
  const bookingSparkData = useMemo(
    () => padTimeSeriesZeros(salesMetrics.bookingTrend, 7).map((d) => d.value),
    [salesMetrics.bookingTrend]
  );

  // Agendas semanales — 6 semanas para sparkline hero
  const agendasSparkData = useMemo(() => {
    const weeks = 6;
    const now = new Date();
    return Array.from({ length: weeks }, (_, i) => {
      const start = new Date(now);
      start.setDate(start.getDate() - (weeks - 1 - i) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return closingCalls.filter((c) => {
        const d = c.scheduledAt ? new Date(c.scheduledAt) : null;
        return d && d >= start && d < end;
      }).length;
    });
  }, [closingCalls]);

  // Tendencia semanal para DualAreaChart (6 semanas, datos diarios agrupados)
  const convsTrend = useMemo(() => {
    const weeks = 6;
    const now = new Date();
    return Array.from({ length: weeks }, (_, i) => {
      const start = new Date(now);
      start.setDate(start.getDate() - (weeks - 1 - i) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const label = start.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
      const total = conversations.filter((c) => {
        const d = new Date(c.lastMessageAt);
        return d >= start && d < end;
      }).length;
      const booked = conversations.filter((c) => {
        const d = new Date(c.lastMessageAt);
        return (
          d >= start &&
          d < end &&
          (c.status === "booked" || c.tag === "agendado")
        );
      }).length;
      return { label, primary: total, secondary: booked };
    });
  }, [conversations]);

  // Fuentes de leads
  const leadSourceSlices = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of conversations) {
      const src = (c.source as string | undefined) ?? "manual";
      counts[src] = (counts[src] ?? 0) + 1;
    }
    const colors: Record<string, string> = {
      instagram: "#E1306C", whatsapp: "#25D366", manychat: "#0084FF",
      manual: "#64748b", web: "#7C3AED",
    };
    const labels: Record<string, string> = {
      instagram: "Instagram", whatsapp: "WhatsApp", manychat: "ManyChat",
      manual: "Manual", web: "Web / Landing",
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

  // Estado de conversaciones
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

  // Embudo
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

  return (
    <div className="space-y-6">

      {/* ── Selector de período ───────────────────────────────────────────── */}
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

      {/* ── 1. KPI Heroes: Close rate + Show rate ────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiHeroCard
          label="Close Rate"
          hint="Cierres / asistencias"
          value={isLoading ? "—" : formatPercent(perfMetrics?.closer.closeRate ?? 0)}
          icon={Target}
          sparkData={bookingSparkData}
        />
        <KpiHeroCard
          label="Show Rate"
          hint="Asistencias / agendas"
          value={isLoading ? "—" : formatPercent(perfMetrics?.closer.showRate ?? 0)}
          icon={Users}
          sparkData={[...bookingSparkData].reverse()}
        />
      </div>

      {/* ── 2. Layout: columna izquierda + sidebar derecho ───────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* ── Columna izquierda ──────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Leads */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold">Rendimiento de Leads</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Leads totales" value={isLoading ? "—" : (perfMetrics?.leads.leadsCount ?? 0)} icon={Users} />
              <StatCard label="Agendas" value={isLoading ? "—" : (perfMetrics?.leads.agendasCount ?? 0)} icon={CalendarCheck} />
              <StatCard label="En nutrición" value={isLoading ? "—" : (perfMetrics?.leads.nurturingCount ?? 0)} icon={Heart} />
              <StatCard label="Perdidos" value={isLoading ? "—" : (perfMetrics?.leads.lostCount ?? 0)} icon={UserMinus} />
            </div>
          </section>

          {/* Agendas hero — SparklineChart evita los min-h del HeroAreaChart */}
          <KpiHeroCard
            label="Agendas totales"
            hint={`Tendencia semanal · ${periodLabel}`}
            value={isLoading ? "—" : String(perfMetrics?.leads.agendasCount ?? 0)}
            icon={CalendarCheck}
            sparkData={agendasSparkData}
          />

          {/* Llamadas */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold">Rendimiento de Llamadas</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Cierres" value={isLoading ? "—" : (perfMetrics?.calls.cierres ?? 0)} icon={CheckCircle} />
              <StatCard label="Asistencias" value={isLoading ? "—" : (perfMetrics?.calls.asistencias ?? 0)} icon={PhoneCall} />
              <StatCard label="Inasistencias" value={isLoading ? "—" : (perfMetrics?.calls.noShows ?? 0)} icon={XCircle} />
              <StatCard label="Seguimientos" value={isLoading ? "—" : (perfMetrics?.calls.followUpScheduled ?? 0)} icon={CalendarCheck} />
              <StatCard label="No cierres" value={isLoading ? "—" : (perfMetrics?.calls.noCierres ?? 0)} icon={XCircle} />
              <StatCard label="Señas" value={isLoading ? "—" : (perfMetrics?.calls.senas ?? "—")} icon={Activity} dimmed={!perfMetrics?.calls.senas} />
            </div>
          </section>

          {/* Tendencia semanal — DualAreaChart en contenedor de altura fija */}
          <ChartShell title="Tendencia semanal" subtitle="Conversaciones nuevas vs agendadas">
            <div className="h-[180px] w-full overflow-hidden">
              <DualAreaChart
                data={convsTrend}
                primaryKey="primary"
                secondaryKey="secondary"
                primaryLabel="Conversaciones"
                secondaryLabel="Agendadas"
                className="h-[180px]"
              />
            </div>
          </ChartShell>

          {/* Fuentes de leads */}
          {leadSourceSlices.length > 0 && (
            <ChartShell
              title="Fuentes de leads"
              subtitle={`${totalConvs} conversaciones · distribución por origen`}
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <div className="shrink-0">
                  <PieDistributionChart slices={leadSourceSlices} className="max-w-[180px]" />
                </div>
                <div className="flex-1 space-y-2">
                  {leadSourceSlices.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                      <span className="flex-1 text-xs text-muted-foreground">{s.label}</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                      <span className="w-16 text-right text-xs font-medium tabular-nums">{s.pct}% ({s.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartShell>
          )}

          {/* Embudo de conversión */}
          {funnelStages.length >= 2 && (
            <ChartShell title="Embudo de conversión" subtitle="Leads → Agendas → Asistencias → Cierres">
              <div className="h-[140px]">
                <FunnelChartPanel stages={funnelStages} orientation="horizontal" className="h-[140px]" />
              </div>
            </ChartShell>
          )}

          {/* Ranking de closers */}
          <CloserPerformancePanel closers={salesMetrics.closerBreakdown} />

          {/* Equipo de ventas */}
          <SalesTeamPerformanceSection />
        </div>

        {/* ── Sidebar derecho ────────────────────────────────────────────── */}
        <div className="space-y-4">

          <h3 className="text-[13px] font-semibold">Tasas de conversión</h3>

          {/* Tasa de agendamiento */}
          <GaugeSideCard
            label="Tasa de agendamiento"
            value={salesMetrics.bookingRate}
            target="Objetivo: 70%"
          />

          {/* Tasa de fantasma */}
          <GaugeSideCard
            label="Tasa de fantasma"
            value={salesMetrics.ghostingRate}
            target="Objetivo: <20%"
          />

          {/* Tiempo de respuesta — card simple sin gauge */}
          <GlassPanel className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tiempo de respuesta</p>
              <p className="text-2xl font-bold tabular-nums">{salesMetrics.avgResponseMin} min</p>
              <p className="text-[11px] text-muted-foreground">Objetivo: &lt;10 min</p>
            </div>
          </GlassPanel>

          {/* Motivos de no cierre — sin GlassPanel wrapper: FrequentObjectionsSection ya tiene el suyo */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-0.5">
              Motivos de no cierre
            </p>
            <FrequentObjectionsSection initialData={frequentObjections} />
          </div>

          {/* Estado de conversaciones */}
          {convStatusSlices.length > 0 && (
            <GlassPanel className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Conversaciones</p>
                <span className="text-sm font-bold tabular-nums">{totalConvs}</span>
              </div>
              <div className="flex items-start gap-3">
                <RingDistributionChart
                  slices={convStatusSlices}
                  centerValue={String(totalConvs)}
                  centerLabel="Total"
                  className="max-w-[100px] min-w-[100px] shrink-0"
                />
                <div className="flex-1 space-y-1.5 pt-1">
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

          {/* Eficiencia operativa */}
          <GlassPanel className="p-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Eficiencia operativa</p>
            <div className="divide-y divide-border">
              {[
                { label: "Msg / agendamiento", value: String(salesMetrics.messagesPerBooking), sub: "Mensajes promedio hasta agenda" },
                { label: "Sin responder", value: String(salesMetrics.unansweredConversations), sub: `de ${salesMetrics.totalConversations} totales` },
                { label: "Activas", value: String(salesMetrics.activeConversations) },
              ].map((row) => (
                <div key={row.label} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{row.label}</p>
                  <p className="text-xl font-bold tabular-nums">{row.value}</p>
                  {row.sub && <p className="text-[10px] text-muted-foreground">{row.sub}</p>}
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ── Strip de resumen ─────────────────────────────────────────────── */}
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
            <div key={item.label} className={cn("flex flex-col gap-0.5 px-5 py-3", i === 0 && "rounded-l-[inherit]")}>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">{item.label}</p>
              <p className="text-lg font-bold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
