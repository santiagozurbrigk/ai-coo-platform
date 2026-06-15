"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Clock,
  Link2,
  PieChart,
  TrendingUp,
} from "lucide-react";
import type { ContentLabel } from "@/lib/content/label-content";
import type { MarketingOverviewContext } from "@/app/marketing/actions";
import {
  assetsHavePublishTimestamps,
  buildContentFunnelFromAssets,
  buildOverviewMetricsFromAssets,
  buildPublishHeatmapFromAssets,
  buildReachTimeSeriesFromAssets,
  buildTopConvertingFromAssets,
  buildTypePerformanceFromAssets,
} from "@/lib/marketing/overview-metrics";
import { BentoCell, BentoGrid } from "@/components/shared/bento-grid";
import { ContentLabelDistributionChart } from "@/components/marketing/content-label-distribution-chart";
import { MarketingEmptySection } from "@/components/marketing/marketing-empty-section";
import { MarketingMetricsSections } from "@/components/marketing/overview";
import { paths } from "@/routes";
import {
  ContentFunnelChart,
  PublishHeatmap,
  ReachInteractionsChart,
  TopConvertingContentList,
  TypeRadarChart,
} from "./marketing-charts";
import { YoutubeVideoPerformance } from "./youtube-video-performance";

type DistributionData = {
  counts: Record<ContentLabel, number>;
  total: number;
  insight: string | null;
  hasContentAssets: boolean;
};

export function MarketingOverview({
  distribution,
  overview,
}: {
  distribution: DistributionData;
  overview: MarketingOverviewContext;
}) {
  const { hasContentAssets, hasUtmAttributions, assets, utmLinks, utmSummary } =
    overview;

  const metrics = hasContentAssets
    ? buildOverviewMetricsFromAssets(assets)
    : null;
  const reachSeries = hasContentAssets
    ? buildReachTimeSeriesFromAssets(assets)
    : [];
  const contentFunnel = hasContentAssets
    ? buildContentFunnelFromAssets(assets)
    : [];
  const topConverting = hasContentAssets
    ? buildTopConvertingFromAssets(assets)
    : [];
  const typePerformance = hasContentAssets
    ? buildTypePerformanceFromAssets(assets)
    : [];
  const heatmap = hasContentAssets
    ? buildPublishHeatmapFromAssets(assets)
    : null;
  const showHeatmap =
    hasContentAssets && assetsHavePublishTimestamps(assets) && heatmap;

  const funnelHasData =
    hasUtmAttributions ||
    (hasContentAssets &&
      contentFunnel.some((stage) => stage.value > 0 && stage.stage !== "Impresiones"));

  return (
    <div className="space-y-8">
      {hasContentAssets && metrics ? (
        <MarketingMetricsSections metrics={metrics} />
      ) : (
        <MarketingEmptySection
          icon={BarChart3}
          title="Sin métricas de contenido todavía"
          description="Conectá Instagram o YouTube en Integraciones para importar tus publicaciones y ver alcance, engagement y conversiones."
          ctaLabel="Ir a Integraciones"
          ctaHref={paths.platform.integrations}
        />
      )}

      {distribution.hasContentAssets ? (
        <BentoGrid>
          <BentoCell size="banner">
            <ContentLabelDistributionChart
              counts={distribution.counts}
              total={distribution.total}
              insight={distribution.insight}
              hasContentAssets
            />
          </BentoCell>
        </BentoGrid>
      ) : (
        <MarketingEmptySection
          icon={PieChart}
          title="Distribución de contenido"
          description="Conectá Instagram o YouTube para ver la distribución de tu contenido por etiqueta y formato."
          ctaLabel="Conectar integración"
          ctaHref={paths.platform.integrations}
        />
      )}

      {hasContentAssets && reachSeries.length > 0 ? (
        <ReachInteractionsChart data={reachSeries} />
      ) : null}

      {hasContentAssets ? (
        <YoutubeVideoPerformance assets={assets} utmLinks={utmLinks} />
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {funnelHasData ? (
          <ContentFunnelChart stages={contentFunnel} />
        ) : (
          <MarketingEmptySection
            icon={TrendingUp}
            title="Funnel contenido → ventas"
            description="Generá links UTM desde Marketing → UTMs y empezá a trackear qué contenido genera ventas."
            ctaLabel="Crear links UTM"
            ctaHref={paths.platform.marketing.utms}
          />
        )}

        {hasContentAssets && topConverting.length > 0 ? (
          <TopConvertingContentList ranked={topConverting} />
        ) : (
          <MarketingEmptySection
            icon={BarChart3}
            title="Top contenido"
            description="Cuando importes publicaciones desde Instagram o YouTube, vas a ver acá las piezas con mejor engagement y conversión."
            ctaLabel="Ver biblioteca"
            ctaHref={paths.platform.marketing.content}
          />
        )}
      </div>

      <BentoGrid>
        {hasContentAssets && typePerformance.length > 0 ? (
          <BentoCell size="unit">
            <TypeRadarChart types={typePerformance} />
          </BentoCell>
        ) : (
          <BentoCell size="unit">
            <SectionEmpty
              icon={PieChart}
              title="Performance por tipo"
              description="Importá contenido para comparar reels, posts y otros formatos."
            />
          </BentoCell>
        )}

        {showHeatmap && heatmap ? (
          <BentoCell size="unit">
            <PublishHeatmap cells={heatmap} />
          </BentoCell>
        ) : (
          <BentoCell size="unit">
            <SectionEmpty
              icon={Clock}
              title="Heatmap de publicación"
              description="Publicá más contenido para ver tus mejores días y horarios de engagement."
            />
          </BentoCell>
        )}

        <BentoCell size="wide">
          {hasUtmAttributions ? (
            <UtmSalesSummary summary={utmSummary} />
          ) : (
            <MarketingEmptySection
              icon={Link2}
              title="Conexión ventas"
              description="Aún no hay ventas atribuidas a contenido. Creá links UTM para trackear el origen de tus leads."
              ctaLabel="Generar UTMs"
              ctaHref={paths.platform.marketing.utms}
            />
          )}
        </BentoCell>
      </BentoGrid>
    </div>
  );
}

function SectionEmpty({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-[280px] items-center">
      <MarketingEmptySection
        icon={icon}
        title={title}
        description={description}
      />
    </div>
  );
}

function UtmSalesSummary({
  summary,
}: {
  summary: MarketingOverviewContext["utmSummary"];
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-5 dark:border-white/[0.08]">
      <div>
        <h3 className="text-sm font-medium">Conexión ventas</h3>
        <p className="text-xs text-muted-foreground">
          Atribución real desde links UTM
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Clicks UTM" value={String(summary.totalClicks)} />
        <Stat label="Bookings atribuidos" value={String(summary.totalBookings)} />
        <Stat label="Ventas atribuidas" value={String(summary.totalSales)} />
        <Stat
          label="Revenue atribuido"
          value={`$${summary.totalRevenue.toLocaleString("es-ES")}`}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 dark:border-white/[0.08]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
