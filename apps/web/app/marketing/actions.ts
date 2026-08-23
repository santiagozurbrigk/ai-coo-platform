"use server";

import { revalidatePath } from "next/cache";
import {
  requireOrganizationId,
  tryRequireOrganizationId,
} from "@/lib/auth/bootstrap";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  getSalesContentRank,
  type SalesContentRankView,
} from "@/lib/marketing/content-sales-rank";
import { getClosedBuyerJourneys } from "@/lib/marketing/closed-buyer-journeys";
import { recomputeContentAssetAttribution } from "@/lib/marketing/content-attribution";
import { analyzeContentSalesPatterns } from "@/lib/marketing/analyze-content-patterns";
import { getSocialAudienceStats } from "@/lib/marketing/social-audience";
import type { ClosedBuyerJourney, MarketingAiInsight } from "@/types/marketing-insights";
import { createAdminClient } from "@/lib/supabase/admin";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import type { ContentLabel } from "@/lib/content/label-content";
import {
  buildDistributionStats,
  generateDistributionInsight,
} from "@/lib/content/distribution-insight";
import { paths } from "@/routes";
import { getRetentionAtCTA } from "@/lib/youtube/analytics";
import { getUTMLinksAction } from "./utm-actions";
import type { UTMLinkRow } from "@/types/utm";

export type YouTubePlatformMetadataView = {
  view_count: number;
  like_count: number;
  comment_count: number;
  favorite_count: number;
  duration_seconds: number;
  definition: string | null;
  published_at: string | null;
  thumbnail_url: string | null;
  tags: string[];
};

export type ContentAssetPlatformMetadata = {
  youtube?: YouTubePlatformMetadataView;
};

export type ContentAssetView = {
  id: string;
  externalId: string;
  platform: "instagram" | "youtube";
  title: string;
  caption: string;
  thumbnailUrl: string | null;
  contentType: string | null;
  publishedAt: string | null;
  views: number;
  viewsOrganic: number;
  viewsPaid: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  reelType: "reel" | "trial_reel" | null;
  distribution: "organic" | "paid";
  storyReplies: number;
  multiplier: number;
  effectiveLabel: ContentLabel | null;
  aiLabel: ContentLabel | null;
  manualLabel: ContentLabel | null;
  aiLabelConfidence: number | null;
  aiLabelReasoning: string | null;
  conversationsGenerated: number;
  bookingsInfluenced: number;
  salesInfluenced: number;
  revenueInfluenced: number;
  ctaMinute: number | null;
  retentionAtCtaPct: number | null;
  durationSeconds: number | null;
  platformMetadata: ContentAssetPlatformMetadata | null;
  engagementRate: number | null;
};

