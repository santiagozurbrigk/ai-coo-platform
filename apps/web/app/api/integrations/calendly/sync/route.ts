import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import {
  applyCalendlyEventsSafe,
  syncAllCalendlyOrganizationsSafe,
  syncCalendlyOrganizationSafe,
} from "@/lib/calendly/sync-pipeline";
import type { CalendlyEventSyncPayload } from "@/types/calendly";

export const runtime = "nodejs";
export const maxDuration = 60;

type SyncBody = {
  events?: CalendlyEventSyncPayload[];
  organizationId?: string;
};

async function parseBody(request: Request): Promise<SyncBody | null> {
  try {
    const text = await request.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as SyncBody;
  } catch {
    return null;
  }
}

/**
 * Sync Calendly → closing_calls.
 * - Sin body / cron: sincroniza todas las orgs conectadas (o una vía ?organizationId=).
 * - Con body `{ events: [...] }`: aplica payload (webhook/manual); requiere organizationId en query o body.
 * Siempre responde 200 salvo 401 de cron.
 */
export async function POST(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const organizationIdParam = url.searchParams.get("organizationId");

  try {
    const body = await parseBody(request);

    if (body && Array.isArray(body.events)) {
      const orgId = organizationIdParam ?? body.organizationId;
      if (!orgId) {
        return NextResponse.json({
          ok: true,
          synced: 0,
          inserted: 0,
          updated: 0,
          skippedClosed: 0,
          fetched: 0,
        });
      }
      const result = await applyCalendlyEventsSafe(orgId, body.events);
      return NextResponse.json({ ok: true, ...result });
    }

    if (organizationIdParam) {
      const result = await syncCalendlyOrganizationSafe(organizationIdParam);
      return NextResponse.json({ ok: true, ...result });
    }

    const bulk = await syncAllCalendlyOrganizationsSafe();
    return NextResponse.json({
      ok: true,
      synced: bulk.synced,
      orgs: bulk.orgs,
      inserted: bulk.inserted,
      updated: bulk.updated,
      skippedClosed: bulk.skippedClosed,
      fetched: bulk.fetched,
    });
  } catch (e) {
    console.error("[calendly/sync] Error no controlado:", e);
    return NextResponse.json({
      ok: true,
      synced: 0,
      inserted: 0,
      updated: 0,
      skippedClosed: 0,
      fetched: 0,
    });
  }
}
