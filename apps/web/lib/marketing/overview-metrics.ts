import type { ContentAssetView } from "@/app/marketing/actions";
import type {
  ContentFunnelStage,
  ContentTypePerformance,
  HeatmapCell,
  MarketingOverviewMetrics,
  MarketingTimePoint,
} from "@/types/marketing-insights";

export type TopConvertingItem = {
  contentId: string;
  title: string;
  conversations: number;
  bookings: number;
  thumbnailUrl: string | null;
  contentType: string | null;
};

function interactions(asset: ContentAssetView): number {
  return asset.likes + asset.comments + asset.shares + asset.saves;
}

export function buildOverviewMetricsFromAssets(
  assets: ContentAssetView[]
): MarketingOverviewMetrics {
  const totalReach = assets.reduce((sum, a) => sum + a.reach, 0);
  const totalInteractions = assets.reduce((sum, a) => sum + interactions(a), 0);
  const engagementRatePct =
    totalReach > 0
      ? Math.round((totalInteractions / totalReach) * 1000) / 10
      : 0;

  const reelsCount = assets.filter((a) => a.contentType === "reel").length;
  const postsCount = assets.filter((a) => a.contentType === "post").length;
  const storiesCount = assets.filter((a) => a.contentType === "story").length;

  const conversationsGenerated = assets.reduce(
    (sum, a) => sum + a.conversationsGenerated,
    0
  );
  const bookingsInfluenced = assets.reduce(
    (sum, a) => sum + a.bookingsInfluenced,
    0
  );
  const salesInfluenced = assets.reduce((sum, a) => sum + a.salesInfluenced, 0);
  const revenueInfluenced = assets.reduce(
    (sum, a) => sum + a.revenueInfluenced,
    0
  );

  return {
    totalReach,
    reachTrendPct: 0,
    totalInteractions,
    engagementRatePct,
    interactionsTrendPct: 0,
    contentPublished: assets.length,
    reelsCount,
    postsCount,
    storiesCount,
    conversationsGenerated,
    bookingsInfluenced,
    bookingsInfluencedPct: 0,
    salesInfluenced,
    revenueInfluenced,
    followers: 0,
    newFollowers: 0,
  };
}

export function buildReachTimeSeriesFromAssets(
  assets: ContentAssetView[]
): MarketingTimePoint[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const buckets = new Map<string, { reach: number; interactions: number }>();

  for (const asset of assets) {
    if (!asset.publishedAt) continue;
    const date = new Date(asset.publishedAt);
    if (date < cutoff) continue;
    const key = `${date.getDate()}`;
    const prev = buckets.get(key) ?? { reach: 0, interactions: 0 };
    buckets.set(key, {
      reach: prev.reach + asset.reach,
      interactions: prev.interactions + interactions(asset),
    });
  }

  if (buckets.size === 0) return [];

  return [...buckets.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([day, values]) => ({
      day,
      reach: values.reach,
      interactions: values.interactions,
    }));
}

export function buildContentFunnelFromAssets(
  assets: ContentAssetView[]
): ContentFunnelStage[] {
  const impressions = assets.reduce(
    (sum, a) => sum + (a.reach || a.views),
    0
  );
  const interactionsTotal = assets.reduce((sum, a) => sum + interactions(a), 0);
  const conversations = assets.reduce(
    (sum, a) => sum + a.conversationsGenerated,
    0
  );
  const bookings = assets.reduce((sum, a) => sum + a.bookingsInfluenced, 0);
  const sales = assets.reduce((sum, a) => sum + a.salesInfluenced, 0);

  const pct = (from: number, to: number) =>
    from > 0 ? Math.round((to / from) * 1000) / 10 : 0;

  return [
    { stage: "Impresiones", value: impressions, conversionToNextPct: pct(impressions, interactionsTotal) },
    { stage: "Interacciones", value: interactionsTotal, conversionToNextPct: pct(interactionsTotal, conversations) },
    { stage: "Conversaciones", value: conversations, conversionToNextPct: pct(conversations, bookings) },
    { stage: "Bookings", value: bookings, conversionToNextPct: pct(bookings, sales) },
    { stage: "Ventas", value: sales },
  ];
}

export function buildTypePerformanceFromAssets(
  assets: ContentAssetView[]
): ContentTypePerformance[] {
  const byType = new Map<string, { reach: number; conversions: number }>();

  for (const asset of assets) {
    const type = asset.contentType ?? "post";
    const prev = byType.get(type) ?? { reach: 0, conversions: 0 };
    byType.set(type, {
      reach: prev.reach + asset.reach,
      conversions: prev.conversions + asset.conversationsGenerated,
    });
  }

  return [...byType.entries()].map(([type, values]) => ({
    type: type as ContentTypePerformance["type"],
    reach: values.reach,
    conversions: values.conversions,
  }));
}

export function buildPublishHeatmapFromAssets(
  assets: ContentAssetView[]
): HeatmapCell[] | null {
  const dated = assets.filter((a) => a.publishedAt);
  if (dated.length < 2) return null;

  const cells: HeatmapCell[] = [];
  const engagementBySlot = new Map<string, { sum: number; count: number }>();

  for (const asset of dated) {
    const date = new Date(asset.publishedAt!);
    const day = (date.getDay() + 6) % 7;
    const hour = Math.floor(date.getHours() / 2) * 2;
    const key = `${day}-${hour}`;
    const score = interactions(asset) / Math.max(asset.reach || asset.views, 1);
    const prev = engagementBySlot.get(key) ?? { sum: 0, count: 0 };
    engagementBySlot.set(key, { sum: prev.sum + score, count: prev.count + 1 });
  }

  const maxAvg = Math.max(
    ...[...engagementBySlot.values()].map((v) => v.sum / v.count),
    0.001
  );

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour += 2) {
      const slot = engagementBySlot.get(`${day}-${hour}`);
      const engagement = slot
        ? slot.sum / slot.count / maxAvg
        : 0.1;
      cells.push({ day, hour, engagement: Math.min(1, engagement) });
    }
  }

  return cells;
}

export function buildTopConvertingFromAssets(
  assets: ContentAssetView[]
): TopConvertingItem[] {
  return [...assets]
    .sort((a, b) => {
      const convDiff = b.conversationsGenerated - a.conversationsGenerated;
      if (convDiff !== 0) return convDiff;
      return interactions(b) - interactions(a);
    })
    .slice(0, 4)
    .map((asset) => ({
      contentId: asset.id,
      title: asset.title,
      conversations: asset.conversationsGenerated,
      bookings: asset.bookingsInfluenced,
      thumbnailUrl: asset.thumbnailUrl,
      contentType: asset.contentType,
    }));
}

export function assetsHavePublishTimestamps(assets: ContentAssetView[]): boolean {
  return assets.filter((a) => a.publishedAt).length >= 2;
}
