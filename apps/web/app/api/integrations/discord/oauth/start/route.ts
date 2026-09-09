import { NextRequest, NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { withOAuthNoCache } from "@/lib/integrations/oauth-callback-headers";
import { discordRedirectUri } from "@/lib/discord/oauth";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Permisos que se le piden al servidor al instalar el bot.
 *
 * ⭐ Cambiar este número **no toca las instalaciones existentes**: Discord fija
 * los permisos del rol del bot en el momento de autorizar, y sólo los actualiza
 * si se vuelve a pasar por este flujo. Un servidor conectado antes de que se
 * sumara `CHANGE_NICKNAME` va a seguir sin él hasta que reconecte, y el error
 * de `lib/discord/profile.ts` es el que se lo dice.
 */
const BOT_PERMISSIONS =
  (1 << 10) | // VIEW_CHANNEL — ver los canales monitoreados
  (1 << 11) | // SEND_MESSAGES — el saludo y las respuestas a !vincular
  (1 << 16) | // READ_MESSAGE_HISTORY — leer el hilo, no sólo el mensaje suelto
  (1 << 26); // CHANGE_NICKNAME — ponerse el nombre que eligió la organización

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
  const redirectUri = discordRedirectUri(origin);

  const discordUrl = new URL("https://discord.com/oauth2/authorize");
  discordUrl.searchParams.set("client_id", clientId);
  discordUrl.searchParams.set("permissions", String(BOT_PERMISSIONS));
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
