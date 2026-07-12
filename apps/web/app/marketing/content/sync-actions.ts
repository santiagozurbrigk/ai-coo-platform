"use server";

import { getCurrentProfile } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import {
  type ZernioPost,
} from "@/lib/zernio/client";
import { getZernioClientForOrganization, getZernioIntegrationForOrg } from "@/lib/zernio/integration";
import { resolvePostAnalytics } from "@/lib/zernio/resolve-analytics";
import { syncContentMetricsForOrg } from "@/lib/marketing/sync-content-metrics";
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
  metrics: ContentMetrics;
  metrics_updated_at: string;
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

function externalPlatformPostId(post: ZernioPost): string | null {
  const platformPostId = post.platformPostId?.trim();
  if (platformPostId) return platformPostId;

  const fallback = post.id ?? post._id;
  if (!fallback) return null;

  const id = String(fallback).trim();
  if (!id || isZernioInternalId(id)) return null;

  return id;
}

function mapExternalPostToRow(
  post: ZernioPost,
  organizationId: string,
  metricsUpdatedAt: string
): ContentPieceSyncRow | null {
  const platform = post.platform?.trim().toLowerCase();
  if (!platform || (platform !== "instagram" && platform !== "youtube")) {
    return null;
  }

  const platformPostId = externalPlatformPostId(post);
  if (!platformPostId) return null;

  const postType = post.postType?.trim();
  const mediaType = post.mediaType?.trim();
  const { metrics, lastUpdated } = resolvePostAnalytics(post.analytics);

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
    metrics,
    metrics_updated_at: lastUpdated ?? metricsUpdatedAt,
  };
}

function dedupeExternalPosts(posts: ZernioPost[]): ZernioPost[] {
  const seen = new Set<string>();
  const result: ZernioPost[] = [];

  for (const post of posts) {
    const id = externalPlatformPostId(post);
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

async function fetchExternalPostsViaSync(
  organizationId: string,
  accountIds: string[]
): Promise<ZernioPost[]> {
  const client = await getZernioClientForOrganization(organizationId);

  const results = await Promise.allSettled(
    accountIds.map(async (accountId) => {
      const { posts, synced } = await client.syncExternalPosts(accountId);
      console.info("[syncZernioContent] syncExternalPosts", {
        accountId,
        postsFound: synced?.postsFound ?? posts.length,
        postsSynced: synced?.postsSynced ?? posts.length,
      });
      return posts;
    })
  );

  const allPosts: ZernioPost[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allPosts.push(...result.value);
      continue;
    }
    console.warn("[syncZernioContent] syncExternalPosts failed for account", {
      error:
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason),
    });
  }

  return dedupeExternalPosts(allPosts);
}

export async function syncZernioContentAction(): Promise<{ synced: number }> {
  console.log("[syncZernioContent] throttle check", { reason: "running" });

  const organizationId = await requireOrganizationId();
  const integration = await getZernioIntegrationForOrg(organizationId);

  if (!integration || integration.connected_accounts.length === 0) {
    throw new Error("Zernio no está conectado");
  }

  const contentAccountIds = integration.connected_accounts
    .filter((account) => {
      const platform = account.platform.toLowerCase();
      return platform === "instagram" || platform === "youtube";
    })
    .map((account) => account.accountId);

  if (contentAccountIds.length === 0) {
    throw new Error("No hay cuentas de Instagram o YouTube conectadas en Zernio");
  }

  let posts: ZernioPost[];
  try {
    posts = await fetchExternalPostsViaSync(organizationId, contentAccountIds);
  } catch (error) {
    console.error("[syncZernioContent] fetchExternalPostsViaSync failed", {
      accountIds: contentAccountIds,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }

  console.info("[syncZernioContent] synced external posts", {
    total: posts.length,
    accountIds: contentAccountIds,
  });

  if (posts.length > 0) {
    const sample = posts[0];
    const { metrics: sampleMetrics } = resolvePostAnalytics(sample.analytics);
    console.info("[syncZernioContent] post analytics sample", {
      platformPostId: externalPlatformPostId(sample),
      likes: sampleMetrics.likes,
      views: sampleMetrics.views,
      reach: sampleMetrics.reach,
    });
  }

  const metricsUpdatedAt = new Date().toISOString();
  const upsertRows = posts
    .map((post) => mapExternalPostToRow(post, organizationId, metricsUpdatedAt))
    .filter(
      (row): row is ContentPieceSyncRow =>
        row !== null && Boolean(row.platform_post_id?.trim())
    );

  if (upsertRows.length === 0) {
    console.info("[syncZernioContent] no rows to upsert after filtering", {
      fetched: posts.length,
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
          metrics: row.metrics,
          metrics_updated_at: row.metrics_updated_at,
        })
        .eq("id", id)
        .eq("organization_id", organizationId);

      if (error) throw new Error(error.message);
    })
  );

  // Refrescar métricas en background por si algún post quedó sin analytics completos.
  void syncContentMetricsForOrg(organizationId).catch((err) => {
    console.error("[syncZernioContent] metrics sync failed", {
      organizationId,
      error: err instanceof Error ? err.message : err,
    });
  });

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
  const shouldSkip = !hasNoData && !isStale;

  console.log("[syncZernioContent] throttle check", {
    reason: shouldSkip ? "skipped" : "running",
    hasNoData,
    isStale,
    count: count ?? 0,
    latestUpdatedAt: latestRow?.updated_at ?? null,
    lastSyncAtMs: lastSyncAt,
    ageMs: lastSyncAt !== null ? Date.now() - lastSyncAt : null,
    syncIntervalMs: SYNC_INTERVAL_MS,
  });

  if (shouldSkip) return;

  await syncZernioContentAction();
}

export async function syncZernioMetricsAction(
  contentPieceIds?: string[]
): Promise<void> {
  const organizationId = await requireOrganizationId();
  await syncContentMetricsForOrg(organizationId, contentPieceIds);
}
