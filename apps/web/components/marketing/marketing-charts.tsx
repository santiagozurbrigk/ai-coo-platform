"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { TopConvertingItem } from "@/lib/marketing/overview-metrics";
import { CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import type {
  ContentFunnelStage,
  ContentTypePerformance,
  FollowerGrowthPoint,
  HeatmapCell,
  MarketingTimePoint,
} from "@/types/marketing-insights";
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
      className="h-full min-h-[280px]"
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
  ranked: TopConvertingItem[];
}) {
  const max = Math.max(...ranked.map((r) => r.conversations), 1);
  const barItems = ranked.map((item) => ({
    label: item.title.slice(0, 18),
    value: item.conversations,
  }));

  const typeLabel = (type: string | null) => {
    const key = (type ?? "post") as keyof typeof CONTENT_TYPE_LABEL;
    return CONTENT_TYPE_LABEL[key] ?? type ?? "Contenido";
  };

  return (
    <ChartShell
      title="Contenido que más convierte"
      subtitle="Ranking por engagement y conversaciones"
      className="w-full min-h-[320px]"
    >
      <CategoryBarChart
        className="min-h-[200px] w-full"
        items={barItems}
        horizontal
        barFill="var(--chart-bar-mono)"
      />
      <div className="mt-4 space-y-3">
        {ranked.map((item, i) => {
          const borderColors = [
            "border-l-primary shadow-[0_0_20px_hsl(var(--primary)/0.25)]",
            "border-l-[var(--chart-2)]",
            "border-l-[var(--chart-3)]",
            "border-l-muted",
          ];
          const widthPct = (item.conversations / max) * 100;
          return (
            <Link
              key={item.contentId}
              href={paths.platform.marketing.contentDetail(item.contentId)}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border border-l-4 bg-card p-3 transition-all hover:border-primary/40",
                borderColors[i] ?? "border-l-muted"
              )}
            >
              <span className="w-6 shrink-0 text-lg font-bold text-muted-foreground">
                {i + 1}
              </span>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/40">
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {typeLabel(item.contentType)} · {item.conversations} convs ·{" "}
                  {item.bookings} bookings
                </p>
              </div>
              <div className="flex w-28 shrink-0 flex-col justify-center gap-1 pl-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[var(--chart-bar-mono)]"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="text-right text-[10px] tabular-nums text-muted-foreground">
                  {item.conversations}
                </span>
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
      className="w-full"
    >
      <div className="funnel-container flex w-full min-h-[280px] justify-center overflow-visible px-2 py-4">
        <FunnelChartPanel
          stages={funnelData}
          color="var(--chart-1)"
          orientation="horizontal"
        />
      </div>
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
      className="min-h-[360px]"
    >
      <div className="flex min-h-[300px] items-center justify-center py-4">
        <RadarPerformanceChart metrics={metrics} series={series} />
      </div>
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
      className="min-h-[320px]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <CategoryBarChart items={byDay} className="min-h-[160px] flex-1 lg:max-w-[42%]" />
        <div className="min-h-[120px] flex-1 overflow-x-auto">
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
      <div className="min-h-[240px] px-6">
        <TrendLineChart data={trend} />
      </div>
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
