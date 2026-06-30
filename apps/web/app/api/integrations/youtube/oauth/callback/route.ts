import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { exchangeGoogleCode, getGoogleEnv } from "@/lib/google/oauth";
import { persistUnifiedGoogleTokens } from "@/lib/google/persist-oauth";
import { syncYoutubeChannelAndVideos } from "@/lib/google/sync-youtube";
import { integrationsOAuthRedirect } from "@/lib/integrations/oauth-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

    const { formsError, youtubeError } = await persistUnifiedGoogleTokens(
      cookie.organizationId,
      tokens
    );

    if (formsError || youtubeError) {
      console.error("[youtube/oauth/callback] DB:", formsError, youtubeError);
      return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
    }

    try {
      await syncYoutubeChannelAndVideos(
        cookie.organizationId,
        tokens.access_token
      );
    } catch (e) {
      console.error("[youtube/oauth/callback] sync:", e);
    }

    return integrationsOAuthRedirect(origin, "youtube", "connected", "youtube_oauth");
  } catch (e) {
    console.error("[youtube/oauth/callback] Error:", e);
    return integrationsOAuthRedirect(origin, "youtube", "error", "youtube_oauth");
  }
}
