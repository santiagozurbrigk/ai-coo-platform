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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Alcance total"
            value={formatNum(m.totalReach)}
            subtitle="Últimos 30 días"
            trend="up"
            trendValue={`+${m.reachTrendPct}%`}
            {...sparklineProps("reach", 0)}
          />
          <MetricCard
            title="Interacciones totales"
            value={formatNum(m.totalInteractions)}
            subtitle={`Engagement ${m.engagementRatePct}%`}
            trend="up"
            trendValue={`+${m.interactionsTrendPct}%`}
            {...sparklineProps("interactions", 100)}
          />
          <MetricCard
            title="Contenido publicado"
            value={String(m.contentPublished)}
            subtitle={`${m.reelsCount} reels · ${m.postsCount} posts · ${m.storiesCount} stories`}
          />
          <MetricCard
            title="Conversaciones generadas"
            value={String(m.conversationsGenerated)}
            subtitle="Vinculadas a bandeja de ventas"
            {...sparklineProps("conversations", 200)}
          />
          <MetricCard
            title="Bookings influenciados"
            value={String(m.bookingsInfluenced)}
            subtitle={`${m.bookingsInfluencedPct}% del total de bookings`}
          />
          <MetricCard
            title="Ventas influenciadas"
            value={String(m.salesInfluenced)}
            subtitle={`$${m.revenueInfluenced.toLocaleString("es-ES")} atribuidos`}
            {...sparklineProps("salesInfluenced", 300)}
          />
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
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
            <MetricCard
              title="Comentarios totales"
              value={formatNum(additionalMarketingMetrics.totalComments.value)}
              subtitle="Últimos 30 días"
              trend="up"
              trendValue={formatTrend(
                additionalMarketingMetrics.totalComments.trend
              )}
              {...sparklineProps("totalComments", 150)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
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
            <MetricCard
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
          </div>
        </div>
        </>
      ) : null}

      <ContentLabelDistributionChart
        counts={distribution.counts}
        total={distribution.total}
        insight={distribution.insight}
      />

      {!instagramConnected ? (
        <InstagramEmptyState />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <ReachInteractionsChart data={mockReachTimeSeries} />
            <div className="flex w-full flex-col gap-6 lg:col-span-2">
              <ContentFunnelChart stages={mockContentFunnel} />
              <TopConvertingContentList ranked={topConverting} />
            </div>
            <TypeRadarChart types={mockTypePerformance} />
            <PublishHeatmap cells={mockPublishHeatmap} />
            <FollowerGrowthChart data={mockFollowerGrowth} />
          </div>

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
