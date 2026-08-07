"use client";

import {
  Eye,
  Heart,
  FileText,
  MessageCircle,
  UserPlus,
  TrendingUp,
  Link2,
  BarChart3,
  Trophy,
  Activity,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { Button, GlassPanel, cn } from "@ai-coo/ui";
import type { MarketingOverviewContext } from "@/app/marketing/actions";
import type { ContentLabel } from "@/lib/content/label-content";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ChartShell,
  DualAreaChart,
  RadarPerformanceChart,
  FunnelChartPanel,
} from "@/components/charts/platform";
import { ContentLabelDistributionChart } from "@/components/marketing/content-label-distribution-chart";
import { paths } from "@/routes";
import { KpiHeroCard } from "@/components/sales/metrics/kpi-hero-card";
import { UtmAttributionCard } from "./overview/utm-attribution-card";
import { useMarketingOverview } from "./overview/use-marketing-overview";
import type { TopConvertingItem } from "@/lib/marketing/overview-metrics";
import { CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import type { ContentTypePerformance, HeatmapCell } from "@/types/marketing-insights";
import type { RadarData, RadarMetric } from "@/components/charts/radar-context";
import type { FunnelStage } from "@/components/charts/funnel-chart";
import { useMemo, useState } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DistributionData = {
  counts: Record<ContentLabel, number>;
  total: number;
  insight: string | null;
  hasContentAssets: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("es-AR");
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Card de estado vacío uniforme */
function EmptyCell({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <GlassPanel
      className={cn(
        "flex min-h-[180px] flex-col items-center justify-center gap-3 p-6 text-center",
        className
      )}
    >
      <Icon size={20} className="text-muted-foreground/40" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </GlassPanel>
  );
}

// ── Contenido que más convierte (full-width, primera sección) ─────────────────

function TopContentCard({ ranked }: { ranked: TopConvertingItem[] }) {
  if (ranked.length === 0) return null;

  const max = Math.max(...ranked.map((r) => r.conversations), 1);

  const typeLabel = (type: string | null) => {
    const key = (type ?? "post") as keyof typeof CONTENT_TYPE_LABEL;
    return CONTENT_TYPE_LABEL[key] ?? type ?? "Contenido";
  };

  return (
    <GlassPanel className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
          <Trophy size={13} />
        </div>
        <div>
          <h4 className="text-sm font-medium">Contenido que más convierte</h4>
          <p className="text-[11px] text-muted-foreground">Ranking por engagement y conversaciones</p>
        </div>
      </div>
      <ul className="space-y-2">
        {ranked.slice(0, 5).map((item, i) => {
          const widthPct = Math.max(4, (item.conversations / max) * 100);
          return (
            <li key={item.contentId}>
              <Link
                href={paths.platform.marketing.contentDetail(item.contentId)}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-semibold text-violet-500">
                  {i + 1}
                </span>
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FileText size={14} className="text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-snug">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {typeLabel(item.contentType)} · {item.conversations} convs · {item.bookings} bookings
                  </p>
                </div>
                <div className="hidden w-24 shrink-0 flex-col gap-1 sm:flex">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <span className="text-right text-[10px] tabular-nums text-muted-foreground">
                    {item.conversations}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}

// ── Funnel de conversión con FunnelChartPanel Bklit ──────────────────────────

function ConversionFunnelSection({
  stages,
}: {
  stages: FunnelStage[];
}) {
  const hasData = stages.some((s) => s.value > 0);

  return (
    <ChartShell
      title="Conversión a ventas"
      subtitle="Embudo · contenido → conversaciones → bookings → ventas"
    >
      {hasData ? (
        <div
          style={{ height: 200, overflow: "hidden", contain: "paint" }}
          className="w-full"
        >
          <FunnelChartPanel
            stages={stages}
            orientation="horizontal"
            style={{ minHeight: 0, height: 200, aspectRatio: "auto", width: "100%" }}
          />
        </div>
      ) : (
        <div className="flex h-[100px] flex-col items-center justify-center gap-3">
          <TrendingUp size={20} className="text-muted-foreground/40" />
          <div className="text-center">
            <p className="text-sm font-medium">Sin datos de conversión</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Generá links UTM para trackear qué contenido genera bookings y ventas
            </p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={paths.platform.marketing.utms}>Crear UTMs</Link>
          </Button>
        </div>
      )}
    </ChartShell>
  );
}

// ── Alcance e interacciones con DualAreaChart Bklit ───────────────────────────

function ReachAreaCard({
  data,
}: {
  data: { label: string; primary: number; secondary: number }[];
}) {
  return (
    <ChartShell
      title="Alcance e interacciones"
      subtitle="Área dual · últimos 30 días"
      className="h-full"
    >
      {/* aspectRatio="none" + height fija: el SVG llena el contenedor sin quedar restringido */}
      <DualAreaChart
        data={data}
        primaryKey="primary"
        secondaryKey="secondary"
        primaryLabel="Alcance"
        secondaryLabel="Interacciones"
        aspectRatio="none"
        className="h-[220px]"
      />
    </ChartShell>
  );
}

// ── Distribución de contenido ─────────────────────────────────────────────────

function DistributionCard({ dist }: { dist: DistributionData }) {
  if (!dist.hasContentAssets) {
    return (
      <EmptyCell
        icon={BarChart3}
        title="Distribución de contenido"
        description="Conectá Instagram para ver la distribución por etiqueta."
      />
    );
  }
  return (
    <GlassPanel className="space-y-3 p-4">
      <div>
        <h4 className="text-sm font-medium">Distribución de contenido publicado</h4>
        <p className="mt-0.5 text-xs text-muted-foreground">Por etiqueta de contenido publicado</p>
      </div>
      <ContentLabelDistributionChart
        counts={dist.counts}
        total={dist.total}
        insight={dist.insight}
        hasContentAssets
      />
    </GlassPanel>
  );
}

// ── Heatmap compacto: solo grilla días × horas, sin barras ───────────────────

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function CompactHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const [tip, setTip] = useState<HeatmapCell | null>(null);

  // detectar horas únicas para filas
  const hours = useMemo(() => {
    const set = new Set(cells.map((c) => c.hour));
    return Array.from(set).sort((a, b) => a - b);
  }, [cells]);

  // agrupar en matriz [hour][day]
  const matrix = useMemo(() => {
    const m: Record<number, Record<number, number>> = {};
    for (const c of cells) {
      if (!m[c.hour]) m[c.hour] = {};
      m[c.hour][c.day] = c.engagement;
    }
    return m;
  }, [cells]);

  return (
    <GlassPanel className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
          <CalendarClock size={13} />
        </div>
        <div>
          <h4 className="text-sm font-medium">Mejores días y horarios</h4>
          <p className="text-[11px] text-muted-foreground">Mapa de calor por engagement</p>
        </div>
      </div>

      <div className="flex gap-2">
        {/* etiquetas de hora */}
        <div className="flex flex-col justify-between py-1 pr-1 text-[9px] text-muted-foreground"
          style={{ minWidth: 26 }}>
          {hours.filter((_, i) => i % 2 === 0).map((h) => (
            <span key={h} className="leading-none">{h}h</span>
          ))}
        </div>

        {/* grilla */}
        <div className="flex-1 overflow-x-auto">
          {/* cabecera días */}
          <div className="mb-1 grid gap-0.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          {/* filas de horas */}
          <div className="flex flex-col gap-0.5">
            {hours.map((h) => (
              <div key={h} className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const val = matrix[h]?.[day] ?? 0;
                  const cell = cells.find((c) => c.hour === h && c.day === day) ?? null;
                  return (
                    <button
                      key={day}
                      type="button"
                      className="aspect-square w-full rounded-[3px] transition-transform hover:scale-110"
                      style={{
                        background: `color-mix(in oklch, var(--chart-1) ${Math.round(8 + val * 92)}%, transparent)`,
                      }}
                      onMouseEnter={() => setTip(cell)}
                      onMouseLeave={() => setTip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* leyenda */}
      <div className="flex items-center justify-between">
        {tip ? (
          <p className="text-[11px] text-muted-foreground">
            {DAY_LABELS[tip.day]} {tip.hour}:00 — {(tip.engagement * 100).toFixed(0)}%
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Menos</span>
          {[0.1, 0.35, 0.6, 0.85, 1].map((v) => (
            <span
              key={v}
              className="size-2.5 rounded-[2px]"
              style={{ background: `color-mix(in oklch, var(--chart-1) ${Math.round(8 + v * 92)}%, transparent)` }}
            />
          ))}
          <span>Más</span>
        </div>
      </div>
    </GlassPanel>
  );
}

// ── Performance radar ─────────────────────────────────────────────────────────

function PerformanceRadarCard({ types }: { types: ContentTypePerformance[] }) {
  if (types.length < 3) {
    return (
      <EmptyCell
        icon={Activity}
        title="Performance por tipo"
        description="Publicá contenido de distintos tipos para comparar alcance y conversiones."
      />
    );
  }

  const radarMetrics: RadarMetric[] = types.map((t) => ({
    key: t.type,
    label: CONTENT_TYPE_LABEL[t.type] ?? t.type,
  }));

  const reachMax = Math.max(...types.map((t) => t.reach), 1);
  const convMax = Math.max(...types.map((t) => t.conversions), 1);

  const radarSeries: RadarData[] = [
    {
      label: "Alcance",
      color: "var(--chart-1)",
      values: Object.fromEntries(types.map((t) => [t.type, Math.round((t.reach / reachMax) * 100)])),
    },
    {
      label: "Conversiones",
      color: "var(--chart-3)",
      values: Object.fromEntries(types.map((t) => [t.type, Math.round((t.conversions / convMax) * 100)])),
    },
  ];

  return (
    <GlassPanel className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
          <Activity size={13} />
        </div>
        <div>
          <h4 className="text-sm font-medium">Performance por tipo</h4>
          <p className="text-[11px] text-muted-foreground">Radar · alcance vs conversiones</p>
        </div>
      </div>
      <RadarPerformanceChart metrics={radarMetrics} series={radarSeries} className="mx-auto max-w-[240px]" />
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-1)]" /> Alcance
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-3)]" /> Conversiones
        </span>
      </div>
    </GlassPanel>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function MarketingOverview({
  distribution,
  overview,
}: {
  distribution: DistributionData;
  overview: MarketingOverviewContext;
}) {
  const {
    hasContentAssets,
    hasUtmAttributions,
    utmSummary,
    distribution: dist,
    metrics,
    dualTrendData,
    reachSparkData,
    interactionsSparkData,
    topConverting,
    typePerformance,
    heatmap,
    showHeatmap,
  } = useMarketingOverview(overview, distribution);

  if (!hasContentAssets) {
    return (
      <EmptyState
        variant="inline"
        icon={<BarChart3 className="h-5 w-5" />}
        title="Sin métricas de contenido todavía"
        description="Conectá Instagram o YouTube en Integraciones para importar tus publicaciones y ver alcance, engagement y conversiones."
        action={
          <Button size="sm" variant="outline" asChild>
            <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
          </Button>
        }
      />
    );
  }

  const m = metrics!;

  // ── KPIs primarios ────────────────────────────────────────────────────────
  const primaryKpis = [
    {
      label: "Alcance total",
      hint: "Últimos 30 días",
      value: formatNum(m.totalReach),
      trendPct: m.reachTrendPct,
      icon: Eye,
      sparkData: reachSparkData,
      extra: null,
    },
    {
      label: "Interacciones totales",
      hint: `Engagement ${m.engagementRatePct}%`,
      value: formatNum(m.totalInteractions),
      trendPct: m.interactionsTrendPct,
      icon: Heart,
      sparkData: interactionsSparkData,
      extra: null,
    },
    {
      label: "Contenido publicado",
      value: String(m.contentPublished),
      trendPct: undefined as number | undefined,
      icon: FileText,
      sparkData: undefined as number[] | undefined,
      extra: (
        <div className="flex flex-wrap gap-1 pt-1">
          {[`${m.reelsCount} reels`, `${m.postsCount} posts`, `${m.storiesCount} stories`].map((t) => (
            <span key={t} className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Conversión a ventas",
      hint: `${m.bookingsInfluenced} bookings · ${m.salesInfluenced} ventas`,
      value: m.bookingsInfluenced > 0
        ? `${Math.round((m.salesInfluenced / m.bookingsInfluenced) * 100)}%`
        : "—",
      trendPct: undefined as number | undefined,
      icon: TrendingUp,
      sparkData: undefined as number[] | undefined,
      extra: null,
    },
  ];

  // ── KPIs secundarios compactos ────────────────────────────────────────────
  const secondaryKpis = [
    { label: "Respuestas a historias", value: formatNum(m.storyReplies), sub: "Últimos 30 días", trendPct: m.storyRepliesTrendPct, icon: MessageCircle },
    { label: "Comentarios totales", value: formatNum(m.commentsTotal), sub: "Últimos 30 días", trendPct: m.commentsTrendPct, icon: MessageCircle },
    { label: "Crecimiento del perfil", value: `+${formatNum(m.newFollowers)}`, sub: "Nuevos seguidores", trendPct: m.profileGrowthTrendPct, icon: UserPlus },
  ];

  // ── Funnel stages para FunnelChartPanel ──────────────────────────────────
  const funnelStages: FunnelStage[] = [
    { label: "Alcance", value: m.totalReach },
    { label: "Conversaciones", value: m.conversationsGenerated },
    { label: "Bookings", value: m.bookingsInfluenced },
    { label: "Ventas", value: m.salesInfluenced },
  ];

  return (
    <div className="space-y-5">

      {/* ── 0. Top Contenido — full-width, arriba de todo ───────────────────── */}
      {topConverting.length > 0 && <TopContentCard ranked={topConverting} />}

      {/* ── 1. KPIs primarios (4 heroes) + secundarios (3 compactos) ────────── */}
      <div className="space-y-3">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {primaryKpis.map((kpi) => (
            <KpiHeroCard
              key={kpi.label}
              label={kpi.label}
              hint={"hint" in kpi ? kpi.hint : undefined}
              value={kpi.value}
              trendPct={kpi.trendPct}
              icon={kpi.icon}
              sparkData={kpi.sparkData}
            >
              {kpi.extra}
            </KpiHeroCard>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {secondaryKpis.map((kpi) => {
            const Icon = kpi.icon;
            const isPos = kpi.trendPct !== undefined && kpi.trendPct > 0;
            const isNeg = kpi.trendPct !== undefined && kpi.trendPct < 0;
            return (
              <GlassPanel key={kpi.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground truncate">{kpi.label}</p>
                    <p className="text-lg font-semibold tabular-nums">{kpi.value}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-muted-foreground">{kpi.sub}</p>
                  {kpi.trendPct !== undefined && (
                    <span className={cn(
                      "mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                      isPos && "bg-emerald-500/15 text-emerald-500",
                      isNeg && "bg-rose-500/15 text-rose-500",
                      !isPos && !isNeg && "bg-muted text-muted-foreground"
                    )}>
                      {kpi.trendPct > 0 ? "↑" : kpi.trendPct < 0 ? "↓" : "~"}{Math.abs(kpi.trendPct)}%
                    </span>
                  )}
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </div>

      {/* ── 2. Funnel de conversión con FunnelChartPanel Bklit ──────────────── */}
      <ConversionFunnelSection stages={funnelStages} />

      {/* ── 3. Distribución (1 col) + Alcance e interacciones (2 cols) ─────── */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <DistributionCard dist={dist} />
        {dualTrendData.length >= 2 ? (
          <div className="xl:col-span-2">
            <ReachAreaCard data={dualTrendData} />
          </div>
        ) : (
          <EmptyCell
            icon={Eye}
            title="Sin datos de alcance"
            description="Importá contenido para ver la tendencia de alcance e interacciones."
            className="xl:col-span-2"
          />
        )}
      </div>

      {/* ── 4. Heatmap compacto (2 cols) + sidebar UTM + radar (1 col) ──────── */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {showHeatmap && heatmap ? (
            <CompactHeatmap cells={heatmap} />
          ) : (
            <EmptyCell
              icon={CalendarClock}
              title="Mejores días y horarios"
              description="Publicá más contenido para ver tus mejores días y horarios de engagement."
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <UtmAttributionCard summary={utmSummary} hasData={hasUtmAttributions} />
          <PerformanceRadarCard types={typePerformance} />
        </div>
      </div>

    </div>
  );
}
