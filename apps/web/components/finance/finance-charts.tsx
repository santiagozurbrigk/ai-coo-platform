"use client";

import { useFinanceData } from "@/providers";
import { formatMoney } from "@/lib/finance/format";
import { expenseSegmentColors, platformRingColors } from "@/lib/chart/colors";
import type { ExpensesSummary } from "@/types/expenses";
import type { MonthlySeriesPoint } from "@/types/finance";
import {
  ChartShell,
  DualAreaChart,
  GaugeMetricChart,
  PieDistributionChart,
  StackedBarChart,
  TrendLineChart,
} from "@/components/charts/platform";
import type { PieData } from "@/components/charts/pie-context";

export function FinanceCharts() {
  const { monthlySeries, financeSummary, paymentPlatforms, expensesSummary } =
    useFinanceData();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FacturacionVsCashChart data={monthlySeries} />
      <PorCobrarSteppedChart months={financeSummary.porCobrarByMonth} />
      <ExpensePieChart expenses={expensesSummary} />
      <PlatformPieChart
        platforms={paymentPlatforms}
        balances={financeSummary.platformBalances}
      />
      <MarginGaugeChart data={monthlySeries} />
      <RevenueStackedChart data={monthlySeries} />
    </div>
  );
}

function FacturacionVsCashChart({ data }: { data: MonthlySeriesPoint[] }) {
  const rows = data.map((d) => ({
    label: d.month,
    primary: d.facturacion,
    secondary: d.cashCollected,
  }));

  return (
    <ChartShell
      title="Facturación vs Cash Collected"
      subtitle="Área dual · el espacio entre curvas ≈ gastos"
      className="lg:col-span-2"
    >
      <DualAreaChart
        data={rows}
        primaryKey="facturacion"
        secondaryKey="cashCollected"
        primaryLabel="Facturación"
        secondaryLabel="Cash collected"
      />
    </ChartShell>
  );
}

function PorCobrarSteppedChart({
  months,
}: {
  months: { month: string; amount: number }[];
}) {
  const trend = months.map((m) => ({ label: m.month, value: m.amount }));

  return (
    <ChartShell
      title="Por cobrar acumulado"
      subtitle="Línea · cuentas pendientes por mes"
    >
      <TrendLineChart data={trend} dataKey="value" />
    </ChartShell>
  );
}

function ExpensePieChart({ expenses }: { expenses: ExpensesSummary }) {
  const slices: PieData[] = [
    { label: "Gastos fijos", value: expenses.fixedMonthly, color: expenseSegmentColors[0] },
    {
      label: "Suscripciones",
      value: expenses.subscriptionsMonthly,
      color: expenseSegmentColors[1],
    },
    {
      label: "Salarios",
      value: expenses.teamFixedMonthly,
      color: expenseSegmentColors[2],
    },
    {
      label: "Comisiones",
      value: expenses.teamCommissionsMonthly,
      color: expenseSegmentColors[3],
    },
  ].filter((s) => s.value > 0);

  return (
    <ChartShell
      title="Distribución de gastos"
      subtitle="Pie · composición del burn mensual"
    >
      <PieDistributionChart slices={slices.length ? slices : [{ label: "—", value: 1 }]} />
      <p className="text-center text-sm font-semibold tabular-nums">
        {formatMoney(expenses.totalMonthly)} / mes
      </p>
    </ChartShell>
  );
}

function PlatformPieChart({
  platforms,
  balances,
}: {
  platforms: { id: string; name: string; currency: string }[];
  balances: { platformId: string; amount: number }[];
}) {
  const slices: PieData[] = platforms.map((p, i) => ({
    label: p.name,
    value: balances.find((b) => b.platformId === p.id)?.amount ?? 0,
    color: platformRingColors[i % platformRingColors.length],
  }));

  return (
    <ChartShell
      title="Ingresos por plataforma"
      subtitle="Pie · volumen por pasarela"
    >
      <PieDistributionChart slices={slices} innerRadius={48} />
      <div className="flex flex-wrap justify-center gap-2 text-xs">
        {platforms.map((p) => {
          const amount = balances.find((b) => b.platformId === p.id)?.amount ?? 0;
          return (
            <span key={p.id}>
              {p.name}: {formatMoney(amount, p.currency)}
            </span>
          );
        })}
      </div>
    </ChartShell>
  );
}

function MarginGaugeChart({ data }: { data: MonthlySeriesPoint[] }) {
  const latest = data[data.length - 1]?.marginPercent ?? 0;
  const threshold = 60;

  return (
    <ChartShell
      title="Salud del margen"
      subtitle={`Gauge · último mes vs objetivo ${threshold}%`}
    >
      <GaugeMetricChart value={latest} max={100} label="Margen %" suffix="%" />
      <p className="text-center text-xs text-muted-foreground">
        Objetivo: {threshold}% · Actual: {latest.toFixed(1)}%
      </p>
    </ChartShell>
  );
}

function RevenueStackedChart({ data }: { data: MonthlySeriesPoint[] }) {
  const rows = data.map((d) => ({
    month: d.month,
    upfront: d.upfront,
    installments: d.installments,
    fees: d.fees,
  }));

  return (
    <ChartShell
      title="Facturación por tipo de pago"
      subtitle="Barras apiladas · upfront, cuotas y fees"
      className="lg:col-span-2"
    >
      <StackedBarChart
        data={rows}
        keys={["upfront", "installments", "fees"]}
        labels={["Upfront", "Cuotas cobradas", "Fees"]}
      />
    </ChartShell>
  );
}
