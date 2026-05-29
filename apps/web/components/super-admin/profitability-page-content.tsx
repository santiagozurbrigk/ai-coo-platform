"use client";

import { useState } from "react";
import { MetricCard, Sparkline } from "@ai-coo/ui";
import { formatUsdPrecise } from "@/lib/super-admin/org-metrics";
import type {
  AdminProfitabilityOrgRow,
  AdminProfitabilitySummary,
  TokenUsageBreakdown,
} from "@/types/super-admin";
import type { SuperAdminPeriod } from "@/lib/super-admin/period";

const PERIODS: { key: SuperAdminPeriod; label: string }[] = [
  { key: "day", label: "Hoy" },
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
  { key: "year", label: "Este año" },
];

function TrendIcon({ trend }: { trend: AdminProfitabilityOrgRow["trend"] }) {
  if (trend === "up") return <span className="text-emerald-600">↑</span>;
  if (trend === "down") return <span className="text-red-500">↓</span>;
  return <span className="text-muted-foreground">→</span>;
}

export function ProfitabilityPageContent({
  summary,
  orgRows,
  breakdownByPeriod,
  dailyCosts,
}: {
  summary: AdminProfitabilitySummary;
  orgRows: AdminProfitabilityOrgRow[];
  breakdownByPeriod: Record<SuperAdminPeriod, TokenUsageBreakdown>;
  dailyCosts: { date: string; orgId: string; orgName: string; costUsd: number }[];
}) {
  const [period, setPeriod] = useState<SuperAdminPeriod>("month");
  const breakdown = breakdownByPeriod[period];

  const marginPct =
    summary.totalMrrUsd > 0
      ? (
          (summary.estimatedGrossMarginUsd / summary.totalMrrUsd) *
          100
        ).toFixed(1)
      : "—";

  const dates = [...new Set(dailyCosts.map((d) => d.date))].sort();
  const orgNames = [...new Set(dailyCosts.map((d) => d.orgName))];
  const chartSeries = dates.map((date) => {
    const dayTotal = dailyCosts
      .filter((d) => d.date === date)
      .reduce((s, d) => s + d.costUsd, 0);
    return dayTotal;
  });

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="MRR total"
          value={formatUsdPrecise(summary.totalMrrUsd)}
          subtitle="Orgs activas"
        />
        <MetricCard
          title="Costo tokens (mes)"
          value={formatUsdPrecise(summary.totalTokenCostMonthUsd)}
        />
        <MetricCard
          title="Margen bruto est."
          value={formatUsdPrecise(summary.estimatedGrossMarginUsd)}
          subtitle={`${marginPct}% sobre MRR`}
        />
        <MetricCard
          title="Organizaciones activas"
          value={String(summary.activeOrganizations)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Organización</th>
              <th className="px-4 py-3">MRR</th>
              <th className="px-4 py-3">Tokens mes</th>
              <th className="px-4 py-3">Tokens mes ant.</th>
              <th className="px-4 py-3">Margen est.</th>
              <th className="px-4 py-3">Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {orgRows.map((row) => (
              <tr key={row.orgId} className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">{row.orgName}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatUsdPrecise(row.mrrUsd)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatUsdPrecise(row.tokenCostMonthUsd)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatUsdPrecise(row.tokenCostPrevMonthUsd)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatUsdPrecise(row.estimatedMarginUsd)}
                </td>
                <td className="px-4 py-3">
                  <TrendIcon trend={row.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold">Detalle de token usage</h3>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                period === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            title="Input tokens"
            value={breakdown.inputTokens.toLocaleString("es")}
          />
          <MetricCard
            title="Output tokens"
            value={breakdown.outputTokens.toLocaleString("es")}
          />
          <MetricCard
            title="Costo total USD"
            value={formatUsdPrecise(breakdown.totalCostUsd)}
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <BreakdownList
            title="Por modelo"
            items={breakdown.byModel.map((m) => ({
              label: m.model,
              tokens: m.tokens,
              cost: m.costUsd,
            }))}
          />
          <BreakdownList
            title="Por feature"
            items={breakdown.byFeature.map((f) => ({
              label: f.feature,
              tokens: f.tokens,
              cost: f.costUsd,
            }))}
          />
        </div>
      </section>

      {chartSeries.length > 0 && (
        <section className="rounded-xl border border-border/60 p-6">
          <h3 className="text-sm font-semibold">
            Costo diario (30 días) — todas las orgs
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {orgNames.slice(0, 5).join(", ")}
            {orgNames.length > 5 ? ` +${orgNames.length - 5} más` : ""}
          </p>
          <div className="mt-4 h-20 max-w-2xl">
            <Sparkline data={chartSeries} color="hsl(var(--primary))" />
          </div>
        </section>
      )}
    </div>
  );
}

function BreakdownList({
  title,
  items,
}: {
  title: string;
  items: { label: string; tokens: number; cost: number }[];
}) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm">
        {items.length === 0 && (
          <li className="text-muted-foreground">Sin datos en este período.</li>
        )}
        {items.map((item) => (
          <li key={item.label} className="flex justify-between gap-2">
            <span>{item.label}</span>
            <span className="text-muted-foreground tabular-nums">
              {item.tokens.toLocaleString("es")} — {formatUsdPrecise(item.cost)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
