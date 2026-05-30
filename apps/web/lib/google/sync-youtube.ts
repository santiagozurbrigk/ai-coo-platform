import { labelContentAsset } from "@/lib/content/label-content";
import { createAdminClient } from "@/lib/supabase/admin";

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
  await admin.from("youtube_integrations").update({
    channel_id: channel?.id ?? null,
    channel_name: channel?.snippet?.title ?? null,
    channel_thumbnail: channel?.snippet?.thumbnails?.default?.url ?? null,
    last_sync_at: new Date().toISOString(),
  }).eq("organization_id", organizationId);

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

  for (const item of searchData.items ?? []) {
    const videoId = item.id?.videoId;
    if (!videoId) continue;
    const snippet = item.snippet;
    const title = snippet?.title ?? "Video";
    const caption = snippet?.description ?? "";

    const label = await labelContentAsset({
      organizationId,
      title,
      caption,
      contentType: "video",
      views: 0,
      likes: 0,
      comments: 0,
    });

    await admin.from("content_assets").upsert(
      {
        organization_id: organizationId,
        platform: "youtube",
        external_id: videoId,
        title,
        caption,
        thumbnail_url: snippet?.thumbnails?.medium?.url ?? null,
        content_type: "video",
        published_at: snippet?.publishedAt ?? null,
        ai_content_label: label?.label ?? null,
        ai_label_confidence: label?.confidence ?? null,
        ai_label_reasoning: label?.reasoning ?? null,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,platform,external_id" }
    );
  }
}
