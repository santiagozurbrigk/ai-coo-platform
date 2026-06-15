import type { ContentAssetView } from "@/app/marketing/actions";
import { formatDuration } from "@/lib/youtube/parse-duration";
import { estimateRetentionAtCTA } from "@/lib/youtube/retention";
import type { UTMLinkRow } from "@/types/utm";

export type YoutubeCtaPerformanceRow = {
  assetId: string;
  title: string;
  views: number;
  ctaSecond: number;
  ctaFormatted: string;
  retentionPct: number;
  leadsAttributed: number;
  revenue: number;
};

function resolveDurationSeconds(asset: ContentAssetView): number {
  return (
    asset.durationSeconds ??
    asset.platformMetadata?.youtube?.duration_seconds ??
    0
  );
}

function resolveRetentionPct(asset: ContentAssetView): number {
  if (asset.retentionAtCtaPct != null) return asset.retentionAtCtaPct;
  const duration = resolveDurationSeconds(asset);
  if (!asset.ctaMinute || !duration) return 0;
  return estimateRetentionAtCTA(asset.ctaMinute, duration);
}

export function buildYoutubeCtaPerformance(
  assets: ContentAssetView[],
  utmLinks: UTMLinkRow[]
): YoutubeCtaPerformanceRow[] {
  const utmByVideoId = new Map<string, UTMLinkRow>();
  for (const link of utmLinks) {
    if (link.youtube_video_id) {
      utmByVideoId.set(link.youtube_video_id, link);
    }
  }

  return assets
    .filter((asset) => asset.platform === "youtube" && asset.ctaMinute != null)
    .map((asset) => {
      const utm = utmByVideoId.get(asset.externalId ?? "");
      return {
        assetId: asset.id,
        title: asset.title,
        views: asset.views,
        ctaSecond: asset.ctaMinute!,
        ctaFormatted: formatDuration(asset.ctaMinute!),
        retentionPct: resolveRetentionPct(asset),
        leadsAttributed: utm?.leads_captured ?? 0,
        revenue: utm?.revenue_attributed ?? 0,
      };
    })
    .sort((a, b) => b.retentionPct - a.retentionPct);
}

export function generateCtaRetentionInsight(
  rows: YoutubeCtaPerformanceRow[]
): string | null {
  if (rows.length < 3) return null;

  const earlyThreshold = 8 * 60;
  const early = rows.filter((row) => row.ctaSecond < earlyThreshold);
  const late = rows.filter((row) => row.ctaSecond >= earlyThreshold);

  if (early.length < 2 || late.length < 1) return null;

  const avg = (list: YoutubeCtaPerformanceRow[]) =>
    list.reduce((sum, row) => sum + row.retentionPct, 0) / list.length;

  const avgEarly = avg(early);
  const avgLate = avg(late);

  if (avgEarly <= avgLate) return null;

  const diff = Math.round(((avgEarly - avgLate) / avgLate) * 100);
  return `Los videos donde el CTA está antes del minuto 8 retienen un ${diff}% más de audiencia hasta el llamado a la acción.`;
}
