import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type PendingLinkBody = {
  organizationId?: string;
  discordUserId?: string;
  discordUsername?: string;
  displayName?: string;
  emailAttempted?: string;
  channelId?: string;
  channelName?: string;
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.OTC_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PendingLinkBody;

  if (!body.organizationId || !body.discordUserId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();

  await supabase.from("discord_pending_links").upsert(
    {
      organization_id: body.organizationId,
      discord_user_id: body.discordUserId,
      discord_username: body.discordUsername ?? null,
      discord_display_name: body.displayName ?? null,
      email_attempted: body.emailAttempted ?? null,
      channel_id: body.channelId ?? null,
      channel_name: body.channelName ?? null,
      status: "pending",
    },
    { onConflict: "organization_id,discord_user_id" }
  );

  return NextResponse.json({ ok: true });
}
