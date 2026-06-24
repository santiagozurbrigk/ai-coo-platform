import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import {
  generateAllIntelligenceSnapshots,
  generateAndSaveIntelligenceSnapshot,
} from "@/lib/intelligence/generate-snapshot";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  try {
    if (organizationId) {
      const result = await generateAndSaveIntelligenceSnapshot(organizationId);
      return NextResponse.json({ ok: true, organizationId, result });
    }

    const bulk = await generateAllIntelligenceSnapshots();
    return NextResponse.json({ ok: true, ...bulk });
  } catch (e) {
    console.error("[cron/intelligence-snapshot] Error:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
