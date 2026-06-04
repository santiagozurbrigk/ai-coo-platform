"use client";

import { MetricCard } from "@ai-coo/ui";
import type { ContentLabel } from "@/lib/content/label-content";
import { sparklineProps } from "@/lib/metrics/sparkline-series";
import { mockContentAssets } from "@/mocks/marketing-insights";
import {
  additionalMarketingMetrics,
  mockContentFunnel,
  mockFollowerGrowth,
  mockMarketingOverview,
  mockMarketingOverviewInsights,
  mockPublishHeatmap,
  mockReachTimeSeries,
  mockTypePerformance,
} from "@/mocks/marketing";
import { useMarketingData } from "@/providers";
import { BentoCell, BentoGrid } from "@/components/shared/bento-grid";
import { ContentLabelDistributionChart } from "@/components/marketing/content-label-distribution-chart";
import { InstagramEmptyState } from "./instagram-empty-state";
import {
  ContentFunnelChart,
  FollowerGrowthChart,
  PublishHeatmap,
  ReachInteractionsChart,
  TopConvertingContentList,
  TypeRadarChart,
} from "./marketing-charts";

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("es-ES");
}

function formatTrend(trend: number, suffix = "%") {
  const sign = trend >= 0 ? "+" : "";
  return `${sign}${trend}${suffix}`;
}

type DistributionData = {
  counts: Record<ContentLabel, number>;
  total: number;
  insight: string | null;
};

export function MarketingOverview({
  distribution,
}: {
  distribution: DistributionData;
}) {
  const { instagramConnected } = useMarketingData();

  const m = mockMarketingOverview;
  const topConverting = [...mockContentAssets]
    .sort((a, b) => b.conversationsGenerated - a.conversationsGenerated)
    .slice(0, 4)
    .map((c) => ({
      contentId: c.id,
      conversations: c.conversationsGenerated,
      bookings: c.bookingsInfluenced,
    }));

  return (
    <div className="space-y-8">
      {instagramConnected ? (
        <>
        <BentoGrid>
          <BentoCell size="large">
            <MetricCard
              className="h-full"
              title="Alcance total"
              value={formatNum(m.totalReach)}
              subtitle="Últimos 30 días"
              trend="up"
              trendValue={`+${m.reachTrendPct}%`}
              {...sparklineProps("reach", 0)}
            />
          </BentoCell>
          <BentoCell size="wide">
            <MetricCard
              className="h-full"
              title="Interacciones totales"
              value={formatNum(m.totalInteractions)}
              subtitle={`Engagement ${m.engagementRatePct}%`}
              trend="up"
              trendValue={`+${m.interactionsTrendPct}%`}
              {...sparklineProps("interactions", 100)}
            />
          </BentoCell>
          <BentoCell size="unit">
            <MetricCard
              className="h-full"
              title="Contenido publicado"
              value={String(m.contentPublished)}
              subtitle={`${m.reelsCount} reels · ${m.postsCount} posts · ${m.storiesCount} stories`}
            />
          </BentoCell>
          <BentoCell size="wide">
            <MetricCard
              className="h-full"
              title="Conversaciones generadas"
              value={String(m.conversationsGenerated)}
              subtitle="Vinculadas a bandeja de ventas"
              {...sparklineProps("conversations", 200)}
            />
          </BentoCell>
          <BentoCell size="unit">
            <MetricCard
              className="h-full"
              title="Bookings influenciados"
              value={String(m.bookingsInfluenced)}
              subtitle={`${m.bookingsInfluencedPct}% del total de bookings`}
            />
          </BentoCell>
          <BentoCell size="wide">
            <MetricCard
              className="h-full"
              title="Ventas influenciadas"
              value={String(m.salesInfluenced)}
              subtitle={`$${m.revenueInfluenced.toLocaleString("es-ES")} atribuidos`}
              {...sparklineProps("salesInfluenced", 300)}
            />
          </BentoCell>
          <BentoCell size="unit">
            <MetricCard
              className="h-full"
              title="Respuestas a historias"
              value={formatNum(additionalMarketingMetrics.storyReplies.value)}
              subtitle="Últimos 30 días"
              trend="up"
              trendValue={formatTrend(
                additionalMarketingMetrics.storyReplies.trend
              )}
              sparklineData={[
                ...additionalMarketingMetrics.storyReplies.sparkData,
              ]}
              sparklineColor="#F472B6"
              sparklineAnimationDelay={50}
            />
          </BentoCell>
          <BentoCell size="unit">
            <MetricCard
              className="h-full"
              title="Comentarios totales"
              value={formatNum(additionalMarketingMetrics.totalComments.value)}
              subtitle="Últimos 30 días"
              trend="up"
              trendValue={formatTrend(
                additionalMarketingMetrics.totalComments.trend
              )}
              {...sparklineProps("totalComments", 150)}
            />
          </BentoCell>
          <BentoCell size="wide">
            <MetricCard
              className="h-full"
              title="Crecimiento del perfil"
              value={`+${formatNum(additionalMarketingMetrics.profileGrowth.value)}`}
              subtitle={
                additionalMarketingMetrics.profileGrowth.label ??
                "Nuevos seguidores"
              }
              trend="up"
              trendValue={formatTrend(
                additionalMarketingMetrics.profileGrowth.trend
              )}
              {...sparklineProps("profileGrowth", 200)}
            />
          </BentoCell>
          <BentoCell size="wide">
            <MetricCard
              className="h-full"
              title="Conversión views → seguidores"
              value={`${additionalMarketingMetrics.viewsToFollowersRate.value}${additionalMarketingMetrics.viewsToFollowersRate.suffix ?? "%"}`}
              subtitle="Últimos 30 días"
              trend="up"
              trendValue={formatTrend(
                additionalMarketingMetrics.viewsToFollowersRate.trend,
                " pts"
              )}
              {...sparklineProps("viewsToFollowers", 250)}
            />
          </BentoCell>
        </BentoGrid>
        </>
      ) : null}

      <BentoGrid>
        <BentoCell size="banner">
          <ContentLabelDistributionChart
            counts={distribution.counts}
            total={distribution.total}
            insight={distribution.insight}
          />
        </BentoCell>
      </BentoGrid>

      {!instagramConnected ? (
        <InstagramEmptyState />
      ) : (
        <>
          <BentoGrid>
            <BentoCell size="large">
              <ReachInteractionsChart data={mockReachTimeSeries} />
            </BentoCell>
            <BentoCell size="wide">
              <ContentFunnelChart stages={mockContentFunnel} />
            </BentoCell>
            <BentoCell size="wide">
              <TopConvertingContentList ranked={topConverting} />
            </BentoCell>
            <BentoCell size="unit">
              <TypeRadarChart types={mockTypePerformance} />
            </BentoCell>
            <BentoCell size="unit">
              <PublishHeatmap cells={mockPublishHeatmap} />
            </BentoCell>
            <BentoCell size="wide">
              <FollowerGrowthChart data={mockFollowerGrowth} />
            </BentoCell>
          </BentoGrid>

          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Insights de IA
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {mockMarketingOverviewInsights.map((text) => (
                <div
                  key={text}
                  className="rounded-lg border border-border border-l-4 border-l-primary/60 bg-muted/20 px-4 py-3 text-sm leading-relaxed"
                >
                  {text}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
