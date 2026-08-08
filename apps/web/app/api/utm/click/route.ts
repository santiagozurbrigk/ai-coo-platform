import { NextResponse } from "next/server";
import { trackUTMClick } from "@/lib/utm/track-lead";
import { apiRateLimit, getRequestIp, rateLimitExceeded } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const { allowed, resetAt } = apiRateLimit(`utm-click:${ip}`);
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

  if (!utm_campaign || !organization_id) {
    return NextResponse.json({ ok: false });
  }

  const result = await trackUTMClick(utm_campaign, organization_id);
  return NextResponse.json(result);
}
