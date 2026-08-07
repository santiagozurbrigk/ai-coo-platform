"use client";

import {
  Eye,
  Heart,
  BarChart3,
  FileText,
  Users,
  MessageCircle,
  UserPlus,
  TrendingUp,
  Link2,
  Clock,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { Button, GlassPanel } from "@ai-coo/ui";
import type { MarketingOverviewContext } from "@/app/marketing/actions";
import type { ContentLabel } from "@/lib/content/label-content";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ChartShell,
  DualAreaChart,
  FunnelChartPanel,
  RingDistributionChart,
} from "@/components/charts/platform";
import { ContentLabelDistributionChart } from "@/components/marketing/content-label-distribution-chart";
import {
  TypeRadarChart,
  TopConvertingContentList,
  PublishHeatmap,
} from "./marketing-charts";
import { paths } from "@/routes";
// Componentes del módulo overview
import { KpiHeroCard } from "@/components/sales/metrics/kpi-hero-card";
import { MarketingStatCard } from "./overview/marketing-stat-card";
import { UtmAttributionCard } from "./overview/utm-attribution-card";
import { ConversionStrip } from "./overview/conversion-strip";
import { useMarketingOverview } from "./overview/use-marketing-overview";

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
    utmLinks,
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
    funnelHasData,
  } = useMarketingOverview(overview, distribution);

  // ── Métricas vacías — mostrar estado de conexión ──────────────────────────
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

  // Slices para ring chart de estado de contenido
  const contentTypeSlices = [
    { label: "Reels", value: m.reelsCount, color: "#7C3AED" },
    { label: "Posts", value: m.postsCount, color: "#10b981" },
    { label: "Stories", value: m.storiesCount, color: "#f59e0b" },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-6">

      {/* ── 1. KPI Heroes: 4 métricas principales ────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiHeroCard
          label="Alcance total"
          hint="Últimos 30 días"
          value={formatNum(m.totalReach)}
          delta={m.reachTrendPct}
          icon={Eye}
          sparkData={reachSparkData}
        />
        <KpiHeroCard
          label="Interacciones"
          hint={`Engagement ${m.engagementRatePct}%`}
          value={formatNum(m.totalInteractions)}
          delta={m.interactionsTrendPct}
          icon={Heart}
          sparkData={interactionsSparkData}
        />
        <KpiHeroCard
          label="Contenido publicado"
          hint={`${m.reelsCount} reels · ${m.postsCount} posts · ${m.storiesCount} stories`}
          value={String(m.contentPublished)}
          icon={FileText}
          sparkData={reachSparkData.map((_, i) => (i % 2 === 0 ? 1 : 0))}
        />
        <KpiHeroCard
          label="Nuevos seguidores"
          hint="Crecimiento del perfil"
          value={`+${formatNum(m.newFollowers)}`}
          delta={m.profileGrowthTrendPct}
          icon={UserPlus}
          sparkData={interactionsSparkData.map((v) => Math.round(v * 0.1))}
        />
      </div>

      {/* ── 2. Layout asimétrico: contenido + sidebar ────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* ── Columna izquierda ──────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Conversión a ventas — strip horizontal */}
          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold">Conversión a ventas</h3>
            <ConversionStrip metrics={m} />
          </section>

          {/* Tendencia: Alcance vs Interacciones */}
          {dualTrendData.length >= 2 && (
            <ChartShell
              title="Alcance e interacciones"
              subtitle="Últimos 30 días · área dual"
            >
              <div className="h-[200px] w-full overflow-hidden">
                <DualAreaChart
                  data={dualTrendData}
                  primaryKey="primary"
                  secondaryKey="secondary"
                  primaryLabel="Alcance"
                  secondaryLabel="Interacciones"
                  className="h-[200px]"
                />
              </div>
            </ChartShell>
          )}

          {/* Funnel de contenido + Top contenido — 2 columnas */}
          <div className="grid gap-4 sm:grid-cols-2">
            {funnelHasData ? (
              <ChartShell
                title="Funnel contenido → venta"
                subtitle="Embudo por etapas"
              >
                <div className="h-[180px]">
                  <FunnelChartPanel
                    stages={contentFunnel.map((s) => ({
                      label: s.stage,
                      value: s.value,
                    }))}
                    orientation="vertical"
                    className="h-[180px]"
                  />
                </div>
              </ChartShell>
            ) : (
              <GlassPanel className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
                <TrendingUp size={20} className="text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Funnel contenido → ventas</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Generá links UTM para trackear qué contenido convierte
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={paths.platform.marketing.utms}>Crear UTMs</Link>
                </Button>
              </GlassPanel>
            )}

            {topConverting.length > 0 ? (
              <TopConvertingContentList ranked={topConverting} />
            ) : (
              <GlassPanel className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
                <BarChart3 size={20} className="text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Contenido que más convierte</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Aparecerá cuando haya conversaciones vinculadas a contenido
                  </p>
                </div>
              </GlassPanel>
            )}
          </div>

          {/* Heatmap de publicación (ocupa toda la columna) */}
          {showHeatmap && heatmap ? (
            <PublishHeatmap cells={heatmap} />
          ) : null}

          {/* Performance por tipo */}
          {typePerformance.length > 0 && (
            <TypeRadarChart types={typePerformance} />
          )}
        </div>

        {/* ── Sidebar derecho ────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Engagement */}
          <h3 className="text-[13px] font-semibold">Engagement</h3>

          <MarketingStatCard
            label="Respuestas a historias"
            value={formatNum(m.storyReplies)}
            sub="Últimos 30 días"
            trendPct={m.storyRepliesTrendPct}
            icon={MessageCircle}
          />

          <MarketingStatCard
            label="Comentarios totales"
            value={formatNum(m.commentsTotal)}
            sub="Últimos 30 días"
            trendPct={m.commentsTrendPct}
            icon={MessageCircle}
          />

          <MarketingStatCard
            label="Crecimiento del perfil"
            value={`+${formatNum(m.newFollowers)}`}
            sub="Nuevos seguidores"
            trendPct={m.profileGrowthTrendPct}
            icon={Users}
          >
            {/* Barra Views → Seguidores */}
            <div className="mt-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Views → Seguidores</span>
                <span>{m.viewsToFollowersRate}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${Math.min(m.viewsToFollowersRate, 100)}%` }}
                />
              </div>
            </div>
          </MarketingStatCard>

          {/* Distribución de contenido — ring chart compacto */}
          {dist.hasContentAssets && (
            <GlassPanel className="space-y-3 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Distribución de contenido
              </p>
              {contentTypeSlices.length > 0 ? (
                <div className="flex items-center gap-3">
                  <RingDistributionChart
                    slices={contentTypeSlices}
                    centerValue={String(m.contentPublished)}
                    centerLabel="Total"
                    className="max-w-[90px] min-w-[90px] shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    {contentTypeSlices.map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: s.color }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {s.label}
                          </span>
                        </div>
                        <span className="text-xs font-semibold tabular-nums">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ContentLabelDistributionChart
                  counts={dist.counts}
                  total={dist.total}
                  insight={dist.insight}
                  hasContentAssets
                />
              )}
            </GlassPanel>
          )}

          {/* Atribución UTM */}
          <UtmAttributionCard
            summary={utmSummary}
            hasData={hasUtmAttributions}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes locales ───────────────────────────────────────────────────

function SectionEmpty({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-[200px] items-center">
      <EmptyState
        variant="inline"
        className="w-full"
        icon={<Icon className="h-5 w-5" />}
        title={title}
        description={description}
      />
    </div>
  );
}
