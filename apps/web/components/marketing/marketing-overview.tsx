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
  CategoryBarChart,
} from "@/components/charts/platform";
import { ContentLabelDistributionChart } from "@/components/marketing/content-label-distribution-chart";
import { PublishHeatmap } from "./marketing-charts";
import { paths } from "@/routes";
import { KpiHeroCard } from "@/components/sales/metrics/kpi-hero-card";
import { UtmAttributionCard } from "./overview/utm-attribution-card";
import { useMarketingOverview } from "./overview/use-marketing-overview";
import type { TopConvertingItem } from "@/lib/marketing/overview-metrics";
import { CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import type { ContentTypePerformance } from "@/types/marketing-insights";
import type { RadarData, RadarMetric } from "@/components/charts/radar-context";

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

/** Card de estado vacío */
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
        "flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center",
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

/** Funnel de conversión: 4 cards horizontales con progress bar (v0 pattern) */
function ConversionFunnelCards({
  stages,
}: {
  stages: { label: string; value: number; pct: string }[];
}) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stages.map((stage, i) => {
        const barWidth = Math.max(6, (stage.value / max) * 100);
        const isLast = i === stages.length - 1;
        return (
          <div
            key={stage.label}
            className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                {stage.label}
              </span>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-500">
                {stage.pct}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
              {stage.value.toLocaleString("es-AR")}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            {!isLast && (
              <span className="pointer-events-none absolute -right-2.5 top-1/2 z-10 hidden size-5 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-xs text-muted-foreground lg:flex">
                ›
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Alcance + interacciones con DualAreaChart de Bklit */
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
      <div className="h-[200px] w-full overflow-hidden">
        <DualAreaChart
          data={data}
          primaryKey="primary"
          secondaryKey="secondary"
          primaryLabel="Alcance"
          secondaryLabel="Interacciones"
          className="h-[200px]"
        />
      </div>
    </ChartShell>
  );
}

/** Distribución de contenido publicado con ContentLabelDistributionChart de Bklit */
function DistributionCard({
  dist,
}: {
  dist: DistributionData;
}) {
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

/** Contenido que más convierte — lista con score bar (v0 pattern) */
function TopContentCard({ ranked }: { ranked: TopConvertingItem[] }) {
  if (ranked.length === 0) {
    return (
      <EmptyCell
        icon={Trophy}
        title="Contenido que más convierte"
        description="Aparecerá cuando haya conversaciones vinculadas a contenido publicado."
      />
    );
  }
  const max = Math.max(...ranked.map((r) => r.conversations), 1);

  const typeLabel = (type: string | null) => {
    const key = (type ?? "post") as keyof typeof CONTENT_TYPE_LABEL;
    return CONTENT_TYPE_LABEL[key] ?? type ?? "Contenido";
  };

  return (
    <GlassPanel className="flex flex-col gap-3 p-4">
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
          const widthPct = (item.conversations / max) * 100;
          return (
            <li key={item.contentId}>
              <Link
                href={paths.platform.marketing.contentDetail(item.contentId)}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-semibold text-violet-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-snug">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {typeLabel(item.contentType)} · {item.conversations} convs · {item.bookings} bookings
                  </p>
                </div>
                <div className="hidden w-20 shrink-0 flex-col gap-1 sm:flex">
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

/** Mejores días y horarios — barras por día + heatmap (v0 pattern, heatmap de Bklit) */
function BestTimesCard({
  heatmap,
  show,
}: {
  heatmap: ReturnType<typeof useMarketingOverview>["heatmap"];
  show: boolean;
}) {
  if (!show || !heatmap) {
    return (
      <EmptyCell
        icon={CalendarClock}
        title="Mejores días y horarios"
        description="Publicá más contenido para ver tus mejores días y horarios de engagement."
      />
    );
  }
  return <PublishHeatmap cells={heatmap} />;
}

/** Performance por tipo — RadarPerformanceChart de Bklit */
function PerformanceRadarCard({ types }: { types: ContentTypePerformance[] }) {
  if (types.length < 3) {
    return (
      <EmptyCell
        icon={BarChart3}
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
    <GlassPanel className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
          <Activity size={13} />
        </div>
        <div>
          <h4 className="text-sm font-medium">Performance por tipo</h4>
          <p className="text-[11px] text-muted-foreground">Radar · alcance vs conversiones normalizadas</p>
        </div>
      </div>
      <RadarPerformanceChart
        metrics={radarMetrics}
        series={radarSeries}
        className="mx-auto max-w-[240px]"
      />
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-1)]" />
          Alcance
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-3)]" />
          Conversiones
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
    contentFunnel,
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

  // ── KPIs primarios (4 grandes) ────────────────────────────────────────────
  const primaryKpis = [
    {
      label: "Alcance total",
      hint: "Últimos 30 días",
      value: formatNum(m.totalReach),
      trendPct: m.reachTrendPct,
      icon: Eye,
      sparkData: reachSparkData,
    },
    {
      label: "Interacciones totales",
      hint: `Engagement ${m.engagementRatePct}%`,
      value: formatNum(m.totalInteractions),
      trendPct: m.interactionsTrendPct,
      icon: Heart,
      sparkData: interactionsSparkData,
    },
    {
      label: "Contenido publicado",
      value: String(m.contentPublished),
      trendPct: undefined as number | undefined,
      icon: FileText,
      sparkData: undefined as number[] | undefined,
    },
    {
      label: "Conversión a ventas",
      hint: `${m.bookingsInfluenced} bookings · ${m.salesInfluenced} ventas`,
      value:
        m.bookingsInfluenced > 0
          ? `${Math.round((m.salesInfluenced / m.bookingsInfluenced) * 100)}%`
          : "—",
      trendPct: undefined as number | undefined,
      icon: TrendingUp,
      sparkData: undefined as number[] | undefined,
    },
  ];

  // ── KPIs secundarios (3 compactos) ────────────────────────────────────────
  const secondaryKpis = [
    {
      label: "Respuestas a historias",
      value: formatNum(m.storyReplies),
      sub: "Últimos 30 días",
      trendPct: m.storyRepliesTrendPct,
      icon: MessageCircle,
    },
    {
      label: "Comentarios totales",
      value: formatNum(m.commentsTotal),
      sub: "Últimos 30 días",
      trendPct: m.commentsTrendPct,
      icon: MessageCircle,
    },
    {
      label: "Crecimiento del perfil",
      value: `+${formatNum(m.newFollowers)}`,
      sub: "Nuevos seguidores",
      trendPct: m.profileGrowthTrendPct,
      icon: UserPlus,
    },
  ];

  // ── Funnel de conversión ──────────────────────────────────────────────────
  const funnelStages = [
    {
      label: "Alcance",
      value: m.totalReach,
      pct: "100%",
    },
    {
      label: "Conversaciones",
      value: m.conversationsGenerated,
      pct: m.totalReach > 0 ? `${Math.round((m.conversationsGenerated / m.totalReach) * 100)}%` : "—",
    },
    {
      label: "Bookings",
      value: m.bookingsInfluenced,
      pct:
        m.conversationsGenerated > 0
          ? `${Math.round((m.bookingsInfluenced / m.conversationsGenerated) * 100)}%`
          : "—",
    },
    {
      label: "Ventas",
      value: m.salesInfluenced,
      pct:
        m.bookingsInfluenced > 0
          ? `${Math.round((m.salesInfluenced / m.bookingsInfluenced) * 100)}%`
          : "—",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Nivel 1: 4 KPIs grandes + 3 compactos ──────────────────────────── */}
      <div className="space-y-3">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {primaryKpis.map((kpi) => (
            <KpiHeroCard
              key={kpi.label}
              label={kpi.label}
              hint={kpi.hint}
              value={kpi.value}
              trendPct={kpi.trendPct}
              icon={kpi.icon}
              sparkData={kpi.sparkData}
            >
              {/* Slot para formato tags en "Contenido publicado" */}
              {kpi.label === "Contenido publicado" && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {[
                    { label: `${m.reelsCount} reels` },
                    { label: `${m.postsCount} posts` },
                    { label: `${m.storiesCount} stories` },
                  ].map((tag) => (
                    <span
                      key={tag.label}
                      className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </KpiHeroCard>
          ))}
        </div>

        {/* 3 KPIs compactos */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {secondaryKpis.map((kpi) => {
            const Icon = kpi.icon;
            const isPos = kpi.trendPct !== undefined && kpi.trendPct > 0;
            const isNeg = kpi.trendPct !== undefined && kpi.trendPct < 0;
            return (
              <GlassPanel
                key={kpi.label}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
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
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                        isPos && "bg-emerald-500/15 text-emerald-500",
                        isNeg && "bg-rose-500/15 text-rose-500",
                        !isPos && !isNeg && "bg-muted text-muted-foreground"
                      )}
                    >
                      {kpi.trendPct > 0 ? "↑" : kpi.trendPct < 0 ? "↓" : "~"}
                      {Math.abs(kpi.trendPct)}%
                    </span>
                  )}
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </div>

      {/* ── Nivel 2: Funnel de conversión (4 cards horizontales) ────────────── */}
      <ChartShell
        title="Conversión a ventas"
        subtitle="Embudo · contenido → conversaciones → bookings → ventas"
      >
        {funnelStages.some((s) => s.value > 0) ? (
          <ConversionFunnelCards stages={funnelStages} />
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

      {/* ── Nivel 3: Distribución (1/3) + Alcance (2/3) ─────────────────────── */}
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

      {/* ── Nivel 4: Heatmap (2/3) + sidebar derecho ────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BestTimesCard heatmap={heatmap} show={!!showHeatmap} />
        </div>
        <div className="flex flex-col gap-4">
          <UtmAttributionCard summary={utmSummary} hasData={hasUtmAttributions} />
          <PerformanceRadarCard types={typePerformance} />
        </div>
      </div>

      {/* ── Nivel 5: Top contenido — ancho completo ─────────────────────────── */}
      <TopContentCard ranked={topConverting} />

    </div>
  );
}
