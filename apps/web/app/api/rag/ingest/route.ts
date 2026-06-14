import { NextRequest, NextResponse } from "next/server";
import {
  ingestAllFathomCalls,
  ingestAllSOPs,
  ingestProductContext,
} from "@/lib/rag/ingest";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";

/** POST /api/rag/ingest — Body: { organizationId, types?: ['sops', 'fathom', 'product'] } */
export async function POST(req: NextRequest) {
  const unauthorized = assertCronAuthorized(req);
  if (unauthorized) return unauthorized;

  let body: { organizationId?: string; types?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { organizationId, types } = body;
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId requerido" }, { status: 400 });
  }

  const toIngest = types ?? ["sops", "fathom", "product"];
  const results: Record<string, string> = {};

  try {
    if (toIngest.includes("sops")) {
      await ingestAllSOPs(organizationId);
      results.sops = "ok";
    }

    if (toIngest.includes("fathom")) {
      await ingestAllFathomCalls(organizationId);
      results.fathom = "ok";
    }

    if (toIngest.includes("product")) {
      await ingestProductContext(organizationId);
      results.product = "ok";
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("[RAG Ingest] Error:", err);
    return NextResponse.json(
      { error: "Error en ingestión", details: String(err) },
      { status: 500 }
    );
  }
}
