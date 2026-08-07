"use client";

import { useMemo } from "react";
import {
  buildOverviewMetricsFromAssets,
  buildReachTimeSeriesFromAssets,
  buildContentFunnelFromAssets,
  buildTopConvertingFromAssets,
  buildTypePerformanceFromAssets,
  buildPublishHeatmapFromAssets,
  assetsHavePublishTimestamps,
} from "@/lib/marketing/overview-metrics";
import type { MarketingOverviewContext } from "@/app/marketing/actions";
import type { ContentLabel } from "@/lib/content/label-content";

export type DistributionData = {
  counts: Record<ContentLabel, number>;
  total: number;
  insight: string | null;
  hasContentAssets: boolean;
};

/**
 * Hook que centraliza toda la derivación de datos del Overview de Marketing.
 * Recibe los props del Server Component y devuelve datos listos para renderizar.
 */
export function useMarketingOverview(
  overview: MarketingOverviewContext,
  distribution: DistributionData
) {
  const { hasContentAssets, hasUtmAttributions, assets, utmLinks, utmSummary, socialAudience } =
    overview;

  const metrics = useMemo(
    () =>
      hasContentAssets
        ? buildOverviewMetricsFromAssets(assets, {
            totalOrgBookings: utmSummary.totalBookings,
            followers: socialAudience.followers,
            newFollowers: socialAudience.newFollowers,
          })
        : null,
    [hasContentAssets, assets, utmSummary, socialAudience]
  );

  const reachSeries = useMemo(
    () => (hasContentAssets ? buildReachTimeSeriesFromAssets(assets) : []),
    [hasContentAssets, assets]
  );

  const contentFunnel = useMemo(
    () => (hasContentAssets ? buildContentFunnelFromAssets(assets) : []),
    [hasContentAssets, assets]
  );

  const topConverting = useMemo(
    () => (hasContentAssets ? buildTopConvertingFromAssets(assets) : []),
    [hasContentAssets, assets]
  );

  const typePerformance = useMemo(
    () => (hasContentAssets ? buildTypePerformanceFromAssets(assets) : []),
    [hasContentAssets, assets]
  );

  const heatmap = useMemo(
    () => (hasContentAssets ? buildPublishHeatmapFromAssets(assets) : null),
    [hasContentAssets, assets]
  );

  const showHeatmap = hasContentAssets && assetsHavePublishTimestamps(assets) && heatmap;

  const funnelHasData =
    hasUtmAttributions ||
    (hasContentAssets &&
      contentFunnel.some((s) => s.value > 0 && s.stage !== "Impresiones"));

  // Sparklines a partir de la serie de alcance
  const reachSparkData = useMemo(
    () => reachSeries.map((d) => d.reach),
    [reachSeries]
  );
  const interactionsSparkData = useMemo(
    () => reachSeries.map((d) => d.interactions),
    [reachSeries]
  );

  // Tendencia semanal para DualAreaChart
  const dualTrendData = useMemo(
    () =>
      reachSeries.map((d) => ({
        label: d.day,
        primary: d.reach,
        secondary: d.interactions,
      })),
    [reachSeries]
  );

  return {
    hasContentAssets,
    hasUtmAttributions,
    assets,
    utmLinks,
    utmSummary,
    distribution,
    metrics,
    reachSeries,
    dualTrendData,
    reachSparkData,
    interactionsSparkData,
    contentFunnel,
    topConverting,
    typePerformance,
    heatmap,
    showHeatmap,
    funnelHasData,
  };
}
