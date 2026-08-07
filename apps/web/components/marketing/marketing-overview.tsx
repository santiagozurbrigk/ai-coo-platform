"use client";

import {
  Eye,
  Heart,
  FileText,
  Users,
  MessageCircle,
  UserPlus,
  TrendingUp,
  Link2,
  BarChart3,
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
} from "@/components/charts/platform";
import { ContentLabelDistributionChart } from "@/components/marketing/content-label-distribution-chart";
import {
  TypeRadarChart,
  TopConvertingContentList,
  PublishHeatmap,
} from "./marketing-charts";
import { paths } from "@/routes";
// Componentes reutilizables del módulo de métricas
import { KpiHeroCard } from "@/components/sales/metrics/kpi-hero-card";
import { UtmAttributionCard } from "./overview/utm-attribution-card";
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

  // ── Funnel stages para conversión a ventas ────────────────────────────────
  const conversionFunnel = [
    {
      label: "Conversaciones",
      value: m.conversationsGenerated || contentFunnel[0]?.value || 0,
    },
    {
      label: "Bookings",
      value: m.bookingsInfluenced || contentFunnel[1]?.value || 0,
    },
    {
      label: "Ventas",
      value: m.salesInfluenced || contentFunnel[2]?.value || 0,
    },
  ].filter((s) => s.value > 0);

  // Fallback si no hay datos de conversión: usar contentFunnel completo
  const funnelData =
    conversionFunnel.length >= 2
      ? conversionFunnel
      : funnelHasData
      ? contentFunnel.map((s) => ({ label: s.stage, value: s.value }))
      : [];

  return (
    <div className="space-y-5">

      {/* ── Row 1: 6 KPI heroes ─────────────────────────────────────────── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">

        {/* Alcance total */}
        <KpiHeroCard
          label="Alcance total"
          hint="Últimos 30 días"
          value={formatNum(m.totalReach)}
          trendPct={m.reachTrendPct}
          icon={Eye}
          sparkData={reachSparkData}
        />

        {/* Interacciones */}
        <KpiHeroCard
          label="Interacciones totales"
          hint={`Engagement ${m.engagementRatePct}%`}
          value={formatNum(m.totalInteractions)}
          trendPct={m.interactionsTrendPct}
          icon={Heart}
          sparkData={interactionsSparkData}
        />

        {/* Contenido publicado — sin sparkline, con badges de formato */}
        <KpiHeroCard
          label="Contenido publicado"
          value={String(m.contentPublished)}
          icon={FileText}
        >
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
        </KpiHeroCard>

        {/* Respuestas a historias */}
        <KpiHeroCard
          label="Respuestas a historias"
          hint="Últimos 30 días"
          value={formatNum(m.storyReplies)}
          trendPct={m.storyRepliesTrendPct}
          icon={MessageCircle}
          sparkData={interactionsSparkData}
        />

        {/* Comentarios totales */}
        <KpiHeroCard
          label="Comentarios totales"
          hint="Últimos 30 días"
          value={formatNum(m.commentsTotal)}
          trendPct={m.commentsTrendPct}
          icon={MessageCircle}
          sparkData={reachSparkData}
        />

        {/* Crecimiento del perfil */}
        <KpiHeroCard
          label="Crecimiento del perfil"
          hint="Nuevos seguidores"
          value={`+${formatNum(m.newFollowers)}`}
          trendPct={m.profileGrowthTrendPct}
          icon={UserPlus}
          sparkData={interactionsSparkData.map((v) => Math.round(v * 0.1))}
        >
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
            <span>Views → Seguidores</span>
            <span>{m.viewsToFollowersRate}%</span>
          </div>
        </KpiHeroCard>
      </div>

      {/* ── Row 2: Conversión a ventas con funnel chart ──────────────────── */}
      <ChartShell
        title="Conversión a ventas"
        subtitle="Embudo de contenido → conversaciones → bookings → ventas"
        className="overflow-hidden"
      >
        {funnelData.length >= 2 ? (
          <div
            className="w-full"
            style={{ height: 180, overflow: "hidden", contain: "paint" }}
          >
            <FunnelChartPanel
              stages={funnelData}
              orientation="horizontal"
              style={{ minHeight: 0, height: 180, aspectRatio: "auto", width: "100%" }}
            />
          </div>
        ) : (
          <div className="flex h-[120px] flex-col items-center justify-center gap-3">
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

      {/* ── Row 3: 3 columnas iguales ────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">

        {/* Distribución de contenido publicado */}
        {dist.hasContentAssets ? (
          <GlassPanel className="space-y-3 p-4">
            <div>
              <h4 className="text-sm font-medium">Distribución de contenido publicado</h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Pie animado por etiqueta de contenido
              </p>
            </div>
            <ContentLabelDistributionChart
              counts={dist.counts}
              total={dist.total}
              insight={dist.insight}
              hasContentAssets
            />
          </GlassPanel>
        ) : (
          <EmptyCell
            icon={BarChart3}
            title="Distribución de contenido"
            description="Conectá Instagram para ver la distribución por etiqueta."
          />
        )}

        {/* Alcance e interacciones — DualAreaChart */}
        {dualTrendData.length >= 2 ? (
          <ChartShell
            title="Alcance e interacciones"
            subtitle="Área dual · Últimos 30 días"
            className="h-full"
          >
            <div className="h-[220px] w-full overflow-hidden">
              <DualAreaChart
                data={dualTrendData}
                primaryKey="primary"
                secondaryKey="secondary"
                primaryLabel="Alcance"
                secondaryLabel="Interacciones"
                className="h-[220px]"
              />
            </div>
          </ChartShell>
        ) : (
          <EmptyCell
            icon={Eye}
            title="Sin datos de alcance"
            description="Importá contenido para ver la tendencia de alcance e interacciones."
          />
        )}

        {/* Contenido que más convierte */}
        {topConverting.length > 0 ? (
          <TopConvertingContentList ranked={topConverting} />
        ) : (
          <EmptyCell
            icon={BarChart3}
            title="Contenido que más convierte"
            description="Aparecerá cuando haya conversaciones vinculadas a contenido publicado."
          />
        )}
      </div>

      {/* ── Row 4: 3 columnas iguales ────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">

        {/* Performance por tipo — Radar */}
        {typePerformance.length > 0 ? (
          <TypeRadarChart types={typePerformance} />
        ) : (
          <EmptyCell
            icon={BarChart3}
            title="Performance por tipo"
            description="Importá contenido para comparar reels, posts y otros formatos."
          />
        )}

        {/* Heatmap de publicación */}
        {showHeatmap && heatmap ? (
          <PublishHeatmap cells={heatmap} />
        ) : (
          <EmptyCell
            icon={BarChart3}
            title="Mejores días y horarios"
            description="Publicá más contenido para ver tus mejores días y horarios de engagement."
          />
        )}

        {/* Conexión ventas — UTM */}
        <UtmAttributionCard
          summary={utmSummary}
          hasData={hasUtmAttributions}
        />
      </div>
    </div>
  );
}

// ─── Sub-componente reutilizable de estado vacío ──────────────────────────────

function EmptyCell({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <GlassPanel className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center">
      <Icon size={20} className="text-muted-foreground/40" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </GlassPanel>
  );
}
