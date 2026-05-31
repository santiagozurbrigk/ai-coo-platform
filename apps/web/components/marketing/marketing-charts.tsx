"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@ai-coo/ui";
import { getContentById } from "@/mocks/marketing-insights";
import type {
  ContentFunnelStage,
  ContentTypePerformance,
  FollowerGrowthPoint,
  HeatmapCell,
  MarketingTimePoint,
} from "@/types/marketing-insights";
import { CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import { ContentThumbnail } from "@/components/marketing-insights/content-thumbnail";
import {
  CategoryBarChart,
  ChartShell,
  DualAreaChart,
  FunnelChartPanel,
  RadarPerformanceChart,
  TrendLineChart,
} from "@/components/charts/platform";
import type { FunnelStage } from "@/components/charts/funnel-chart";
import type { RadarData, RadarMetric } from "@/components/charts/radar-context";
import { paths } from "@/routes";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function ReachInteractionsChart({ data }: { data: MarketingTimePoint[] }) {
  const rows = data.map((d) => ({
    label: d.day,
    primary: d.reach,
    secondary: d.interactions,
  }));

  return (
    <ChartShell
      title="Alcance e interacciones"
      subtitle="Área dual · últimos 30 días"
      className="lg:col-span-2"
    >
      <DualAreaChart
        data={rows}
        primaryKey="reach"
        secondaryKey="interactions"
        primaryLabel="Alcance"
        secondaryLabel="Interacciones"
      />
    </ChartShell>
  );
}

export function TopConvertingContentList({
  ranked,
}: {
  ranked: { contentId: string; conversations: number; bookings: number }[];
}) {
  const max = Math.max(...ranked.map((r) => r.conversations), 1);
  return (
    <ChartShell
      title="Contenido que más convierte"
      subtitle="Ranking + barras por conversaciones"
    >
      <CategoryBarChart
        className="mb-4"
        items={ranked
          .map((item) => {
            const content = getContentById(item.contentId);
            if (!content) return null;
            return {
              label: content.title.slice(0, 18),
              value: item.conversations,
            };
          })
          .filter((x): x is { label: string; value: number } => x != null)}
        horizontal
      />
      <div className="space-y-3">
        {ranked.map((item, i) => {
          const content = getContentById(item.contentId);
          if (!content) return null;
          const borderColors = [
            "border-l-primary shadow-[0_0_20px_hsl(var(--primary)/0.25)]",
            "border-l-[var(--chart-2)]",
            "border-l-[var(--chart-3)]",
            "border-l-muted",
          ];
          const widthPct = (item.conversations / max) * 100;
          return (
            <Link
              key={content.id}
              href={paths.platform.marketing.contentDetail(content.id)}
              className={cn(
                "flex gap-3 rounded-lg border border-border border-l-4 p-3 transition-all hover:scale-[1.01] hover:border-primary/40",
                borderColors[i] ?? "border-l-muted"
              )}
            >
              <span className="w-6 text-lg font-bold text-muted-foreground">
                {i + 1}
              </span>
              <ContentThumbnail content={content} size="sm" className="h-14 w-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{content.title}</p>
                <p className="text-xs text-muted-foreground">
                  {CONTENT_TYPE_LABEL[content.type]} · {item.conversations} convs ·{" "}
                  {item.bookings} bookings
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[var(--chart-1)]"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </ChartShell>
  );
}

export function ContentFunnelChart({ stages }: { stages: ContentFunnelStage[] }) {
  const funnelData: FunnelStage[] = stages.map((s) => ({
    label: s.stage,
    value: s.value,
    displayValue: s.conversionToNextPct != null ? `${s.conversionToNextPct}%` : undefined,
  }));

  return (
    <ChartShell
      title="Funnel de contenido a venta"
      subtitle="Embudo animado · conversión entre etapas"
    >
      <FunnelChartPanel stages={funnelData} color="var(--chart-1)" />
    </ChartShell>
  );
}

export function TypeRadarChart({ types }: { types: ContentTypePerformance[] }) {
  const metrics: RadarMetric[] = types.map((t) => ({
    key: t.type,
    label: CONTENT_TYPE_LABEL[t.type],
  }));

  const reachMax = Math.max(...types.map((t) => t.reach), 1);
  const convMax = Math.max(...types.map((t) => t.conversions), 1);

  const series: RadarData[] = [
    {
      label: "Alcance",
      color: "var(--chart-1)",
      values: Object.fromEntries(
        types.map((t) => [t.type, Math.round((t.reach / reachMax) * 100)])
      ),
    },
    {
      label: "Conversiones",
      color: "var(--chart-3)",
      values: Object.fromEntries(
        types.map((t) => [t.type, Math.round((t.conversions / convMax) * 100)])
      ),
    },
  ];

  return (
    <ChartShell
      title="Performance por tipo"
      subtitle="Radar · alcance vs conversiones normalizadas"
    >
      <RadarPerformanceChart metrics={metrics} series={series} />
      <div className="flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-1)]" /> Alcance
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-3)]" /> Conversiones
        </span>
      </div>
    </ChartShell>
  );
}

export function PublishHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const [tip, setTip] = useState<HeatmapCell | null>(null);

  const byDay = useMemo(() => {
    const sums = DAY_LABELS.map((_, day) => {
      const dayCells = cells.filter((c) => c.day === day);
      const avg =
        dayCells.length > 0
          ? dayCells.reduce((s, c) => s + c.engagement, 0) / dayCells.length
          : 0;
      return { label: DAY_LABELS[day], value: Math.round(avg * 100) };
    });
    return sums;
  }, [cells]);

  return (
    <ChartShell
      title="Mejores días y horarios"
      subtitle="Barras por día + mapa de calor horario"
    >
      <CategoryBarChart items={byDay} />
      <div className="mt-4 overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
        >
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[9px] text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {cells.map((cell) => (
            <button
              key={`${cell.day}-${cell.hour}`}
              type="button"
              className="h-3 w-6 rounded-sm transition-transform hover:scale-110"
              style={{
                background: `color-mix(in oklch, var(--chart-1) ${8 + cell.engagement * 92}%, transparent)`,
              }}
              onMouseEnter={() => setTip(cell)}
              onMouseLeave={() => setTip(null)}
            />
          ))}
        </div>
      </div>
      {tip && (
        <p className="text-center text-xs text-muted-foreground">
          {DAY_LABELS[tip.day]} {tip.hour}:00 — engagement{" "}
          {(tip.engagement * 100).toFixed(0)}%
        </p>
      )}
    </ChartShell>
  );
}

export function FollowerGrowthChart({ data }: { data: FollowerGrowthPoint[] }) {
  const trend = data.map((d) => ({ label: d.week, value: d.followers }));

  return (
    <ChartShell
      title="Crecimiento de seguidores"
      subtitle="Línea con marcadores · últimas 8 semanas"
    >
      <TrendLineChart data={trend} />
      {data
        .filter((d) => d.spikeLabel)
        .map((d) => (
          <p
            key={d.week}
            className="border-l-2 border-primary pl-2 text-xs text-muted-foreground"
          >
            {d.spikeLabel}
          </p>
        ))}
    </ChartShell>
  );
}
