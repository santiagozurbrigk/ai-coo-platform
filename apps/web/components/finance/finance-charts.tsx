"use client";

import { useFinanceData } from "@/providers";
import { formatMoney } from "@/lib/finance/format";
import { chartSeriesColors } from "@/lib/chart/colors";
import type { MonthlySeriesPoint } from "@/types/finance";
import {
  ChartShell,
  PieDistributionChart,
  StackedBarChart,
} from "@/components/charts/platform";
import type { PieData } from "@/components/charts/pie-context";
import { cn } from "@ai-coo/ui";

export function FinanceCharts() {
  const { monthlySeries, financeSummary, paymentPlatforms } = useFinanceData();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RevenueStackedChart data={monthlySeries} />
      <PlatformPieChart
        platforms={paymentPlatforms}
        balances={financeSummary.platformBalances}
      />
    </div>
  );
}

function PlatformPieChart({
  platforms,
  balances,
}: {
  platforms: { id: string; name: string; currency: string }[];
  balances: { platformId: string; amount: number }[];
}) {
  const slices: PieData[] = platforms
    .map((p, i) => ({
      label: p.name,
      value: balances.find((b) => b.platformId === p.id)?.amount ?? 0,
      color: chartSeriesColors[i % chartSeriesColors.length],
    }))
    .filter((s) => s.value > 0);

  const showPie = slices.length >= 2;

  return (
    <ChartShell
      title="Ingresos por plataforma"
      subtitle={
        showPie ? "Pie · volumen por pasarela" : "Listado · volumen por pasarela"
      }
    >
      {showPie ? (
        <PieDistributionChart slices={slices} innerRadius={48} />
      ) : (
        <ul className="space-y-3 py-2">
          {platforms.map((p) => {
            const amount =
              balances.find((b) => b.platformId === p.id)?.amount ?? 0;
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="text-muted-foreground">
                  {p.name} ({p.currency})
                </span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatMoney(amount, p.currency)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {showPie ? (
        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          {platforms.map((p) => {
            const amount =
              balances.find((b) => b.platformId === p.id)?.amount ?? 0;
            return (
              <span key={p.id}>
                {p.name}: {formatMoney(amount, p.currency)}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-2xs text-muted-foreground">
          El gráfico circular aparece cuando hay 2 o más plataformas con ingresos.
        </p>
      )}
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
  const periodCount = rows.length;
  const compact = periodCount <= 2;

  return (
    <ChartShell
      title="Facturación por tipo de pago"
      subtitle="Barras apiladas · upfront, cuotas y fees"
      className="lg:col-span-2"
    >
      <div className={cn(compact ? "min-h-[200px]" : "min-h-[240px]")}>
        <StackedBarChart
          data={rows}
          keys={["upfront", "installments", "fees"]}
          labels={["Upfront", "Cuotas cobradas", "Fees"]}
          minHeight={compact ? "min-h-[200px]" : undefined}
          yDomainPadding={1.3}
        />
      </div>
      {compact ? (
        <p className="mt-2 text-center text-2xs text-muted-foreground">
          Mostrando datos desde que se conectó el sistema
        </p>
      ) : null}
    </ChartShell>
  );
}
