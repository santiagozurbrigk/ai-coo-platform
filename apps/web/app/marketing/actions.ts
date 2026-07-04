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
import {
  buildLandingUtmUrl,
  buildManychatUrl,
  normalizeInstagramUsername,
  resolveUtmBaseUrl,
  resolveUtmLinkType,
} from "@/lib/utm/build-links";
import { slugifyCampaign } from "@/lib/utm/slugify-campaign";
import { estimateRetentionAtCTA } from "@/lib/youtube/retention";
import type {
  UTMBookingAttributionRow,
  UTMLeadCaptureRow,
  UTMLinkRow,
  UTMFunnelData,
  UTMSaleAttributionRow,
} from "@/types/utm";

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
      .select("duration_seconds, platform_metadata")
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

    const retentionAtCtaPct = estimateRetentionAtCTA(
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

export async function getContentDistributionDataAction(): Promise<{
  counts: Record<ContentLabel, number>;
  total: number;
  insight: string | null;
  hasContentAssets: boolean;
}> {
  const organizationId = await requireOrganizationId();
  const assets = await listContentAssetsAction();
  const stats = buildDistributionStats(assets);
  const insight = await generateDistributionInsight({
    organizationId,
    stats,
  });

  return {
    counts: stats.counts,
    total: stats.total,
    insight,
    hasContentAssets: assets.length > 0,
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

function rowToUTMLink(row: Record<string, unknown>): UTMLinkRow {
  return {
    id: row.id as string,
    organization_id: row.organization_id as string,
    youtube_video_id: (row.youtube_video_id as string) ?? null,
    youtube_video_title: (row.youtube_video_title as string) ?? null,
    utm_source: (row.utm_source as string) ?? "youtube",
    utm_medium: (row.utm_medium as string) ?? "video",
    utm_campaign: row.utm_campaign as string,
    utm_content: (row.utm_content as string) ?? null,
    full_url: row.full_url as string,
    manychat_page_id: (row.manychat_page_id as string) ?? null,
    manychat_ref: (row.manychat_ref as string) ?? null,
    manychat_url: (row.manychat_url as string) ?? null,
    instagram_username: (row.instagram_username as string) ?? null,
    link_type:
      (row.link_type as UTMLinkRow["link_type"]) ??
      (row.manychat_url ? "both" : "landing"),
    clicks: Number(row.clicks ?? 0),
    leads_captured: Number(row.leads_captured ?? 0),
    bookings_attributed: Number(row.bookings_attributed ?? 0),
    sales_attributed: Number(row.sales_attributed ?? 0),
    revenue_attributed: Number(row.revenue_attributed ?? 0),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function rowToUTMLead(row: Record<string, unknown>): UTMLeadCaptureRow {
  return {
    id: row.id as string,
    organization_id: row.organization_id as string,
    utm_link_id: (row.utm_link_id as string) ?? null,
    utm_source: (row.utm_source as string) ?? null,
    utm_medium: (row.utm_medium as string) ?? null,
    utm_campaign: (row.utm_campaign as string) ?? null,
    utm_content: (row.utm_content as string) ?? null,
    lead_email: (row.lead_email as string) ?? null,
    lead_identifier: (row.lead_identifier as string) ?? null,
    captured_at: row.captured_at as string,
    converted_to_conversation: Boolean(row.converted_to_conversation),
    converted_to_booking: Boolean(row.converted_to_booking),
    converted_to_sale: Boolean(row.converted_to_sale),
  };
}

const CONTENT_ASSET_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Si llega el UUID interno del asset, guardar el external_id de YouTube para atribución. */
async function resolveYoutubeVideoExternalId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  videoId: string | undefined
): Promise<string | null | undefined> {
  if (!videoId?.trim()) return videoId ?? null;
  const trimmed = videoId.trim();
  if (!CONTENT_ASSET_UUID_RE.test(trimmed)) return trimmed;

  const { data } = await supabase
    .from("content_assets")
    .select("external_id")
    .eq("organization_id", organizationId)
    .eq("id", trimmed)
    .eq("platform", "youtube")
    .maybeSingle();

  return data?.external_id ?? trimmed;
}

export async function createUTMLinkAction(data: {
  youtube_video_id?: string;
  youtube_video_title?: string;
  utm_campaign: string;
  utm_content?: string;
  instagram_username?: string;
  manychat_page_id?: string;
}): Promise<MutationResult<UTMLinkRow>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const campaign =
      data.utm_campaign.trim() ||
      (data.youtube_video_title
        ? slugifyCampaign(data.youtube_video_title)
        : "");

    if (!campaign) {
      throw new Error("La campaña UTM es obligatoria.");
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("website_url")
      .eq("id", organizationId)
      .maybeSingle();

    const baseUrl = resolveUtmBaseUrl(org?.website_url ?? null);
    const full_url = buildLandingUtmUrl(
      campaign,
      data.utm_content,
      baseUrl
    );
    const instagramUsername = data.instagram_username
      ? normalizeInstagramUsername(data.instagram_username)
      : null;
    const { ref: manychat_ref, url: manychat_url } = buildManychatUrl({
      utmCampaign: campaign,
      instagramUsername,
      manychatPageId: data.manychat_page_id,
    });
    const link_type = resolveUtmLinkType(manychat_url);

    const youtubeVideoId = await resolveYoutubeVideoExternalId(
      supabase,
      organizationId,
      data.youtube_video_id
    );

    const { data: utmLink, error } = await supabase
      .from("utm_links")
      .insert({
        organization_id: organizationId,
        youtube_video_id: youtubeVideoId ?? null,
        youtube_video_title: data.youtube_video_title ?? null,
        utm_source: "youtube",
        utm_medium: "video",
        utm_campaign: campaign,
        utm_content: data.utm_content ?? null,
        full_url,
        manychat_ref,
        manychat_url,
        instagram_username: instagramUsername,
        manychat_page_id: data.manychat_page_id?.trim() || null,
        link_type,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Ya existe un UTM con esa campaña.");
      }
      throw new Error(error.message);
    }

    revalidatePath(paths.platform.marketing.utms);
    return rowToUTMLink(utmLink as Record<string, unknown>);
  });
}

export async function updateUTMLinkAction(
  id: string,
  data: {
    youtube_video_id?: string;
    youtube_video_title?: string;
    utm_campaign?: string;
    utm_content?: string;
    instagram_username?: string;
    manychat_page_id?: string;
  }
): Promise<MutationResult<UTMLinkRow>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: existing, error: readError } = await supabase
      .from("utm_links")
      .select("*")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (readError || !existing) {
      throw new Error("UTM no encontrado.");
    }

    const campaign =
      data.utm_campaign?.trim() ||
      (existing.utm_campaign as string) ||
      "";

    if (!campaign) {
      throw new Error("La campaña UTM es obligatoria.");
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("website_url")
      .eq("id", organizationId)
      .maybeSingle();

    const baseUrl = resolveUtmBaseUrl(org?.website_url ?? null);
    const utmContent =
      data.utm_content !== undefined
        ? data.utm_content || null
        : (existing.utm_content as string | null);
    const full_url = buildLandingUtmUrl(campaign, utmContent ?? undefined, baseUrl);

    const instagramUsername = data.instagram_username
      ? normalizeInstagramUsername(data.instagram_username)
      : (existing.instagram_username as string | null);

    const { ref: manychat_ref, url: manychat_url } = buildManychatUrl({
      utmCampaign: campaign,
      instagramUsername,
      manychatPageId:
        data.manychat_page_id?.trim() ||
        (existing.manychat_page_id as string | null),
    });
    const link_type = resolveUtmLinkType(manychat_url);

    const youtubeVideoId =
      data.youtube_video_id !== undefined
        ? await resolveYoutubeVideoExternalId(
            supabase,
            organizationId,
            data.youtube_video_id
          )
        : (existing.youtube_video_id as string | null);

    const { data: updated, error } = await supabase
      .from("utm_links")
      .update({
        youtube_video_id: youtubeVideoId ?? null,
        youtube_video_title:
          data.youtube_video_title !== undefined
            ? data.youtube_video_title ?? null
            : (existing.youtube_video_title as string | null),
        utm_campaign: campaign,
        utm_content: utmContent,
        full_url,
        manychat_ref,
        manychat_url,
        instagram_username: instagramUsername,
        manychat_page_id:
          data.manychat_page_id?.trim() ||
          (existing.manychat_page_id as string | null),
        link_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("organization_id", organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Ya existe un UTM con esa campaña.");
      }
      throw new Error(error.message);
    }

    revalidatePath(paths.platform.marketing.utms);
    return rowToUTMLink(updated as Record<string, unknown>);
  });
}

