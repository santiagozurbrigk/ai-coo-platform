import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import {
  syncAllGHLOrganizationsSafe,
  syncGHLOrganizationSafe,
} from "@/lib/ghl/sync-pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Vercel Cron invoca GET — delegar a la misma lógica que POST. */
export async function GET(request: Request) {
  return POST(request);
}

/**
 * Cron: sync GHL appointments → closing_calls.
 * - Sin params: sincroniza todas las orgs con GHL configurado.
 * - ?organizationId=<uuid>: sincroniza solo esa org.
 * Requiere Authorization: Bearer <CRON_SECRET>.
 */
export async function POST(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  try {
    if (organizationId) {
      const result = await syncGHLOrganizationSafe(organizationId);
      return NextResponse.json({ ok: true, ...result });
    }

    const bulk = await syncAllGHLOrganizationsSafe();
    return NextResponse.json({
      ok: true,
      synced: bulk.synced,
      orgs: bulk.orgs,
      inserted: bulk.inserted,
      updated: bulk.updated,
      fetched: bulk.fetched,
    });
  } catch (e) {
    console.error("[cron/ghl-sync] Error no controlado:", e);
    return NextResponse.json({
      ok: true,
      synced: 0,
      inserted: 0,
      updated: 0,
      fetched: 0,
    });
  }
}
