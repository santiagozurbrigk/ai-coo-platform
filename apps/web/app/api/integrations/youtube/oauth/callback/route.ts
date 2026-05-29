import { NextResponse, type NextRequest } from "next/server";
import { labelContentAsset } from "@/lib/content/label-content";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeGoogleCode, getGoogleEnv } from "@/lib/google/oauth";
import { paths } from "@/routes";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieRaw = request.cookies.get("youtube_oauth")?.value;
  const redirectBase = `${paths.platform.integrations}?youtube=`;

  if (!code || !state || !cookieRaw) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  let cookie: { organizationId: string; state: string; codeVerifier: string };
  try {
    cookie = JSON.parse(cookieRaw);
  } catch {
    return NextResponse.redirect(`${redirectBase}error`);
  }
  if (cookie.state !== state) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  const env = getGoogleEnv();
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;
  if (!env || !redirectUri) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  try {
    const tokens = await exchangeGoogleCode({
      code,
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      redirectUri,
      codeVerifier: cookie.codeVerifier,
    });

    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    const channelData = (await channelRes.json()) as {
      items?: { id: string; snippet?: { title?: string; thumbnails?: { default?: { url?: string } } } }[];
    };
    const channel = channelData.items?.[0];

    const admin = createAdminClient();
    await admin.from("youtube_integrations").upsert(
      {
        organization_id: cookie.organizationId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        channel_id: channel?.id ?? null,
        channel_name: channel?.snippet?.title ?? null,
        channel_thumbnail: channel?.snippet?.thumbnails?.default?.url ?? null,
        status: "connected",
        last_sync_at: new Date().toISOString(),
      },
      { onConflict: "organization_id" }
    );

    // Sync inicial de videos (últimos 25)
    if (channel?.id) {
      await syncYoutubeVideos(
        cookie.organizationId,
        tokens.access_token,
        channel.id
      );
    }

    const res = NextResponse.redirect(`${redirectBase}connected`);
    res.cookies.delete("youtube_oauth");
    return res;
  } catch {
    return NextResponse.redirect(`${redirectBase}error`);
  }
}

async function syncYoutubeVideos(
  organizationId: string,
  accessToken: string,
  channelId: string
) {
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=25&order=date&type=video`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = (await searchRes.json()) as {
    items?: { id?: { videoId?: string }; snippet?: { title?: string; description?: string; publishedAt?: string; thumbnails?: { medium?: { url?: string } } } }[];
  };

  const admin = createAdminClient();
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