export async function deleteUTMLinkAction(id: string): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();

    const { error } = await admin
      .from("utm_links")
      .delete()
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.marketing.utms);
  });
}

export async function getOrganizationWebsiteAction(): Promise<string | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data } = await supabase
    .from("organizations")
    .select("website_url")
    .eq("id", organizationId)
    .maybeSingle();

  return (data?.website_url as string | null) ?? null;
}

/** URL base para previews de UTM (org o fallback OTC). */
export async function getUtmBaseUrlAction(): Promise<string> {
  const websiteUrl = await getOrganizationWebsiteAction();
  return resolveUtmBaseUrl(websiteUrl);
}

export async function getUTMLinksAction(): Promise<UTMLinkRow[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("utm_links")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((row) =>
    rowToUTMLink(row as Record<string, unknown>)
  );
}

export async function getUTMLeadsAction(
  utmLinkId: string
): Promise<MutationResult<UTMLeadCaptureRow[]>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("utm_lead_captures")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("utm_link_id", utmLinkId)
      .order("captured_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) =>
      rowToUTMLead(row as Record<string, unknown>)
    );
  });
}

function mapClosingCallEmbed(
  raw: unknown
): UTMBookingAttributionRow["closing_calls"] {
  if (!raw) return null;
  const embedded = Array.isArray(raw) ? raw[0] : raw;
  if (!embedded || typeof embedded !== "object") return null;
  const row = embedded as Record<string, unknown>;
  return {
    lead_name: (row.lead_name as string) ?? "",
    scheduled_at: (row.scheduled_at as string) ?? "",
    status: (row.status as string) ?? "",
  };
}

