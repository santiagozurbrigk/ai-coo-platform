"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@ai-coo/ui";
import {
  CategoryBarChart,
  GaugeTargetChart,
  InteractiveDualAreaChart,
  MetricChartPanel,
  RingDistributionChart,
} from "@/components/charts/platform";
import type { PieData } from "@/components/charts/pie-context";
import { expenseSegmentColors } from "@/lib/chart/colors";
import { useFinanceData } from "@/providers";
import { usePlatformData } from "@/providers/platform-data-provider";
import { formatMoney } from "@/lib/finance/format";
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
import { BentoCellPlace, BentoGrid } from "@/components/shared/bento-grid";
import { FacturacionPeriodFilter } from "./facturacion-period-filter";

export function FinanceMetrics() {
  const {
    clients,
    closingCalls,
    clientsLoading,
    closingCallsLoading,
  } = usePlatformData();
  const { paymentPlatforms, expensesSummary, monthlySeries } = useFinanceData();

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

  const dualRows = useMemo(
    () =>
      monthlySeries.map((m) => ({
        label: m.month,
        primary: m.facturacion,
        secondary: m.cashCollected,
      })),
    [monthlySeries]
  );

  const expenseSlices: PieData[] = useMemo(
    () =>
      [
        {
          label: "Gastos fijos",
          value: expensesSummary.fixedMonthly,
          color: expenseSegmentColors[0],
        },
        {
          label: "Suscripciones",
          value: expensesSummary.subscriptionsMonthly,
          color: expenseSegmentColors[1],
        },
        {
          label: "Equipo",
          value: expensesSummary.teamFixedMonthly + expensesSummary.teamCommissionsMonthly,
          color: expenseSegmentColors[2],
        },
      ].filter((s) => s.value > 0),
    [expensesSummary]
  );

  const s = summary;

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
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

      <GlassPanel className="relative overflow-hidden p-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between bg-gradient-to-b from-background/95 via-background/60 to-transparent px-4 pb-8 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Facturación
            </p>
            <p className="metric-value text-2xl tabular-nums">
              {formatMoney(s.facturacion)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cash Collected
            </p>
            <p className="metric-value text-2xl tabular-nums">
              {formatMoney(s.cashCollected)}
            </p>
          </div>
        </div>
        <div className="min-h-[280px] px-2 pb-4 pt-16">
          <InteractiveDualAreaChart
            data={dualRows}
            primaryKey="facturacion"
            secondaryKey="cashCollected"
            primaryLabel="Facturación"
            secondaryLabel="Cash collected"
            primaryColor="var(--chart-1)"
            secondaryColor="var(--chart-2)"
            emptyMessage="Sin suficientes meses para el gráfico"
          />
        </div>
      </GlassPanel>

      <BentoGrid>
        <BentoCellPlace className="col-span-2 row-span-2 lg:col-span-2 lg:row-span-2">
          <MetricChartPanel
            title="Margen"
            value={`${s.margenPercent.toFixed(1)}%`}
            subtitle="Objetivo 60%"
            className="min-h-[280px]"
          >
            <GaugeTargetChart
              value={s.margenPercent}
              max={100}
              target={60}
              label="Margen"
              variant="margin"
            />
          </MetricChartPanel>
        </BentoCellPlace>

        <BentoCellPlace className="col-span-2 row-span-1 lg:col-span-2 lg:col-start-3 lg:row-start-1">
          <MetricChartPanel
            title="Por cobrar"
            value={formatMoney(s.porCobrar)}
            subtitle="Cuotas pendientes por mes"
            className="min-h-[140px]"
          >
            <CategoryBarChart
              items={s.porCobrarByMonth.map((m) => ({
                label: m.month,
                value: m.amount,
              }))}
              className="min-h-[120px]"
            />
          </MetricChartPanel>
        </BentoCellPlace>

        <BentoCellPlace className="col-span-2 row-span-1 lg:col-span-2 lg:col-start-3 lg:row-start-2">
          <MetricChartPanel
            title="Gastos (período)"
            value={formatMoney(s.gastosTotales)}
            subtitle="Distribución mensual estimada"
            className="min-h-[140px]"
          >
            <RingDistributionChart
              slices={expenseSlices}
              centerValue={formatMoney(expensesSummary.totalMonthly)}
              centerLabel="/ mes"
              emptyMessage="Sin gastos configurados"
            />
          </MetricChartPanel>
        </BentoCellPlace>
      </BentoGrid>
    </div>
  );
}
