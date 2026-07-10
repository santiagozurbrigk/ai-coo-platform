"use server";

import { getCurrentProfile } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import {
  type ZernioPost,
} from "@/lib/zernio/client";
import { getZernioClientForOrganization, getZernioIntegrationForOrg } from "@/lib/zernio/integration";
import type {
  ContentMetrics,
  ContentPieceSource,
  ContentPieceStatus,
  ContentPieceType,
} from "@/types/content";

const SYNC_INTERVAL_MS = 30 * 60 * 1000;

type ContentPieceSyncRow = {
  organization_id: string;
  type: ContentPieceType;
  source: ContentPieceSource;
  platform: string;
  platform_post_id: string;
  platform_post_url: string | null;
  title: string | null;
  caption: string | null;
  hashtags: string[];
  thumbnail_url: string | null;
  published_at: string | null;
  status: ContentPieceStatus;
};

function mapZernioType(
  platform: string,
  postType?: string,
  mediaType?: string
): ContentPieceType {
  if (platform === "youtube") return "youtube";
  const resolvedType = postType ?? mediaType;
  if (resolvedType === "reel" || resolvedType === "video") return "reel";
  if (resolvedType === "story") return "story";
  if (resolvedType === "carousel" || resolvedType === "album") return "carousel";
  return "post";
}

function isZernioInternalId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}

function zernioPostId(post: ZernioPost): string | null {
  const platformPostId = post.platformPostId?.trim();
  if (platformPostId) return platformPostId;

  const fallback = post.id ?? post._id;
  if (!fallback) return null;

  const id = String(fallback).trim();
  if (!id || isZernioInternalId(id)) return null;

  return id;
}

function flattenZernioPosts(rawPosts: ZernioPost[]): ZernioPost[] {
  const result: ZernioPost[] = [];

  for (const post of rawPosts) {
    if (post.platforms?.length) {
      for (const platformEntry of post.platforms) {
        if (platformEntry.status === "failed") continue;

        const accountId =
          typeof platformEntry.accountId === "object"
            ? platformEntry.accountId?._id
            : platformEntry.accountId;

        result.push({
          ...post,
          platform: platformEntry.platform ?? post.platform,
          platformPostUrl: platformEntry.platformPostUrl ?? post.platformPostUrl,
          accountId: accountId ?? post.accountId,
          postType: platformEntry.postType ?? post.postType,
          id: post.id ?? post._id,
        });
      }
      continue;
    }

    result.push(post);
  }

  return result;
}

function belongsToIntegration(
  post: ZernioPost,
  profileId: string,
  accountIds: Set<string>
): boolean {
  const postProfileId = post.profileId ?? post.profile;
  if (postProfileId && postProfileId === profileId) return true;
  if (post.accountId && accountIds.has(post.accountId)) return true;
  return false;
}

function mapPostToRow(
  post: ZernioPost,
  organizationId: string
): ContentPieceSyncRow | null {
  const platform = post.platform?.trim();
  if (!platform || (platform !== "instagram" && platform !== "youtube")) {
    return null;
  }

  const platformPostId = zernioPostId(post);
  if (!platformPostId) return null;

  const postType = post.postType?.trim();
  const mediaType = post.mediaType?.trim();

  return {
    organization_id: organizationId,
    type: mapZernioType(platform, postType, mediaType),
    source: "zernio",
    platform,
    platform_post_id: platformPostId,
    platform_post_url: post.platformPostUrl?.trim() || null,
    title: post.title?.trim() || null,
    caption: post.content?.trim() || null,
    hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
    thumbnail_url: post.thumbnailUrl?.trim() || null,
    published_at: post.publishedAt ?? post.createdAt ?? null,
    status: "published",
  };
}

function dedupePosts(posts: ZernioPost[]): ZernioPost[] {
  const seen = new Set<string>();
  const result: ZernioPost[] = [];

  for (const post of posts) {
    const id = zernioPostId(post);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(post);
  }

  return result;
}

async function requireOrganizationId(): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile?.organization_id) {
    throw new Error("Sesión no válida");
  }
  return profile.organization_id;
}

async function fetchZernioPosts(
  organizationId: string,
  profileId: string
): Promise<ZernioPost[]> {
  const client = await getZernioClientForOrganization(organizationId);
  const { posts: zernioPosts = [] } = await client.listPublishedPosts({
    profileId,
    source: "zernio",
    status: "published",
    limit: 50,
  });

  return dedupePosts(flattenZernioPosts(zernioPosts));
}

function aggregatePlatformMetrics(
  platforms: Record<
    string,
    {
      impressions?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      reach?: number;
      clicks?: number;
    }
  >
): ContentMetrics {
  let likes = 0;
  let comments = 0;
  let shares = 0;
  let reach = 0;
  let impressions = 0;

  for (const metrics of Object.values(platforms)) {
    likes += metrics.likes ?? 0;
    comments += metrics.comments ?? 0;
    shares += metrics.shares ?? 0;
    reach += metrics.reach ?? 0;
    impressions += metrics.impressions ?? 0;
  }

  return {
    likes,
    comments,
    shares,
    saves: 0,
    reach,
    impressions,
    views: impressions || reach,
  };
}

