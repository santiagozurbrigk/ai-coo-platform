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
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const channelData = (await channelRes.json()) as {
    items?: {
      id: string;
      snippet?: {
        title?: string;
        thumbnails?: { default?: { url?: string } };
      };
      statistics?: { subscriberCount?: string };
    }[];
  };
  const channel = channelData.items?.[0];

  const admin = createAdminClient();

  const newSubCount = Number(channel?.statistics?.subscriberCount ?? 0);
  const { data: prevYt } = await admin
    .from("youtube_integrations")
    .select("subscriber_count")
    .eq("organization_id", organizationId)
    .maybeSingle();
  const previousSubs = Number(prevYt?.subscriber_count ?? newSubCount);

  await admin
    .from("youtube_integrations")
    .update({
      channel_id: channel?.id ?? null,
      channel_name: channel?.snippet?.title ?? null,
      channel_thumbnail: channel?.snippet?.thumbnails?.default?.url ?? null,
      subscriber_count: newSubCount || null,
      subscriber_delta: Math.max(0, newSubCount - previousSubs),
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
  const now = new Date().toISOString();

  for (const item of searchItems) {
    const videoId = item.id?.videoId;
    if (!videoId) continue;
    const snippet = item.snippet;
    const title = snippet?.title ?? "Video";
    const caption = snippet?.description ?? "";
    const nativeFields = videoDetails.get(videoId)
      ? youtubeMetricsToAssetFields(videoDetails.get(videoId)!)
      : {
          views: 0,
          likes: 0,
          comments: 0,
          duration_seconds: null as number | null,
          thumbnail_url: snippet?.thumbnails?.medium?.url ?? null,
          platform_metadata: {},
        };

    const metrics = {
      views: nativeFields.views,
      likes: nativeFields.likes,
      comments: nativeFields.comments,
      shares: 0,
      saves: 0,
      reach: 0,
      impressions: 0,
    };

    await admin.from("content_pieces").upsert(
      {
        organization_id: organizationId,
        type: "youtube",
        source: "google",
        platform: "youtube",
        platform_post_id: videoId,
        platform_post_url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        caption,
        hashtags: [],
        thumbnail_url: nativeFields.thumbnail_url ?? snippet?.thumbnails?.medium?.url ?? null,
        published_at: videoDetails.get(videoId)?.published_at ?? snippet?.publishedAt ?? null,
        status: "published",
        metrics,
        metrics_updated_at: now,
      },
      { onConflict: "organization_id,platform_post_id" }
    );
  }
}
