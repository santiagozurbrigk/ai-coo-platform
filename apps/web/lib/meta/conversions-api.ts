import { createHash } from "crypto";

function sha256hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseCookie(cookieHeader: string, name: string): string | undefined {
  const re = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`);
  return re.exec(cookieHeader)?.[1] ?? undefined;
}

/**
 * Sends a "Lead" event to the Meta Conversions API (server-side).
 *
 * Fire-and-forget: errors are logged but never propagated so they cannot
 * affect the HTTP response returned to the user.
 *
 * Returns immediately without doing anything if either
 *   - NEXT_PUBLIC_META_PIXEL_ID, or
 *   - META_CONVERSIONS_API_TOKEN
 * is not configured (valid state for local/staging environments).
 */
export async function sendMetaLeadEvent({
  email,
  request,
}: {
  email: string;
  request: Request;
}): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const token = process.env.META_CONVERSIONS_API_TOKEN?.trim();
  if (!pixelId || !token) return;

  const normalizedEmail = email.trim().toLowerCase();

  const headers = request.headers;
  const cookieHeader = headers.get("cookie") ?? "";

  // Meta requires SHA-256 hashed PII (lowercase + trimmed).
  const em = sha256hex(normalizedEmail);

  // Optional signals that improve event match quality.
  const fbp = parseCookie(cookieHeader, "_fbp");
  const fbc = parseCookie(cookieHeader, "_fbc");
  // Take the first IP in the chain (client, not CDN).
  const clientIp = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientUserAgent = headers.get("user-agent") ?? undefined;

  // Prefer the actual request URL; fall back to the public app URL.
  const eventSourceUrl =
    request.url ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://app.ai-coo.com";

  const userData: Record<string, unknown> = {
    em: [em],
  };
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;
  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: userData,
      },
    ],
  };

  const endpoint = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[meta-capi] event rejected:", res.status, text);
    }
  } catch (err) {
    console.error("[meta-capi] fetch failed:", err);
  }
}
