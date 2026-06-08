"use client";

import type { ContentLabel } from "@/lib/content/label-content";
import { mockContentAssets } from "@/mocks/marketing-insights";
import {
  mockContentFunnel,
  mockFollowerGrowth,
  mockMarketingOverviewInsights,
  mockPublishHeatmap,
  mockReachTimeSeries,
  mockTypePerformance,
} from "@/mocks/marketing";
import { useMarketingData } from "@/providers";
import { BentoCell, BentoGrid } from "@/components/shared/bento-grid";
import { ContentLabelDistributionChart } from "@/components/marketing/content-label-distribution-chart";
import { MarketingMetricsSections } from "@/components/marketing/overview";
import { InstagramEmptyState } from "./instagram-empty-state";
import {
  ContentFunnelChart,
  FollowerGrowthChart,
  PublishHeatmap,
  ReachInteractionsChart,
  TopConvertingContentList,
  TypeRadarChart,
} from "./marketing-charts";

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
      {instagramConnected ? <MarketingMetricsSections /> : null}

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
