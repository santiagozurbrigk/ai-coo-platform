"use client";

import { MetricCard } from "@ai-coo/ui";
import { CategoryBarChart } from "@/components/charts/platform";
import { formatUsdPrecise } from "@/lib/super-admin/org-metrics";
import type { AdminAiCostDashboard } from "@/types/super-admin";

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
  trial: "Trial",
};

export function AiCostDashboardContent({
  data,
}: {
  data: AdminAiCostDashboard;
}) {
  const { summary, organizations, profitabilityChart } = data;

  const chartItems = profitabilityChart.map((row) => ({
    label: row.orgName.split(" ")[0] ?? row.orgName,
    value: row.marginUsd,
  }));

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="MRR total"
          value={formatUsdPrecise(summary.totalMrrUsd)}
          subtitle={`${summary.activeOrganizations} orgs activas`}
        />
        <MetricCard
          title="Costo total infra"
          value={formatUsdPrecise(summary.totalInfraCostUsd)}
          subtitle="Storage + infra estimada"
        />
        <MetricCard
          title="Costo IA (mes)"
          value={formatUsdPrecise(summary.totalTokenCostMonthUsd)}
          subtitle="Claude + embeddings"
        />
        <MetricCard
          title="Margen global"
          value={formatUsdPrecise(summary.estimatedGrossMarginUsd)}
          subtitle={`${summary.globalMarginPercent.toFixed(1)}% sobre MRR`}
          trend="up"
        />
      </div>

      <section className="rounded-xl border border-border/60 dark:border-white/[0.08]">
        <div className="border-b border-border/60 px-4 py-3 dark:border-white/[0.08]">
          <h3 className="text-sm font-semibold">Costo por organización</h3>
          <p className="text-xs text-muted-foreground">
            Claude (Haiku + Sonnet + Opus), embeddings, storage e infraestructura
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Organización</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Haiku</th>
                <th className="px-4 py-3">Sonnet</th>
                <th className="px-4 py-3">Opus</th>
                <th className="px-4 py-3">Embeddings</th>
                <th className="px-4 py-3">Storage</th>
                <th className="px-4 py-3">Infra</th>
                <th className="px-4 py-3">Total mes</th>
                <th className="px-4 py-3">Margen</th>
                <th className="px-4 py-3">%</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((row) => (
                <tr
                  key={row.orgId}
                  className="border-t border-border/40 dark:border-white/[0.06]"
                >
                  <td className="px-4 py-3 font-medium">{row.orgName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {PLAN_LABEL[row.plan] ?? row.plan}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatUsdPrecise(row.claudeHaikuUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatUsdPrecise(row.claudeSonnetUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatUsdPrecise(row.claudeOpusUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatUsdPrecise(row.embeddingsUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatUsdPrecise(row.storageUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatUsdPrecise(row.infrastructureUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium">
                    {formatUsdPrecise(row.totalMonthUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatUsdPrecise(row.marginUsd)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-400">
                    {row.marginPercent.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 p-6 dark:border-white/[0.08]">
        <h3 className="text-sm font-semibold">Rentabilidad por cliente</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Margen estimado (MRR − costo total del mes)
        </p>
        <div className="mt-4 min-h-[200px] max-w-3xl">
          <CategoryBarChart items={chartItems} horizontal className="min-h-[200px]" />
        </div>
      </section>
    </div>
  );
}
