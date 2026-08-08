import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";
import { withOAuthNoCache } from "@/lib/integrations/oauth-callback-headers";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type OAuthCookie = { organizationId: string; state: string };

function integrationsRedirect(
  origin: string,
  params: Record<string, string>
): NextResponse {
  const target = new URL(paths.platform.integrations, origin);
  for (const [key, value] of Object.entries(params)) {
    target.searchParams.set(key, value);
  }
  const res = withOAuthNoCache(NextResponse.redirect(target));
  res.cookies.delete("discord_oauth");
  return res;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const guildId = searchParams.get("guild_id");
  const stateParam = searchParams.get("state");

  if (!code || !guildId) {
    return integrationsRedirect(origin, { discord: "error" });
  }

  // Validar state contra cookie para prevenir CSRF
  const cookieStore = await cookies();
  const cookieRaw = cookieStore.get("discord_oauth")?.value;
  let oauth: OAuthCookie | null = null;
  try {
    oauth = cookieRaw ? (JSON.parse(cookieRaw) as OAuthCookie) : null;
  } catch { /* ignore */ }

  if (!oauth || !stateParam || oauth.state !== stateParam) {
    return integrationsRedirect(origin, { discord: "error" });
  }

  const organizationId = oauth.organizationId;

  const clientId = process.env.DISCORD_CLIENT_ID ?? process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri =
    process.env.DISCORD_REDIRECT_URI ??
    `${origin}/api/integrations/discord/callback`;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!clientId || !clientSecret || !botToken) {
    return integrationsRedirect(origin, { discord: "error" });
  }

  if (!isSupabaseConfigured()) {
    return integrationsRedirect(origin, { discord: "error" });
  }

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = (await tokenResponse.json()) as { access_token?: string };

  if (!tokenData.access_token) {
    return integrationsRedirect(origin, { discord: "error" });
  }

  const guildResponse = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}`,
    { headers: { Authorization: `Bot ${botToken}` } }
  );
  const guildData = (await guildResponse.json()) as { name?: string };

  const admin = createAdminClient();
  const { error } = await admin.from("discord_integrations").upsert(
    {
      organization_id: organizationId,
      guild_id: guildId,
      guild_name: guildData.name ?? null,
      status: "connected",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" }
  );

  if (error) {
    return integrationsRedirect(origin, { discord: "error" });
  }

  return integrationsRedirect(origin, { discord: "connected" });
}
