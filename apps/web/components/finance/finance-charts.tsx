"use client";

import { useFinanceData } from "@/providers";
import { formatMoney } from "@/lib/finance/format";
import { platformRingColors } from "@/lib/chart/colors";
import type { MonthlySeriesPoint } from "@/types/finance";
import {
  ChartShell,
  PieDistributionChart,
  StackedBarChart,
} from "@/components/charts/platform";
import type { PieData } from "@/components/charts/pie-context";

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
      color: platformRingColors[i % platformRingColors.length],
    }))
    .filter((s) => s.value > 0);

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
      <div className="min-h-[240px]">
        <StackedBarChart
          data={rows}
          keys={["upfront", "installments", "fees"]}
          labels={["Upfront", "Cuotas cobradas", "Fees"]}
        />
      </div>
    </ChartShell>
  );
}
