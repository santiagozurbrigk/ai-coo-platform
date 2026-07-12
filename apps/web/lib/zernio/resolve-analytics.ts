import type { ZernioPostAnalytics } from "@/lib/zernio/client";
import type { ContentMetrics } from "@/types/content";

type PlatformMetrics = {
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  saves?: number;
  views?: number;
};

function mapAnalyticsToMetrics(analytics?: ZernioPostAnalytics): ContentMetrics {
  const impressions = analytics?.impressions ?? 0;
  const reach = analytics?.reach ?? 0;
  const views = analytics?.views ?? (impressions || reach);

  return {
    likes: analytics?.likes ?? 0,
    comments: analytics?.comments ?? 0,
    shares: analytics?.shares ?? 0,
    saves: analytics?.saves ?? 0,
    reach,
    impressions,
    views,
  };
}

function aggregatePlatformMetrics(
  platforms: Record<string, PlatformMetrics>
): ContentMetrics {
  let likes = 0;
  let comments = 0;
  let shares = 0;
  let saves = 0;
  let reach = 0;
  let impressions = 0;
  let views = 0;

  for (const metrics of Object.values(platforms)) {
    if (!metrics || typeof metrics !== "object") continue;
    likes += metrics.likes ?? 0;
    comments += metrics.comments ?? 0;
    shares += metrics.shares ?? 0;
    saves += metrics.saves ?? 0;
    reach += metrics.reach ?? 0;
    impressions += metrics.impressions ?? 0;
    views += metrics.views ?? 0;
  }

  return {
    likes,
    comments,
    shares,
    saves,
    reach,
    impressions,
    views: views || impressions || reach,
  };
}

/** Normaliza analytics planos o anidados por plataforma ({ instagram: {...} }). */
export function resolvePostAnalytics(analytics: unknown): {
  metrics: ContentMetrics;
  lastUpdated?: string;
} {
  const empty: ContentMetrics = {
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    reach: 0,
    impressions: 0,
    views: 0,
  };

  if (!analytics || typeof analytics !== "object") {
    return { metrics: empty };
  }

  const root = analytics as Record<string, unknown>;
  const lastUpdated =
    typeof root.lastUpdated === "string" ? root.lastUpdated : undefined;

  // Formato plano: { likes, views, reach, ... }
  if (
    typeof root.likes === "number" ||
    typeof root.views === "number" ||
    typeof root.reach === "number" ||
    typeof root.impressions === "number"
  ) {
    return {
      metrics: mapAnalyticsToMetrics(root as ZernioPostAnalytics),
      lastUpdated,
    };
  }

  // Formato anidado: { platforms: { instagram: {...} } } o { instagram: {...} }
  const platformRecord =
    root.platforms && typeof root.platforms === "object"
      ? (root.platforms as Record<string, PlatformMetrics>)
      : (Object.fromEntries(
          Object.entries(root).filter(
            ([, value]) => value && typeof value === "object" && !Array.isArray(value)
          )
        ) as Record<string, PlatformMetrics>);

  const aggregated = aggregatePlatformMetrics(platformRecord);
  const hasData =
    aggregated.likes ||
    aggregated.comments ||
    aggregated.views ||
    aggregated.reach ||
    aggregated.impressions;

  return {
    metrics: hasData ? aggregated : empty,
    lastUpdated,
  };
}
