import { NextRequest, NextResponse } from "next/server";
import { isDiscordWebhookAuthorized } from "@/lib/discord/webhook-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!isDiscordWebhookAuthorized(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