function mapClientEmbed(raw: unknown): UTMSaleAttributionRow["clients"] {
  if (!raw) return null;
  const embedded = Array.isArray(raw) ? raw[0] : raw;
  if (!embedded || typeof embedded !== "object") return null;
  const row = embedded as Record<string, unknown>;
  return {
    name: (row.name as string) ?? "",
    status: (row.status as string) ?? "",
  };
}

export async function getUTMFunnelAction(
  utmLinkId: string
): Promise<MutationResult<UTMFunnelData>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const [captures, bookings, sales] = await Promise.all([
      supabase
        .from("utm_lead_captures")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("utm_link_id", utmLinkId)
        .order("captured_at", { ascending: false }),

      supabase
        .from("utm_booking_attributions")
        .select("id, lead_name, lead_email, booked_at, closing_calls(lead_name, scheduled_at, status)")
        .eq("organization_id", organizationId)
        .eq("utm_link_id", utmLinkId)
        .order("booked_at", { ascending: false }),

      supabase
        .from("utm_sale_attributions")
        .select("id, revenue, sold_at, clients(name, status)")
        .eq("organization_id", organizationId)
        .eq("utm_link_id", utmLinkId)
        .order("sold_at", { ascending: false }),
    ]);

    if (captures.error) throw new Error(captures.error.message);
    if (bookings.error) throw new Error(bookings.error.message);
    if (sales.error) throw new Error(sales.error.message);

    const salesRows = sales.data ?? [];

    return {
      leads: (captures.data ?? []).map((row) =>
        rowToUTMLead(row as Record<string, unknown>)
      ),
      bookings: (bookings.data ?? []).map((row) => ({
        id: row.id as string,
        lead_name: (row.lead_name as string | null) ?? null,
        lead_email: (row.lead_email as string | null) ?? null,
        booked_at: row.booked_at as string,
        closing_calls: mapClosingCallEmbed(row.closing_calls),
      })),
      sales: salesRows.map((row) => ({
        id: row.id as string,
        revenue: Number(row.revenue ?? 0),
        sold_at: row.sold_at as string,
        clients: mapClientEmbed(row.clients),
      })),
      totalRevenue: salesRows.reduce(
        (sum, s) => sum + Number(s.revenue ?? 0),
        0
      ),
    };
  });
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
