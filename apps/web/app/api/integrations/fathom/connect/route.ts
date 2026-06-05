import { NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { connectFathomWithApiKey } from "@/lib/fathom/connect";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  let body: { apiKey?: string };
  try {
    body = (await request.json()) as { apiKey?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const apiKey = String(body.apiKey ?? "").trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Pega tu API key de Fathom." },
      { status: 400 }
    );
  }

  try {
    const organizationId = await requireOrganizationId();
    const result = await connectFathomWithApiKey(organizationId, apiKey);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      synced: result.synced ?? 0,
      warning: result.error,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al conectar Fathom";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
