"use client";

import { useState } from "react";
import {
  Target,
  Users,
  CalendarCheck,
  PhoneCall,
  Clock,
  CheckCircle,
  XCircle,
  UserMinus,
  Heart,
  Activity,
  DollarSign,
  Wallet,
} from "lucide-react";
import { GlassPanel } from "@ai-coo/ui";
import { formatPercent } from "@/lib/format";
import { formatMoney } from "@/lib/finance/format";
import {
  ChartShell,
  DualAreaChart,
  FunnelChartPanel,
  PieDistributionChart,
  RingDistributionChart,
} from "@/components/charts/platform";
import { FrequentObjectionsSection } from "./frequent-objections-section";
import { CloserPerformancePanel } from "./closer-performance-panel";
import { SalesTeamPerformanceSection } from "./sales-team-performance-section";
// Componentes del módulo de métricas
import { DateRangePicker, getDefaultDateRange } from "./metrics/date-range-picker";
import { KpiHeroCard } from "./metrics/kpi-hero-card";
import { StatCard } from "./metrics/stat-card";
import { GaugeSideCard } from "./metrics/gauge-side-card";
import { SummaryStrip } from "./metrics/summary-strip";
import { useSalesMetrics } from "./metrics/use-sales-metrics";
import type { DateRange } from "./metrics/date-range-picker";
import type { FrequentObjectionsResult } from "@/types/sales";

// ─── Componente principal ──────────────────────────────────────────────────────

