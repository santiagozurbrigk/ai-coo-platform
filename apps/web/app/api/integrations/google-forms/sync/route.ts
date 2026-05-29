import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import {
  syncAllGoogleFormsOrganizations,
  syncGoogleFormsForOrganization,
} from "@/lib/google-forms/sync";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  if (organizationId) {
    const result = await syncGoogleFormsForOrganization(organizationId);
    return NextResponse.json({ ok: true, ...result });
  }

  const result = await syncAllGoogleFormsOrganizations();
  return NextResponse.json({ ok: true, ...result });
}