export async function syncZernioContentAction(): Promise<{ synced: number }> {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);

  if (!integration || integration.connected_accounts.length === 0) {
    throw new Error("Zernio no está conectado");
  }

  const accountIds = integration.connected_accounts.map(
    (account) => account.accountId
  );

  let posts: ZernioPost[];
  try {
    posts = await fetchZernioPosts(organizationId, integration.zernio_profile_id);
  } catch (error) {
    console.error("[syncZernioContent] fetchZernioPosts failed", {
      profileId: integration.zernio_profile_id,
      accountIds,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }

  console.info("[syncZernioContent] fetched posts", {
    total: posts.length,
    profileId: integration.zernio_profile_id,
    accountIds,
  });

  const filteredPosts = posts.filter((post) =>
    belongsToIntegration(post, integration.zernio_profile_id, new Set(accountIds))
  );

  const upsertRows = filteredPosts
    .map((post) => mapPostToRow(post, organizationId))
    .filter(
      (row): row is ContentPieceSyncRow =>
        row !== null && Boolean(row.platform_post_id?.trim())
    );

  if (upsertRows.length === 0) {
    console.info("[syncZernioContent] no rows to upsert after filtering", {
      fetched: posts.length,
      filtered: filteredPosts.length,
    });
    return { synced: 0 };
  }

  const supabase = await createClient();
  const platformPostIds = upsertRows.map((row) => row.platform_post_id);

  const { data: existingRows, error: existingError } = await supabase
    .from("content_pieces")
    .select("id, platform_post_id")
    .eq("organization_id", organizationId)
    .in("platform_post_id", platformPostIds);

  if (existingError) throw new Error(existingError.message);

  const existingByPlatformId = new Map(
    (existingRows ?? []).map((row) => [row.platform_post_id as string, row.id as string])
  );

  const toInsert = upsertRows.filter(
    (row) =>
      Boolean(row.platform_post_id.trim()) &&
      !existingByPlatformId.has(row.platform_post_id)
  );
  const toUpdate = upsertRows.filter((row) =>
    existingByPlatformId.has(row.platform_post_id)
  );

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("content_pieces")
      .insert(toInsert);

    if (insertError) throw new Error(insertError.message);
  }

  await Promise.all(
    toUpdate.map(async (row) => {
      const id = existingByPlatformId.get(row.platform_post_id);
      if (!id) return;

      const { error } = await supabase
        .from("content_pieces")
        .update({
          type: row.type,
          platform: row.platform,
          platform_post_url: row.platform_post_url,
          title: row.title,
          caption: row.caption,
          hashtags: row.hashtags,
          thumbnail_url: row.thumbnail_url,
          published_at: row.published_at,
          status: row.status,
        })
        .eq("id", id)
        .eq("organization_id", organizationId);

      if (error) throw new Error(error.message);
    })
  );

  return { synced: upsertRows.length };
}

export async function maybeSyncZernioContentAction(): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("content_pieces")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("source", "zernio");

  if (countError) throw new Error(countError.message);

  const { data: latestRow, error: latestError } = await supabase
    .from("content_pieces")
    .select("updated_at")
    .eq("organization_id", organizationId)
    .eq("source", "zernio")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) throw new Error(latestError.message);

  const hasNoData = (count ?? 0) === 0;
  const lastSyncAt = latestRow?.updated_at
    ? new Date(latestRow.updated_at as string).getTime()
    : null;
  const isStale =
    lastSyncAt === null || Date.now() - lastSyncAt > SYNC_INTERVAL_MS;

  if (!hasNoData && !isStale) return;

  await syncZernioContentAction();
}

export async function syncZernioMetricsAction(
  contentPieceIds?: string[]
): Promise<void> {
  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration || integration.connected_accounts.length === 0) return;

  const supabase = await createClient();

  let query = supabase
    .from("content_pieces")
    .select("id, platform_post_id")
    .eq("organization_id", organizationId)
    .eq("source", "zernio")
    .not("platform_post_id", "is", null);

  if (contentPieceIds && contentPieceIds.length > 0) {
    query = query.in("id", contentPieceIds);
  }

  const { data: pieces, error } = await query.limit(20);
  if (error) throw new Error(error.message);
  if (!pieces || pieces.length === 0) return;

  const client = await getZernioClientForOrganization(organizationId);

  const updates = await Promise.allSettled(
    pieces.map(async (piece) => {
      const postId = piece.platform_post_id as string;
      const analytics = await client.getPostAnalytics(postId);
      const metrics = aggregatePlatformMetrics(analytics.platforms ?? {});

      return {
        id: piece.id as string,
        metrics,
        metrics_updated_at: new Date().toISOString(),
      };
    })
  );

  const successfulUpdates = updates
    .filter(
      (result): result is PromiseFulfilledResult<{
        id: string;
        metrics: ContentMetrics;
        metrics_updated_at: string;
      }> => result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value);

  if (successfulUpdates.length === 0) return;

  await Promise.all(
    successfulUpdates.map((update) =>
      supabase
        .from("content_pieces")
        .update({
          metrics: update.metrics,
          metrics_updated_at: update.metrics_updated_at,
        })
        .eq("id", update.id)
        .eq("organization_id", organizationId)
    )
  );
}
