import { createAdminClient } from "@/lib/supabase/admin";
import { labelContentAsset } from "@/lib/content/label-content";
import {
  fetchInstagramMedia,
  fetchMediaInsights,
  type InstagramMediaItem,
} from "./graph";

type InstagramIntegrationRow = {
  id: string;
  organization_id: string;
  instagram_user_id: string;
  access_token: string;
};

function mapContentType(mediaType?: string): string {
  switch (mediaType?.toUpperCase()) {
    case "VIDEO":
      return "reel";
    case "IMAGE":
      return "post";
    case "CAROUSEL_ALBUM":
      return "carousel";
    default:
      return mediaType?.toLowerCase() ?? "post";
  }
}

function buildAssetRow(
  organizationId: string,
  item: InstagramMediaItem,
  metrics: Record<string, number>,
  label?: {
    label: string;
    confidence: number;
    reasoning: string;
  } | null
) {
  const views = metrics.views ?? metrics.plays ?? metrics.impressions ?? 0;
  const caption = item.caption ?? "";
  const title = caption.trim().slice(0, 80) || "Post de Instagram";
  return {
    organization_id: organizationId,
    platform: "instagram" as const,
    external_id: item.id,
    title,
    caption,
    content_type: mapContentType(item.media_type),
    thumbnail_url: item.thumbnail_url ?? item.media_url ?? null,
    published_at: item.timestamp ?? null,
    likes: item.like_count ?? 0,
    comments: item.comments_count ?? 0,
    shares: metrics.shares ?? 0,
    saves: metrics.saved ?? 0,
    reach: metrics.reach ?? 0,
    impressions: metrics.impressions ?? 0,
    views,
    views_organic: views,
    reel_type:
      mapContentType(item.media_type) === "reel" ? ("reel" as const) : null,
    ai_content_label: label?.label ?? null,
    ai_label_confidence: label?.confidence ?? null,
    ai_label_reasoning: label?.reasoning ?? null,
    last_synced_at: new Date().toISOString(),
  };
}

export async function syncInstagramIntegration(
  integration: InstagramIntegrationRow
): Promise<{ synced: number }> {
  const admin = createAdminClient();
  const media = await fetchInstagramMedia(
    integration.instagram_user_id,
    integration.access_token
  );

  let synced = 0;
  for (const item of media) {
    const metrics = await fetchMediaInsights(item.id, integration.access_token);
    const caption = item.caption ?? "";
    const title = caption.trim().slice(0, 80) || "Post de Instagram";
    const contentType = mapContentType(item.media_type);

    const label = await labelContentAsset({
      organizationId: integration.organization_id,
      title,
      caption,
      contentType,
      views: metrics.views ?? metrics.plays ?? metrics.impressions ?? 0,
      likes: item.like_count ?? 0,
      comments: item.comments_count ?? 0,
    });

    const row = buildAssetRow(
      integration.organization_id,
      item,
      metrics,
      label
    );

    const { error } = await admin.from("content_assets").upsert(row, {
      onConflict: "organization_id,platform,external_id",
    });

    if (!error) synced++;
  }

  let followersCount: number | null = null;
  let followersDelta: number | null = null;
  try {
    const profileUrl = new URL(
      `https://graph.instagram.com/${integration.instagram_user_id}`
    );
    profileUrl.searchParams.set("fields", "followers_count");
    profileUrl.searchParams.set("access_token", integration.access_token);
    const profileRes = await fetch(profileUrl);
    if (profileRes.ok) {
      const profileJson = (await profileRes.json()) as {
        followers_count?: number;
      };
      const newCount = Number(profileJson.followers_count ?? 0);
      const { data: prev } = await admin
        .from("instagram_integrations")
        .select("followers_count")
        .eq("id", integration.id)
        .maybeSingle();
      const previous = Number(prev?.followers_count ?? newCount);
      followersCount = newCount;
      followersDelta = Math.max(0, newCount - previous);
    }
  } catch {
    // followers_count no siempre está disponible según permisos de la cuenta
  }

  const now = new Date().toISOString();
  await admin
    .from("instagram_integrations")
    .update({
      last_sync_at: now,
      status: "active",
      updated_at: now,
      ...(followersCount != null
        ? { followers_count: followersCount, followers_delta: followersDelta }
        : {}),
    })
    .eq("id", integration.id);

  return { synced };
}

export async function syncInstagramForOrganization(
  organizationId: string
): Promise<{ synced: number }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("instagram_integrations")
    .select("id, organization_id, instagram_user_id, access_token")
    .eq("organization_id", organizationId)
    .in("status", ["active", "error"])
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return { synced: 0 };

  try {
    return await syncInstagramIntegration(data);
  } catch (err) {
    await admin
      .from("instagram_integrations")
      .update({
        status: "error",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    throw err;
  }
}

export async function syncAllInstagramIntegrations(): Promise<{
  organizations: number;
  synced: number;
  errors: number;
}> {
  const admin = createAdminClient();
  const { data: integrations, error } = await admin
    .from("instagram_integrations")
    .select("id, organization_id, instagram_user_id, access_token")
    .eq("status", "active");

  if (error) throw new Error(error.message);

  let synced = 0;
  let errors = 0;

  for (const integration of integrations ?? []) {
    try {
      const result = await syncInstagramIntegration(integration);
      synced += result.synced;
    } catch (err) {
      errors++;
      console.error(
        `[Instagram:sync] Error org ${integration.organization_id}:`,
        err
      );
      await admin
        .from("instagram_integrations")
        .update({
          status: "error",
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);
    }
  }

  return {
    organizations: integrations?.length ?? 0,
    synced,
    errors,
  };
}