function rowToView(row: Record<string, unknown>): ContentAssetView {
  const caption = (row.caption as string) ?? "";
  const title =
    (row.title as string)?.trim() ||
    caption.trim().slice(0, 80) ||
    "Sin título";
  const platform = row.platform as "instagram" | "youtube";
  const likes = Number(row.likes ?? 0);
  const comments = Number(row.comments ?? 0);
  const shares = Number(row.shares ?? 0);
  const saves = Number(row.saves ?? 0);
  const reach = Number(row.reach ?? 0);
  const platformMetadata =
    (row.platform_metadata as ContentAssetPlatformMetadata | null) ?? null;
  const durationSeconds =
    row.duration_seconds != null
      ? Number(row.duration_seconds)
      : (platformMetadata?.youtube?.duration_seconds ?? null);

  const engagementRate =
    platform === "instagram" && reach > 0
      ? Math.round(((likes + comments + saves + shares) / reach) * 1000) / 10
      : null;

  return {
    id: row.id as string,
    externalId: (row.external_id as string) ?? "",
    platform,
    title,
    caption: (row.caption as string) ?? "",
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    contentType: (row.content_type as string) ?? null,
    publishedAt: (row.published_at as string) ?? null,
    views: Number(row.views ?? 0),
    viewsOrganic: Number(row.views_organic ?? row.views ?? 0),
    viewsPaid: Number(row.views_paid ?? 0),
    likes,
    comments,
    shares,
    saves,
    reach,
    reelType: (row.reel_type as "reel" | "trial_reel") ?? null,
    distribution:
      row.distribution === "paid"
        ? "paid"
        : "organic",
    storyReplies: Number(row.story_replies ?? 0),
    multiplier: Number(row.multiplier ?? 0),
    effectiveLabel: (row.effective_label as ContentLabel) ?? null,
    aiLabel: (row.ai_content_label as ContentLabel) ?? null,
    manualLabel: (row.manual_content_label as ContentLabel) ?? null,
    aiLabelConfidence:
      row.ai_label_confidence != null
        ? Number(row.ai_label_confidence)
        : null,
    aiLabelReasoning: (row.ai_label_reasoning as string) ?? null,
    conversationsGenerated: Number(row.conversations_generated ?? 0),
    bookingsInfluenced: Number(row.bookings_influenced ?? 0),
    salesInfluenced: Number(row.sales_influenced ?? 0),
    revenueInfluenced: Number(row.revenue_influenced ?? 0),
    ctaMinute: row.cta_minute != null ? Number(row.cta_minute) : null,
    retentionAtCtaPct:
      row.retention_at_cta_pct != null
        ? Number(row.retention_at_cta_pct)
        : null,
    durationSeconds,
    platformMetadata,
    engagementRate,
  };
}

export async function listContentAssetsAction(): Promise<ContentAssetView[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_assets")
    .select("*")
    .eq("organization_id", organizationId)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[listContentAssetsAction]", error.message);
    return [];
  }
  return (data ?? []).map(rowToView);
}

export async function getContentAssetByIdAction(
  assetId: string
): Promise<ContentAssetView | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_assets")
    .select("*")
    .eq("id", assetId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToView(data as Record<string, unknown>);
}

export type MarketingOverviewContext = {
  hasContentAssets: boolean;
  hasUtmAttributions: boolean;
  assets: ContentAssetView[];
  utmLinks: UTMLinkRow[];
  utmSummary: {
    totalBookings: number;
    totalSales: number;
    totalRevenue: number;
    totalClicks: number;
  };
  socialAudience: {
    followers: number;
    newFollowers: number;
  };
};

export async function getMarketingOverviewContextAction(): Promise<MarketingOverviewContext> {
  const organizationId = await requireOrganizationId();

  await recomputeContentAssetAttribution(organizationId).catch((err) => {
    console.error("[getMarketingOverviewContext] recompute attribution:", err);
  });

  const admin = createAdminClient();
  const [assets, utmLinks, socialAudience, bookingsCount] = await Promise.all([
    listContentAssetsAction(),
    getUTMLinksAction(),
    getSocialAudienceStats(organizationId),
    admin
      .from("closing_calls")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .then(({ count }) => count ?? 0),
  ]);

  const utmSummary = utmLinks.reduce(
    (acc, link) => ({
      totalBookings: acc.totalBookings + link.bookings_attributed,
      totalSales: acc.totalSales + link.sales_attributed,
      totalRevenue: acc.totalRevenue + link.revenue_attributed,
      totalClicks: acc.totalClicks + link.clicks,
    }),
    { totalBookings: 0, totalSales: 0, totalRevenue: 0, totalClicks: 0 }
  );

  const totalBookings = Math.max(utmSummary.totalBookings, bookingsCount);

  const hasUtmAttributions =
    utmSummary.totalBookings > 0 ||
    utmSummary.totalSales > 0 ||
    utmSummary.totalRevenue > 0;

  return {
    hasContentAssets: assets.length > 0,
    hasUtmAttributions,
    assets,
    utmLinks,
    utmSummary: { ...utmSummary, totalBookings },
    socialAudience,
  };
}

