"use server";

import {
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { fetchCalendlyScheduledEventPayloads } from "@/lib/calendly/fetch-scheduled-events";
import {
  getCalendlyIntegrationForOrganization,
  getValidCalendlyAccessToken,
  isCalendlyWebhookUnavailable,
} from "@/lib/calendly/oauth-token";
import { syncCalendlyEventsForOrganization } from "@/lib/calendly/sync-events";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CalendlyPullResult = {
  inserted: number;
  updated: number;
  skippedManualStatus: number;
  fetched: number;
};

export async function getCalendlyIntegrationStatusAction(): Promise<{
  connected: boolean;
  webhookEnabled: boolean;
  lastSyncAt?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { connected: false, webhookEnabled: false };
  }

  try {
    const organizationId = await requireOrganizationId();
    const row = await getCalendlyIntegrationForOrganization(organizationId);
    if (!row) return { connected: false, webhookEnabled: false };
    return {
      connected: true,
      webhookEnabled: !isCalendlyWebhookUnavailable(row.webhook_signing_key),
      lastSyncAt: row.updated_at ?? undefined,
    };
  } catch {
    return { connected: false, webhookEnabled: false };
  }
}

/** Pull desde Calendly API (OAuth) → closing_calls. Único punto de sync manual desde la UI. */
export async function pullCalendlyScheduledEventsAction(): Promise<
  MutationResult<CalendlyPullResult>
> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const { accessToken, orgUri } = await getValidCalendlyAccessToken(organizationId);
    const events = await fetchCalendlyScheduledEventPayloads(accessToken, orgUri);
    const supabase = await createClient();
    const result = await syncCalendlyEventsForOrganization(
      supabase,
      organizationId,
      events
    );

    const admin = createAdminClient();
    await admin
      .from("calendly_integrations")
      .update({ updated_at: new Date().toISOString() })
      .eq("organization_id", organizationId);

    return { ...result, fetched: events.length };
  });
}
