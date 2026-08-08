import { NextResponse } from "next/server";
import { trackUTMLeadCapture } from "@/lib/utm/track-lead";
import { apiRateLimit, getRequestIp, rateLimitExceeded } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const { allowed, resetAt } = await apiRateLimit(`utm:${ip}`);
  if (!allowed) return rateLimitExceeded(resetAt);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const data =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const utm_campaign =
    typeof data.utm_campaign === "string" ? data.utm_campaign : "";
  const organization_id =
    typeof data.organization_id === "string" ? data.organization_id : "";
  const lead_identifier =
    typeof data.lead_identifier === "string"
      ? data.lead_identifier
      : typeof data.lead_email === "string"
        ? data.lead_email
        : "";

  if (!utm_campaign || !organization_id) {
    return NextResponse.json({ ok: false });
  }

  const result = await trackUTMLeadCapture({
    organization_id,
    utm_campaign,
    utm_source:
      typeof data.utm_source === "string" ? data.utm_source : null,
    utm_medium:
      typeof data.utm_medium === "string" ? data.utm_medium : null,
    utm_content:
      typeof data.utm_content === "string" ? data.utm_content : null,
    lead_identifier,
    lead_email:
      typeof data.lead_email === "string" ? data.lead_email : null,
  });

  return NextResponse.json(result);
}
