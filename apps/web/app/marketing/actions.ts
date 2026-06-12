"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
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
  resolveUtmLinkType,
} from "@/lib/utm/build-links";
import { slugifyCampaign } from "@/lib/utm/slugify-campaign";
import type { UTMLeadCaptureRow, UTMLinkRow } from "@/types/utm";

export type ContentAssetView = {
  id: string;
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
};

function rowToView(row: Record<string, unknown>): ContentAssetView {
  return {
    id: row.id as string,
    platform: row.platform as "instagram" | "youtube",
    title: (row.title as string) ?? "Sin título",
    caption: (row.caption as string) ?? "",
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    contentType: (row.content_type as string) ?? null,
    publishedAt: (row.published_at as string) ?? null,
    views: Number(row.views ?? 0),
    viewsOrganic: Number(row.views_organic ?? row.views ?? 0),
    viewsPaid: Number(row.views_paid ?? 0),
    likes: Number(row.likes ?? 0),
    comments: Number(row.comments ?? 0),
    shares: Number(row.shares ?? 0),
    saves: Number(row.saves ?? 0),
    reach: Number(row.reach ?? 0),
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

  if (error) return [];
  return (data ?? []).map(rowToView);
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

    const full_url = buildLandingUtmUrl(campaign, data.utm_content);
    const instagramUsername = data.instagram_username
      ? normalizeInstagramUsername(data.instagram_username)
      : null;
    const { ref: manychat_ref, url: manychat_url } = buildManychatUrl({
      utmCampaign: campaign,
      instagramUsername,
      manychatPageId: data.manychat_page_id,
    });
    const link_type = resolveUtmLinkType(manychat_url);

    const { data: utmLink, error } = await supabase
      .from("utm_links")
      .insert({
        organization_id: organizationId,
        youtube_video_id: data.youtube_video_id ?? null,
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
