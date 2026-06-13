import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import { generateDeepCallAnalysis } from "@/lib/fathom/analyze-transcript";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/integrations/fathom/reanalyze
 * Body: { organizationId: string, fathomCallId?: string }
 */
export async function POST(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  let body: { organizationId?: string; fathomCallId?: string };
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

  let query = admin
    .from("fathom_calls")
    .select(
      "fathom_call_id, transcript, organization_id, duration_seconds, title, call_date, fathom_url, client_id"
    )
    .eq("organization_id", organizationId)
    .not("transcript", "is", null);

  if (body.fathomCallId) {
    query = query.eq("fathom_call_id", body.fathomCallId);
  }

  const { data: calls, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let targets = calls ?? [];

  if (!body.fathomCallId) {
    const { data: analyzed } = await admin
      .from("call_analyses")
      .select("fathom_call_id")
      .eq("organization_id", organizationId);

    const analyzedIds = new Set(
      (analyzed ?? [])
        .map((row) => row.fathom_call_id)
        .filter((id): id is string => Boolean(id))
    );

    targets = targets.filter((call) => !analyzedIds.has(call.fathom_call_id));
  }

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, analyzed: 0 });
  }

  let analyzed = 0;
  for (const call of targets) {
    if (!call.transcript?.trim()) continue;

    const durationMinutes =
      call.duration_seconds != null
        ? Math.max(1, Math.round(call.duration_seconds / 60))
        : undefined;

    await generateDeepCallAnalysis({
      organizationId: call.organization_id,
      fathomCallId: call.fathom_call_id,
      transcript: call.transcript,
      durationMinutes,
      callTitle: call.title,
      callDate: call.call_date,
      fathomUrl: call.fathom_url,
      clientId: call.client_id,
    });

    analyzed += 1;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return NextResponse.json({ ok: true, analyzed });
}
