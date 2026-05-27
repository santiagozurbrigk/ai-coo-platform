import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import { paths } from "@/routes";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function base64UrlDecodeToString(input: string): string {
  // No usamos decode hoy; helper para futuras extensiones.
  return input;
}

function safeJsonParse<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

type OAuthCookie = {
  organizationId: string;
  state: string;
  codeVerifier: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";

  const calendlyClientId = process.env.CALENDLY_CLIENT_ID;
  const calendlyClientSecret = process.env.CALENDLY_CLIENT_SECRET;
  const redirectUri = process.env.CALENDLY_REDIRECT_URI;
  const calendlyAuthToken = process.env.CALENDLY_AUTH_TOKEN ?? "https://auth.calendly.com/oauth/token";

  if (!code || !state) {
    return NextResponse.json({ error: "Faltan code/state en callback" }, { status: 400 });
  }
  if (!calendlyClientId || !calendlyClientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Faltan env vars: CALENDLY_CLIENT_ID/CALENDLY_CLIENT_SECRET/CALENDLY_REDIRECT_URI" },
      { status: 500 }
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("calendly_oauth")?.value;
  const oauth = safeJsonParse<OAuthCookie>(cookieValue);

  if (!oauth || oauth.state !== state) {
    return NextResponse.json({ error: "State/PKCE inválido o expirado" }, { status: 401 });
  }

  const { organizationId, codeVerifier } = oauth;

  const basicAuth = Buffer.from(`${calendlyClientId}:${calendlyClientSecret}`).toString("base64");
  const tokenResp = await fetch(calendlyAuthToken, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const tokenJson = await tokenResp.json().catch(() => null);
  if (!tokenResp.ok || !tokenJson?.access_token) {
    return NextResponse.json(
      { error: "No se pudo intercambiar el authorization code", details: tokenJson },
      { status: 400 }
    );
  }

  const accessToken = String(tokenJson.access_token);
  const refreshToken = String(tokenJson.refresh_token ?? "");
  const expiresIn = Number(tokenJson.expires_in ?? 7200);
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  // Obtener URIs para scope organization (current_organization).
  const meResp = await fetch("https://api.calendly.com/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const meJson = await meResp.json().catch(() => null);
  const calendlyOrgUri = String(meJson?.resource?.current_organization ?? "");
  if (!calendlyOrgUri) {
    return NextResponse.json(
      { error: "No se pudo obtener current_organization desde Calendly", details: meJson },
      { status: 400 }
    );
  }

  const webhookUrl =
    process.env.CALENDLY_WEBHOOK_URL ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/integrations/calendly/webhook`;

  // Calendly requiere una URL pública y generalmente HTTPS. En local, usa ngrok/cloudflared
  // y setea CALENDLY_WEBHOOK_URL a ese dominio público.
  try {
    const parsed = new URL(webhookUrl);
    const host = parsed.hostname.toLowerCase();
    const isLocalhost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".local");
    if (isLocalhost) {
      return NextResponse.json(
        {
          error:
            "La CALENDLY_WEBHOOK_URL no puede ser localhost. Usa una URL pública (ej: ngrok) y configúrala en apps/web/.env.local.",
          webhookUrl,
        },
        { status: 400 }
      );
    }
    if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "La CALENDLY_WEBHOOK_URL debe ser HTTPS en producción (Calendly la valida).",
          webhookUrl,
        },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "CALENDLY_WEBHOOK_URL inválida", webhookUrl },
      { status: 400 }
    );
  }

  const webhookSigningKey = crypto.randomBytes(20).toString("hex");

  // Crear webhook subscription (idempotente: si existe, la API normalmente crea otra o falla;
  // lo dejamos simple por ahora, ya que seguimos el loop incremental).
  const createWebhookResp = await fetch("https://api.calendly.com/webhook_subscriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      url: webhookUrl,
      events: [
        "invitee.created",
        "invitee.canceled",
        "invitee_no_show.created",
        "invitee_no_show.deleted",
      ],
      organization: calendlyOrgUri,
      scope: "organization",
      signing_key: webhookSigningKey,
    }),
  });

  const createWebhookJson = await createWebhookResp.json().catch(() => null);
  const webhookSubscriptionUri = String(createWebhookJson?.resource?.uri ?? "");
  if (!createWebhookResp.ok || !webhookSubscriptionUri) {
    return NextResponse.json(
      {
        error: "No se pudo crear webhook subscription en Calendly",
        details: createWebhookJson,
      },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // Persistir tokens + signing key.
  const { error: upsertError } = await supabase
    .from("calendly_integrations")
    .upsert(
      {
        organization_id: organizationId,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        calendly_org_uri: calendlyOrgUri,
        webhook_subscription_uri: webhookSubscriptionUri,
        webhook_signing_key: webhookSigningKey,
        updated_at: now,
      },
      { onConflict: "organization_id" }
    );

  if (upsertError) {
    return NextResponse.json(
      { error: "No se pudo guardar calendly_integrations", details: upsertError.message },
      { status: 500 }
    );
  }

  // Limpiar cookie PKCE/estado.
  const res = NextResponse.redirect(paths.platform.integrations);
  res.cookies.delete("calendly_oauth");
  return res;
}

