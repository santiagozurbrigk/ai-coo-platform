import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { labelContentAsset } from "@/lib/content/label-content";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeGoogleCode, getGoogleEnv } from "@/lib/google/oauth";
import { integrationsOAuthRedirect } from "@/lib/integrations/oauth-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

type OAuthCookie = {
  organizationId: string;
  state: string;
  codeVerifier: string;
};

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");

    if (!code || !state || !isSupabaseConfigured()) {
      return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
    }

    const cookieStore = await cookies();
    const cookieRaw = cookieStore.get("youtube_oauth")?.value;
    if (!cookieRaw) {
      return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
    }

    let cookie: OAuthCookie;
    try {
      cookie = JSON.parse(cookieRaw) as OAuthCookie;
    } catch {
      return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
    }

    if (cookie.state !== state) {
      return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
    }

    const env = getGoogleEnv();
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI;
    if (!env || !redirectUri) {
      return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
    }

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
    const { error: upsertError } = await admin.from("youtube_integrations").upsert(
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

    if (upsertError) {
      console.error("[youtube/oauth/callback] DB upsert:", upsertError.message);
      return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
    }

    if (channel?.id) {
      try {
        await syncYoutubeVideos(
          cookie.organizationId,
          tokens.access_token,
          channel.id
        );
      } catch (e) {
        console.error("[youtube/oauth/callback] sync videos:", e);
      }
    }

    return integrationsOAuthRedirect(origin, "youtube", "connected", "youtube_oauth");
  } catch (e) {
    console.error("[youtube/oauth/callback] Error:", e);
    return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
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