export async function updateContentLabelAction(
  assetId: string,
  label: ContentLabel | null
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const { error } = await supabase
      .from("content_assets")
      .update({ manual_content_label: label })
      .eq("id", assetId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.marketing.content);
    revalidatePath(paths.platform.marketing.overview);
  });
}

export async function updateCTAMinuteAction(
  assetId: string,
  ctaSecond: number
): Promise<MutationResult<{ retentionAtCtaPct: number }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: asset, error: fetchError } = await supabase
      .from("content_assets")
      .select("duration_seconds, platform_metadata, external_id")
      .eq("id", assetId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (fetchError || !asset) {
      throw new Error(fetchError?.message ?? "Video no encontrado");
    }

    const metadata = (asset.platform_metadata ?? {}) as ContentAssetPlatformMetadata;
    const durationSeconds =
      asset.duration_seconds != null
        ? Number(asset.duration_seconds)
        : (metadata.youtube?.duration_seconds ?? 0);

    const videoId = (asset.external_id as string | null) ?? null;
    const retentionAtCtaPct = await getRetentionAtCTA(
      organizationId,
      videoId,
      ctaSecond,
      durationSeconds
    );

    const { error } = await supabase
      .from("content_assets")
      .update({
        cta_minute: ctaSecond,
        retention_at_cta_pct: retentionAtCtaPct,
      })
      .eq("id", assetId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);

    revalidatePath(paths.platform.marketing.content);
    revalidatePath(`${paths.platform.marketing.content}/${assetId}`);
    revalidatePath(paths.platform.marketing.overview);

    return { retentionAtCtaPct };
  });
}

export async function getContentLabelDistributionAction(): Promise<
  Record<ContentLabel, number>
> {
  const assets = await listContentAssetsAction();
  const base: Record<ContentLabel, number> = {
    AUTORIDAD: 0,
    ATRACCION: 0,
    NUTRICION: 0,
    VENTA: 0,
  };
  for (const a of assets) {
    if (a.effectiveLabel) base[a.effectiveLabel]++;
  }
  return base;
}

/**
 * Mapea los campos de análisis de content_pieces (hook_type, cta_type)
 * a la taxonomía ContentLabel (AUTORIDAD / ATRACCION / NUTRICION / VENTA).
 *
 * Reglas de negocio:
 * - CTA de conversión directa (dm, comment_word) → VENTA
 * - Hook contrarian o prueba_social sin CTA de venta → AUTORIDAD
 * - Hook de curiosidad sin CTA de venta → ATRACCION
 * - Hook de dolor directo o resultado sin CTA de venta → NUTRICION
 * - Sin datos suficientes → null (se omite)
 */
function mapContentPieceAnalysisToLabel(analysis: {
  hook_type?: string | null;
  cta_type?: string | null;
}): ContentLabel | null {
  const { hook_type, cta_type } = analysis;
  if (!hook_type && !cta_type) return null;
  if (cta_type === "dm" || cta_type === "comment_word") return "VENTA";
  if (hook_type === "contrarian" || hook_type === "prueba_social") return "AUTORIDAD";
  if (hook_type === "curiosidad") return "ATRACCION";
  if (hook_type === "dolor_directo" || hook_type === "resultado") return "NUTRICION";
  return null;
}

