import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import { scoreConversation } from "@/lib/manychat/score-conversation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SalesMessage } from "@/types/sales";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/integrations/manychat/reanalyze
 * Body: { organizationId: string, conversationId?: string }
 */
export async function POST(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  let body: { organizationId?: string; conversationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const organizationId = body.organizationId?.trim();
  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId requerido" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const staleBefore = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  let query = admin
    .from("conversations")
    .select("id, lead_name, messages, organization_id")
    .eq("organization_id", organizationId)
    .not("messages", "is", null);

  if (body.conversationId) {
    query = query.eq("id", body.conversationId);
  } else {
    query = query
      .or(`last_analyzed_at.is.null,last_analyzed_at.lt.${staleBefore}`)
      .limit(20);
  }

  const { data: conversations, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!conversations?.length) {
    return NextResponse.json({ ok: true, analyzed: 0 });
  }

  let analyzed = 0;
  for (const conv of conversations) {
    const messages = (conv.messages ?? []) as SalesMessage[];
    if (messages.length < 3) continue;

    await scoreConversation({
      organizationId: conv.organization_id,
      conversationId: conv.id,
      messages: messages.map((m) => ({
        sender: m.sender,
        message: m.content,
        timestamp: m.timestamp,
      })),
      leadName: conv.lead_name,
    });
    analyzed += 1;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return NextResponse.json({ ok: true, analyzed });
}
