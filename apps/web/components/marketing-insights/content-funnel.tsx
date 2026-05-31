"use client";

import { Panel } from "@/components/shared/panel";
import { FunnelChartPanel } from "@/components/charts/platform";
import type { FunnelStage } from "@/components/charts/funnel-chart";

export function ContentFunnel({
  stages,
}: {
  stages: { stage: string; value: number; pct: number }[];
}) {
  const funnelData: FunnelStage[] = stages.map((s) => ({
    label: s.stage,
    value: s.value,
    displayValue: `${s.pct}%`,
  }));

  return (
    <Panel title="Embudo de influencia del contenido">
      <FunnelChartPanel stages={funnelData} color="var(--chart-2)" />
    </Panel>
  );
}
