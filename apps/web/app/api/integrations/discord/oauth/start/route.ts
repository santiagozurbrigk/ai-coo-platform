import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { withOAuthNoCache } from "@/lib/integrations/oauth-callback-headers";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/api/integrations/discord/callback?discord=error", origin));
  }

  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/api/integrations/discord/callback?discord=error", origin));
  }

  let organizationId: string;
  try {
    organizationId = await requireOrganizationId();
  } catch {
    return NextResponse.redirect(new URL("/auth/login", origin));
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/integrations/discord/callback`;

  const discordUrl = new URL("https://discord.com/oauth2/authorize");
  discordUrl.searchParams.set("client_id", clientId);
  discordUrl.searchParams.set("permissions", "68608");
  discordUrl.searchParams.set("scope", "bot");
  discordUrl.searchParams.set("redirect_uri", redirectUri);
  discordUrl.searchParams.set("response_type", "code");
  discordUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(discordUrl);
  res.cookies.set("discord_oauth", JSON.stringify({ organizationId, state }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutos
    path: "/",
  });

  return withOAuthNoCache(res);
}
