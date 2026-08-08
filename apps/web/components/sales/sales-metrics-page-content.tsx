"use client";

import { useMemo, useState } from "react";
import { SalesMetricsOverview } from "@/components/sales";
import { SalesPerformanceMetricsSection } from "@/components/sales/sales-performance-metrics-section";
import { usePlatformData } from "@/providers";
import { deriveSalesMetrics } from "@/lib/metrics/derive-sales-metrics";
import { RingDistributionChart } from "@/components/charts/platform/ring-distribution-chart";
import { TrendLineChart } from "@/components/charts/platform";
import { ChartShell } from "@/components/charts/platform/chart-shell";
import type { FrequentObjectionsResult } from "@/types/sales";
import { cn } from "@/lib/utils";

type RangeOption = "7d" | "30d" | "90d" | "todo";

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
  { value: "todo", label: "Todo" },
];

function getRangeCutoff(range: RangeOption): Date | null {
  if (range === "todo") return null;
  const d = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  d.setDate(d.getDate() - days);
  return d;
}

export function SalesMetricsPageContent({
  frequentObjections,
}: {
  frequentObjections?: FrequentObjectionsResult;
}) {
  const { salesMetrics, salesMetricsLoading, conversations, closingCalls } =
    usePlatformData();
  const [range, setRange] = useState<RangeOption>("30d");

  const filteredMetrics = useMemo(() => {
    if (range === "todo") return salesMetrics;
    const cutoff = getRangeCutoff(range);
    if (!cutoff) return salesMetrics;
    const filteredConvs = conversations.filter(
      (c) => new Date(c.lastMessageAt) >= cutoff
    );
    const filteredCalls = closingCalls.filter(
      (c) => c.scheduledAt && new Date(c.scheduledAt) >= cutoff
    );
    return deriveSalesMetrics(filteredConvs, filteredCalls);
  }, [range, salesMetrics, conversations, closingCalls]);

  // Conversation status distribution for ring chart
  const convStatusSlices = useMemo(() => {
    const cutoff = getRangeCutoff(range);
    const convs =
      cutoff
        ? conversations.filter((c) => new Date(c.lastMessageAt) >= cutoff)
        : conversations;
    const active = convs.filter((c) => c.status === "active").length;
    const booked = convs.filter(
      (c) =>
        c.status === "booked" ||
        c.tag === "agendado" ||
        c.tag === "closeado"
    ).length;
    const ghosted = convs.filter((c) => c.status === "ghosted").length;
    const closed = convs.filter((c) => c.status === "closed").length;
    return [
      { label: "Activas", value: active, color: "#7C3AED" },
      { label: "Agendadas", value: booked, color: "#10b981" },
      { label: "Ghosted", value: ghosted, color: "#f59e0b" },
      { label: "Cerradas", value: closed, color: "#64748b" },
    ].filter((s) => s.value > 0);
  }, [range, conversations]);

  // Conversations per week for trend line
  const weeklyTrend = useMemo(() => {
    const weeks = 8;
    const now = new Date();
    return Array.from({ length: weeks }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weeks - 1 - i) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const count = conversations.filter((c) => {
        const d = new Date(c.lastMessageAt);
        return d >= weekStart && d < weekEnd;
      }).length;
      const label = `S${i + 1}`;
      return { label, value: count };
    });
  }, [conversations]);

  if (salesMetricsLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
        Cargando métricas de ventas…
      </div>
    );
  }

  const totalConvs =
    convStatusSlices.reduce((s, c) => s + c.value, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Selector de período */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Período:</span>
        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                range === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas de conversaciones */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Conversaciones
        </h3>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total",
              value: filteredMetrics.totalConversations,
            },
            {
              label: "Activas",
              value: filteredMetrics.activeConversations,
            },
            {
              label: "Sin responder",
              value: filteredMetrics.unansweredConversations,
            },
            {
              label: "Msg / agend.",
              value: filteredMetrics.messagesPerBooking,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-3 space-y-1"
            >
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChartShell
            title="Por estado"
            subtitle="Distribución de conversaciones"
            className="min-h-[240px]"
          >
            <div className="flex flex-col items-center gap-3">
              <RingDistributionChart
                slices={convStatusSlices}
                centerValue={String(totalConvs)}
                centerLabel="Total"
                className="max-w-[180px]"
              />
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {convStatusSlices.map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: s.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {s.label} ({s.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartShell>

          <ChartShell
            title="Últimas 8 semanas"
            subtitle="Conversaciones nuevas por semana"
            className="min-h-[240px]"
          >
            <div className="min-h-[160px] px-2">
              <TrendLineChart data={weeklyTrend} />
            </div>
          </ChartShell>
        </div>
      </section>

      <SalesPerformanceMetricsSection />
      <SalesMetricsOverview
        data={filteredMetrics}
        frequentObjections={frequentObjections}
      />
    </div>
  );
}