export async function getContentDistributionDataAction(): Promise<{
  counts: Record<ContentLabel, number>;
  total: number;
  insight: string | null;
  hasContentAssets: boolean;
}> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  // 1. Piezas legacy (content_assets) — ya etiquetadas con ContentLabel
  const assets = await listContentAssetsAction();

  // 2. Piezas Zernio (content_pieces) — mapear desde analysis.hook_type/cta_type
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("analysis")
    .eq("organization_id", organizationId)
    .not("analysis", "is", null);

  const zernioItems = (pieces ?? [])
    .map((p) => {
      const a = p.analysis as { hook_type?: string | null; cta_type?: string | null } | null;
      if (!a) return null;
      const effectiveLabel = mapContentPieceAnalysisToLabel(a);
      return effectiveLabel
        ? { effectiveLabel, conversationsGenerated: 0, bookingsInfluenced: 0, salesInfluenced: 0 }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // 3. Combinar ambas fuentes para las estadísticas
  const combined = [...assets, ...zernioItems];
  const stats = buildDistributionStats(combined);
  const insight = await generateDistributionInsight({
    organizationId,
    stats,
  });

  return {
    counts: stats.counts,
    total: stats.total,
    insight,
    hasContentAssets: combined.length > 0,
  };
}

export async function getYoutubeIntegrationStatusAction(): Promise<{
  connected: boolean;
  channelName: string | null;
  lastSyncAt: string | null;
}> {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const { data } = await admin
    .from("youtube_integrations")
    .select("status, channel_name, last_sync_at")
    .eq("organization_id", organizationId)
    .maybeSingle();

  return {
    connected: data?.status === "connected",
    channelName: data?.channel_name ?? null,
    lastSyncAt: data?.last_sync_at ?? null,
  };
}


export async function getInstagramIntegrationStatusAction(): Promise<{
  connected: boolean;
  username: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  status: "active" | "error" | "disconnected" | null;
}> {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const { data } = await admin
    .from("instagram_integrations")
    .select(
      "status, instagram_username, connected_at, last_sync_at"
    )
    .eq("organization_id", organizationId)
    .maybeSingle();

  const status =
    (data?.status as "active" | "error" | "disconnected" | undefined) ?? null;

  return {
    connected: status === "active",
    username: data?.instagram_username ?? null,
    connectedAt: data?.connected_at ?? null,
    lastSyncAt: data?.last_sync_at ?? null,
    status,
  };
}

export async function getSalesContentRankAction(): Promise<
  SalesContentRankView[]
> {
  if (!isSupabaseConfigured()) return [];
  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return [];
  try {
    return await getSalesContentRank(organizationId);
  } catch (error) {
    console.error("[getSalesContentRank]", error);
    return [];
  }
}

export async function getClosedBuyerJourneysAction(): Promise<
  ClosedBuyerJourney[]
> {
  if (!isSupabaseConfigured()) return [];
  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return [];
  try {
    return await getClosedBuyerJourneys(organizationId);
  } catch (error) {
    console.error("[getClosedBuyerJourneys]", error);
    return [];
  }
}

export async function getContentPatternsAnalysisAction(): Promise<
  MarketingAiInsight[]
> {
  if (!isSupabaseConfigured()) return [];
  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return [];

  try {
    const [rank, journeys, assets] = await Promise.all([
      getSalesContentRank(organizationId),
      getClosedBuyerJourneys(organizationId),
      listContentAssetsAction(),
    ]);

    if (rank.length === 0 && journeys.length === 0) return [];

    const rankSummary = rank
      .map(
        (r) =>
          `- ${r.title} (${r.type}): ${r.salesCount} ventas, $${r.revenue}`
      )
      .join("\n");

    const journeysSummary = journeys
      .slice(0, 8)
      .map(
        (j) =>
          `${j.leadName}: ${j.steps.map((s) => s.label).join(" → ")} ($${j.closedAmount})`
      )
      .join("\n");

    const assetsSummary = assets
      .slice(0, 20)
      .map(
        (a) =>
          `- ${a.title} [${a.contentType ?? "?"}] label=${a.effectiveLabel ?? "—"} conv=${a.conversationsGenerated} ventas=${a.salesInfluenced}`
      )
      .join("\n");

    const insights = await analyzeContentSalesPatterns({
      organizationId,
      rankSummary: rankSummary || "Sin ranking todavía",
      journeysSummary: journeysSummary || "Sin journeys todavía",
      assetsSummary: assetsSummary || "Sin contenido importado",
    });

    return insights ?? [];
  } catch (error) {
    console.error("[getContentPatternsAnalysis]", error);
    return [];
  }
}
