"use client";

import { useState } from "react";
import { FilterPills } from "@/components/marketing/filter-pills";
import { Panel } from "@/components/shared/panel";
import {
  mockContentMetricsByType,
  type ContentTypeMetrics,
  type OrganicContentType,
} from "@/mocks/marketing-content-types";

const TYPE_OPTIONS = mockContentMetricsByType.map((m) => ({
  value: m.type,
  label: m.label,
}));

function formatReach(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function MetricsGrid({ metrics }: { metrics: ContentTypeMetrics }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCell
        label="Alcance promedio"
        value={formatReach(metrics.avgReach)}
      />
      <MetricCell
        label="Engagement rate"
        value={`${metrics.engagementRate}%`}
      />
      <MetricCell
        label="Conversaciones generadas"
        value={String(metrics.conversationsGenerated)}
      />
      <MetricCell
        label="Mejor horario"
        value={metrics.bestPublishWindow}
      />
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 dark:border-white/[0.08]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function ContentTypeSegmentPanel() {
  const [selected, setSelected] = useState<OrganicContentType>("reels");
  const metrics =
    mockContentMetricsByType.find((m) => m.type === selected) ??
    mockContentMetricsByType[0]!;

  return (
    <Panel
      title="Métricas por tipo de contenido"
      subtitle="Segmentado por formato orgánico — mock"
    >
      <FilterPills
        options={TYPE_OPTIONS}
        value={selected}
        onChange={(v) => setSelected(v as OrganicContentType)}
      />
      <div className="mt-4">
        <MetricsGrid metrics={metrics} />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs text-muted-foreground dark:border-white/[0.08]">
              <th className="pb-2 pr-4 font-medium">Formato</th>
              <th className="pb-2 pr-4 font-medium">Alcance</th>
              <th className="pb-2 pr-4 font-medium">Engagement</th>
              <th className="pb-2 pr-4 font-medium">Conversaciones</th>
              <th className="pb-2 font-medium">Mejor horario</th>
            </tr>
          </thead>
          <tbody>
            {mockContentMetricsByType.map((row) => (
              <tr
                key={row.type}
                className={
                  row.type === selected
                    ? "bg-violet-500/10"
                    : undefined
                }
              >
                <td className="py-2 pr-4 font-medium">{row.label}</td>
                <td className="py-2 pr-4 tabular-nums">
                  {formatReach(row.avgReach)}
                </td>
                <td className="py-2 pr-4 tabular-nums">{row.engagementRate}%</td>
                <td className="py-2 pr-4 tabular-nums">
                  {row.conversationsGenerated}
                </td>
                <td className="py-2 text-muted-foreground">
                  {row.bestPublishWindow}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
