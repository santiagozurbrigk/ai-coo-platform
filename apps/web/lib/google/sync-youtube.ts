import { labelContentAsset } from "@/lib/content/label-content";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchYouTubeVideoDetails,
  youtubeMetricsToAssetFields,
} from "@/lib/youtube/video-metrics";

export async function syncYoutubeChannelAndVideos(
  organizationId: string,
  accessToken: string
): Promise<void> {
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const channelData = (await channelRes.json()) as {
    items?: {
      id: string;
      snippet?: {
        title?: string;
        thumbnails?: { default?: { url?: string } };
      };
    }[];
  };
  const channel = channelData.items?.[0];

  const admin = createAdminClient();
  await admin
    .from("youtube_integrations")
    .update({
      channel_id: channel?.id ?? null,
      channel_name: channel?.snippet?.title ?? null,
      channel_thumbnail: channel?.snippet?.thumbnails?.default?.url ?? null,
      last_sync_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId);

  if (!channel?.id) return;

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&maxResults=25&order=date&type=video`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = (await searchRes.json()) as {
    items?: {
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        description?: string;
        publishedAt?: string;
        thumbnails?: { medium?: { url?: string } };
      };
    }[];
  };

  const searchItems = searchData.items ?? [];
  const videoIds = searchItems
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id));

  const videoDetails = await fetchYouTubeVideoDetails(videoIds, accessToken);

  for (const item of searchItems) {
    const videoId = item.id?.videoId;
    if (!videoId) continue;
    const snippet = item.snippet;
    const title = snippet?.title ?? "Video";
    const caption = snippet?.description ?? "";
    const metrics = videoDetails.get(videoId);

    const label = await labelContentAsset({
      organizationId,
      title,
      caption,
      contentType: "video",
      views: metrics?.view_count ?? 0,
      likes: metrics?.like_count ?? 0,
      comments: metrics?.comment_count ?? 0,
    });

    const nativeFields = metrics
      ? youtubeMetricsToAssetFields(metrics)
      : {
          views: 0,
          likes: 0,
          comments: 0,
          duration_seconds: null as number | null,
          thumbnail_url: snippet?.thumbnails?.medium?.url ?? null,
          platform_metadata: {},
        };

    await admin.from("content_assets").upsert(
      {
        organization_id: organizationId,
        platform: "youtube",
        external_id: videoId,
        title,
        caption,
        thumbnail_url:
          nativeFields.thumbnail_url ??
          snippet?.thumbnails?.medium?.url ??
          null,
        content_type: "video",
        published_at:
          metrics?.published_at ?? snippet?.publishedAt ?? null,
        views: nativeFields.views,
        likes: nativeFields.likes,
        comments: nativeFields.comments,
        duration_seconds: nativeFields.duration_seconds,
        platform_metadata: nativeFields.platform_metadata,
        ai_content_label: label?.label ?? null,
        ai_label_confidence: label?.confidence ?? null,
        ai_label_reasoning: label?.reasoning ?? null,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,platform,external_id" }
    );
  }
}
