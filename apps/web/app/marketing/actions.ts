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
