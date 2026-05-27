"use client";

import { useMemo, useState } from "react";
import { GlassPanel, MetricCard, Sparkline, cn } from "@ai-coo/ui";
import { useFinanceData } from "@/providers";
import { usePlatformData } from "@/providers/platform-data-provider";
import { formatMoney } from "@/lib/finance/format";
import { sparklineProps } from "@/lib/metrics/sparkline-series";
import { deriveFinanceSummary } from "@/lib/metrics/derive-finance-summary";
import {
  collectRevenueEvents,
  filterRevenueEvents,
} from "@/lib/metrics/revenue-events";
import {
  DEFAULT_REVENUE_RANGE,
  resolveRevenueDateRange,
  type RevenueDateRange,
} from "@/lib/metrics/revenue-period";
import { FacturacionPeriodFilter } from "./facturacion-period-filter";

function MarginArc({ percent }: { percent: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const display = Math.min(Math.max(percent, 0), 100);
  const offset = c * (1 - display / 100);
  return (
    <svg width="88" height="88" className="shrink-0">
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="currentColor"
        className="text-muted/30"
        strokeWidth="8"
      />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="url(#marginGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
        className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
      />
      <defs>
        <linearGradient id="marginGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--chart-tertiary))" />
        </linearGradient>
      </defs>
      <text
        x="44"
        y="48"
        textAnchor="middle"
        className="fill-foreground text-sm font-semibold"
        fontSize="14"
      >
        {percent.toFixed(1)}%
      </text>
    </svg>
  );
}

export function FinanceMetrics() {
  const {
    clients,
    closingCalls,
    clientsLoading,
    closingCallsLoading,
  } = usePlatformData();
  const { paymentPlatforms, expensesSummary } = useFinanceData();

  const [revenueRange, setRevenueRange] =
    useState<RevenueDateRange>(DEFAULT_REVENUE_RANGE);

  const loading = clientsLoading || closingCallsLoading;

  const summary = useMemo(() => {
    return deriveFinanceSummary(
      clients,
      closingCalls,
      expensesSummary,
      paymentPlatforms,
      revenueRange
    );
  }, [
    clients,
    closingCalls,
    expensesSummary,
    paymentPlatforms,
    revenueRange,
  ]);

  const periodEvents = useMemo(() => {
    const period = resolveRevenueDateRange(revenueRange);
    return filterRevenueEvents(collectRevenueEvents(clients), period);
  }, [clients, revenueRange]);

  const s = summary;
  const marginSpark = sparklineProps("margin", 400);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-white/50">
        Cargando métricas financieras…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FacturacionPeriodFilter
        value={revenueRange}
        onChange={setRevenueRange}
        periodLabel={s.revenuePeriod.label}
        facturacion={s.facturacion}
        formatMoney={(n) => formatMoney(n)}
        eventCount={periodEvents.length}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Cash Collected"
          value={formatMoney(s.cashCollected)}
          subtitle={`Facturación del período − gastos prorrateados (${s.revenuePeriod.dayCount} d)`}
          trend="neutral"
          {...sparklineProps("cashCollected", 100)}
        />

        <GlassPanel className="p-4 space-y-3">
          <MetricCard
            title="Por cobrar"
            value={formatMoney(s.porCobrar)}
            subtitle="Pendiente total · no depende del filtro de fechas"
            {...sparklineProps("porCobrar", 200)}
          />
          <div className="flex items-end justify-between gap-2 pt-1">
            {s.porCobrarByMonth.map((m) => (
              <div key={m.month} className="flex-1 text-center">
                <div
                  className="mx-auto w-full max-w-[48px] rounded-t bg-amber-500/30 border border-amber-500/50"
                  style={{
                    height: `${s.porCobrar > 0 ? 24 + (m.amount / s.porCobrar) * 48 : 24}px`,
                  }}
                />
                <p className="text-[10px] text-muted-foreground mt-1">{m.month}</p>
                <p className="text-xs font-medium tabular-nums">
                  ${(m.amount / 1000).toFixed(1)}k
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <MetricCard
          title="Gastos (período)"
          value={formatMoney(s.gastosTotales)}
          subtitle="Prorrateo del mes según días seleccionados"
          {...sparklineProps("expenses", 300)}
        />

        <GlassPanel className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm text-muted-foreground">Margen</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-2xl font-semibold tabular-nums">
                {s.margenPercent.toFixed(1)}%
              </p>
              <Sparkline
                data={marginSpark.sparklineData}
                color={marginSpark.sparklineColor}
                animationDelay={marginSpark.sparklineAnimationDelay}
                className="h-8 w-full shrink-0 sm:h-10 sm:w-[88px] md:h-11 md:w-[100px]"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              % de la facturación del período que es ganancia
            </p>
          </div>
          <MarginArc percent={s.margenPercent} />
        </GlassPanel>

        <div className="sm:col-span-2 xl:col-span-1 space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">
            Ingresos por plataforma (período)
          </p>
          <div className="grid gap-2">
            {paymentPlatforms.map((p) => {
              const bal = s.platformBalances.find((b) => b.platformId === p.id);
              return (
                <GlassPanel
                  key={p.id}
                  className={cn("p-3 flex items-center justify-between gap-2")}
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.currency}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatMoney(bal?.amount ?? 0, p.currency)}
                  </p>
                </GlassPanel>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
