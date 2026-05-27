"use server";

import { getCalendlyIntegrationStatusAction } from "@/app/calendly/actions";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockIntegrations } from "@/mocks/integrations";
import type { Integration } from "@/types/integrations";

async function countCalendlyClosingCalls(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("closing_calls")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .not("calendly_event_id", "is", null);

  if (error) return 0;
  return count ?? 0;
}

/**
 * Catálogo de integraciones con estado real de Calendly (OAuth en DB).
 * El resto sigue en mock hasta sus oleadas.
 */
export async function listIntegrationsAction(): Promise<Integration[]> {
  const calendlyStatus = await getCalendlyIntegrationStatusAction();
  const calendlyRecords = calendlyStatus.connected
    ? await countCalendlyClosingCalls()
    : 0;

  return mockIntegrations.map((integration) => {
    if (integration.provider !== "calendly") return integration;

    if (!calendlyStatus.connected) {
      return { ...integration, status: "not_connected" as const };
    }

    return {
      ...integration,
      status: "connected" as const,
      lastSync: calendlyStatus.lastSyncAt
        ? formatRelativeTime(calendlyStatus.lastSyncAt)
        : undefined,
      recordsSynced: calendlyRecords > 0 ? calendlyRecords : undefined,
    };
  });
}