export function SalesMetricsRedesign({
  frequentObjections,
}: {
  frequentObjections?: FrequentObjectionsResult;
}) {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);

  const {
    isLoading,
    perfMetrics,
    filteredMetrics,
    filteredConversations,
    financeSummary,
    facturacionSparkData,
    cashCollectedSparkData,
    bookingSparkData,
    agendasSparkData,
    weeklyTrend,
    leadSourceSlices,
    convStatusSlices,
    funnelStages,
  } = useSalesMetrics(dateRange);

  const totalConvs = filteredConversations.length;

  // ── Franja de resumen inferior ────────────────────────────────────────────
  const summaryItems = [
    { label: "Convs. totales", value: String(filteredMetrics.totalConversations) },
    { label: "Activas", value: String(filteredMetrics.activeConversations) },
    { label: "Sin responder", value: String(filteredMetrics.unansweredConversations) },
    { label: "Msg / agend.", value: String(filteredMetrics.messagesPerBooking) },
    { label: "Tiempo resp.", value: `${filteredMetrics.avgResponseMin} min` },
    ...(perfMetrics
      ? [
          {
            label: "Llamadas",
            value: String(
              perfMetrics.calls.asistencias + perfMetrics.calls.noShows
            ),
          },
          { label: "Agendas", value: String(perfMetrics.schedules?.totalAgendas ?? 0) },
          { label: "Cierres", value: String(perfMetrics.calls.cierres) },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">

      {/* ── Selector de período ─────────────────────────────────────────────── */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* ── 1. KPI Heroes: 4 métricas principales ──────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <KpiHeroCard
          label="Facturación"
          hint="Total facturado este período"
          value={isLoading ? "—" : formatMoney(financeSummary.facturacion)}
          icon={DollarSign}
          sparkData={facturacionSparkData}
        />
        <KpiHeroCard
          label="Cash Collected"
          hint="Ganancia neta cobrada"
          value={isLoading ? "—" : formatMoney(financeSummary.cashCollected)}
          icon={Wallet}
          sparkData={cashCollectedSparkData}
        />
      </div>

      {/* ── 2. Layout asimétrico: contenido + sidebar ──────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* ── Columna izquierda ─────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Leads */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold">Rendimiento de Leads</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Leads totales"
                value={isLoading ? "—" : (perfMetrics?.leads.leadsCount ?? 0)}
                icon={Users}
              />
              <StatCard
                label="Agendas"
                value={isLoading ? "—" : (perfMetrics?.leads.agendasCount ?? 0)}
                icon={CalendarCheck}
              />
              <StatCard
                label="En nutrición"
                value={isLoading ? "—" : (perfMetrics?.leads.nurturingCount ?? 0)}
                icon={Heart}
              />
              <StatCard
                label="Perdidos"
                value={isLoading ? "—" : (perfMetrics?.leads.lostCount ?? 0)}
                icon={UserMinus}
              />
            </div>
          </section>

          {/* Agendas hero — sparkline violeta al borde inferior */}
          <KpiHeroCard
            label="Agendas totales"
            hint="Tendencia semanal"
            value={isLoading ? "—" : String(perfMetrics?.leads.agendasCount ?? 0)}
            icon={CalendarCheck}
            sparkData={agendasSparkData}
          />

          {/* Llamadas */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold">Rendimiento de Llamadas</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard
                label="Cierres"
                value={isLoading ? "—" : (perfMetrics?.calls.cierres ?? 0)}
                icon={CheckCircle}
              />
              <StatCard
                label="Asistencias"
                value={isLoading ? "—" : (perfMetrics?.calls.asistencias ?? 0)}
                icon={PhoneCall}
              />
              <StatCard
                label="Inasistencias"
                value={isLoading ? "—" : (perfMetrics?.calls.noShows ?? 0)}
                icon={XCircle}
              />
              <StatCard
                label="Seguimientos"
                value={isLoading ? "—" : (perfMetrics?.calls.followUpScheduled ?? 0)}
                icon={CalendarCheck}
              />
              <StatCard
                label="No cierres"
                value={isLoading ? "—" : (perfMetrics?.calls.noCierres ?? 0)}
                icon={XCircle}
              />
              <StatCard
                label="Señas"
                value={isLoading ? "—" : (perfMetrics?.calls.senas ?? "—")}
                icon={Activity}
                dimmed={!perfMetrics?.calls.senas}
              />
            </div>
          </section>

          {/* Tendencia semanal */}
          <ChartShell
            title="Tendencia semanal"
            subtitle="Conversaciones nuevas vs agendadas"
          >
            <div className="h-[180px] w-full overflow-hidden">
              <DualAreaChart
                data={weeklyTrend}
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
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="flex-1 text-xs text-muted-foreground">
                        {s.label}
                      </span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${s.pct}%`, background: s.color }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-medium tabular-nums">
                        {s.pct}% ({s.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartShell>
          )}

          {/* Embudo de conversión */}
          {funnelStages.length >= 2 && (
            <ChartShell
              title="Embudo de conversión"
              subtitle="Leads → Agendas → Asistencias → Cierres"
            >
              <div className="h-[140px]">
                <FunnelChartPanel
                  stages={funnelStages}
                  orientation="horizontal"
                  className="h-[140px]"
                />
              </div>
            </ChartShell>
          )}

          {/* Ranking de closers */}
          <CloserPerformancePanel closers={filteredMetrics.closerBreakdown} />

          {/* Equipo de ventas */}
          <SalesTeamPerformanceSection />
        </div>

        {/* ── Sidebar derecho ──────────────────────────────────────────────── */}
        <div className="space-y-4">

          <h3 className="text-[13px] font-semibold">Tasas de conversión</h3>

          <GaugeSideCard
            label="Tasa de agendamiento"
            value={filteredMetrics.bookingRate}
            target="Objetivo: 70%"
          />

          <GaugeSideCard
            label="Tasa de fantasma"
            value={filteredMetrics.ghostingRate}
            target="Objetivo: <20%"
          />

          {/* Tiempo de respuesta */}
          <GlassPanel className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tiempo de respuesta
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {filteredMetrics.avgResponseMin} min
              </p>
              <p className="text-[11px] text-muted-foreground">Objetivo: &lt;10 min</p>
            </div>
          </GlassPanel>

          {/* Motivos de no cierre */}
          <div className="space-y-1.5">
            <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Motivos de no cierre
            </p>
            <FrequentObjectionsSection initialData={frequentObjections} />
          </div>

          {/* Estado de conversaciones */}
          {convStatusSlices.length > 0 && (
            <GlassPanel className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Conversaciones
                </p>
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
                    <div
                      key={s.label}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {s.label}
                        </span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Eficiencia operativa */}
          <GlassPanel className="space-y-3 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Eficiencia operativa
            </p>
            <div className="divide-y divide-border">
              {[
                {
                  label: "Msg / agendamiento",
                  value: String(filteredMetrics.messagesPerBooking),
                  sub: "Mensajes promedio hasta agenda",
                },
                {
                  label: "Sin responder",
                  value: String(filteredMetrics.unansweredConversations),
                  sub: `de ${filteredMetrics.totalConversations} totales`,
                },
                {
                  label: "Activas",
                  value: String(filteredMetrics.activeConversations),
                },
              ].map((row) => (
                <div key={row.label} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="text-xl font-bold tabular-nums">{row.value}</p>
                  {row.sub && (
                    <p className="text-[10px] text-muted-foreground">{row.sub}</p>
                  )}
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ── Franja de resumen ─────────────────────────────────────────────── */}
      <SummaryStrip items={summaryItems} />
    </div>
  );
}
