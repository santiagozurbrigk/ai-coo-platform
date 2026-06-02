import type { ContentAssetView } from "@/app/marketing/actions";

export type ContentTypeFilter =
  | "all"
  | "reel"
  | "post"
  | "story"
  | "carousel"
  | "vsl";

export type ReelTypeFilter = "all" | "reel" | "trial_reel";
export type DistributionFilter = "all" | "organic" | "paid";
export type PeriodFilter = "7d" | "30d" | "90d" | "all";

export type ContentSortKey =
  | "date_desc"
  | "date_asc"
  | "views_total"
  | "views_organic"
  | "likes"
  | "saves"
  | "comments"
  | "shares"
  | "multiplier";

export type ContentAverages = {
  views: number;
  likes: number;
  saves: number;
  comments: number;
  shares: number;
};

export function calculateAverages(assets: ContentAssetView[]): ContentAverages {
  if (assets.length === 0) {
    return { views: 1, likes: 1, saves: 1, comments: 1, shares: 1 };
  }
  const sum = assets.reduce(
    (acc, a) => ({
      views: acc.views + a.views,
      likes: acc.likes + a.likes,
      saves: acc.saves + a.saves,
      comments: acc.comments + a.comments,
      shares: acc.shares + a.shares,
    }),
    { views: 0, likes: 0, saves: 0, comments: 0, shares: 0 }
  );
  const n = assets.length;
  return {
    views: sum.views / n || 1,
    likes: sum.likes / n || 1,
    saves: sum.saves / n || 1,
    comments: sum.comments / n || 1,
    shares: sum.shares / n || 1,
  };
}

export function calculateMultiplier(
  content: ContentAssetView,
  averages: ContentAverages
): number {
  const viewsScore = content.views / averages.views;
  const likesScore = content.likes / averages.likes;
  const savesScore = content.saves / averages.saves;
  const commentsScore = content.comments / averages.comments;
  const sharesScore = content.shares / averages.shares;

  const multiplier =
    viewsScore * 0.4 +
    savesScore * 0.25 +
    likesScore * 0.2 +
    commentsScore * 0.1 +
    sharesScore * 0.05;

  return Math.round(multiplier * 10) / 10;
}

export function enrichContentAssets(
  assets: ContentAssetView[]
): ContentAssetView[] {
  const averages = calculateAverages(assets);
  return assets.map((asset) => {
    const viewsOrganic =
      asset.viewsOrganic > 0
        ? asset.viewsOrganic
        : asset.distribution === "paid"
          ? Math.max(0, asset.views - asset.viewsPaid)
          : asset.views;
    const viewsPaid =
      asset.viewsPaid > 0
        ? asset.viewsPaid
        : asset.distribution === "paid"
          ? asset.views - viewsOrganic
          : 0;

    return {
      ...asset,
      viewsOrganic,
      viewsPaid,
      multiplier:
        asset.multiplier > 0
          ? asset.multiplier
          : calculateMultiplier(asset, averages),
    };
  });
}

function isWithinPeriod(
  publishedAt: string | null,
  period: PeriodFilter
): boolean {
  if (period === "all" || !publishedAt) return period === "all" || Boolean(publishedAt);
  const date = new Date(publishedAt);
  const now = new Date();
  const days =
    period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 0;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

const SORTERS: Record<
  ContentSortKey,
  (a: ContentAssetView, b: ContentAssetView) => number
> = {
  date_desc: (a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
  date_asc: (a, b) => (a.publishedAt ?? "").localeCompare(b.publishedAt ?? ""),
  views_total: (a, b) => b.views - a.views,
  views_organic: (a, b) => b.viewsOrganic - a.viewsOrganic,
  likes: (a, b) => b.likes - a.likes,
  saves: (a, b) => b.saves - a.saves,
  comments: (a, b) => b.comments - a.comments,
  shares: (a, b) => b.shares - a.shares,
  multiplier: (a, b) => b.multiplier - a.multiplier,
};

export function filterAndSortContent(
  assets: ContentAssetView[],
  filters: {
    type: ContentTypeFilter;
    reelType: ReelTypeFilter;
    distribution: DistributionFilter;
    sortBy: ContentSortKey;
    period: PeriodFilter;
    query: string;
  }
): ContentAssetView[] {
  let filtered = [...assets];

  if (filters.type !== "all") {
    filtered = filtered.filter(
      (a) => normalizeContentType(a.contentType) === filters.type
    );
  }

  if (filters.type === "reel" && filters.reelType !== "all") {
    filtered = filtered.filter((a) => a.reelType === filters.reelType);
  }

  if (filters.distribution !== "all") {
    filtered = filtered.filter((a) => a.distribution === filters.distribution);
  }

  if (filters.period !== "all") {
    filtered = filtered.filter((a) =>
      isWithinPeriod(a.publishedAt, filters.period)
    );
  }

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.caption.toLowerCase().includes(q)
    );
  }

  filtered.sort(SORTERS[filters.sortBy] ?? SORTERS.date_desc);
  return filtered;
}

export function normalizeContentType(
  contentType: string | null
): ContentTypeFilter | string {
  if (!contentType) return "post";
  const t = contentType.toLowerCase();
  if (t === "trial_reel") return "reel";
  return t;
}
