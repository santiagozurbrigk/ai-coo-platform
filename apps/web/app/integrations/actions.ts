"use server";

import { getCalendlyIntegrationStatusAction } from "@/app/calendly/actions";
import { getFathomIntegrationStatusAction } from "@/app/fathom/actions";
import {
  getGoogleFormsIntegrationStatusAction,
  getTypeformIntegrationStatusAction,
} from "@/app/forms/actions";
import { getManyChatIntegrationStatusAction } from "@/app/manychat/actions";
import { getYoutubeIntegrationStatusAction } from "@/app/marketing/actions";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockIntegrations } from "@/mocks/integrations";
import type { Integration } from "@/types/integrations";

async function countManyChatConversations(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { count } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .like("external_ref", "manychat:%");
  return count ?? 0;
}

async function countCalendlyClosingCalls(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { count } = await supabase
    .from("closing_calls")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .not("calendly_event_id", "is", null);
  return count ?? 0;
}

async function countFathomCalls(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { count } = await supabase
    .from("fathom_calls")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  return count ?? 0;
}

async function countContentAssets(platform?: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  let q = supabase
    .from("content_assets")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  if (platform) q = q.eq("platform", platform);
  const { count } = await q;
  return count ?? 0;
}

async function countForms(platform: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { count } = await supabase
    .from("forms")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("platform", platform);
  return count ?? 0;
}

const REAL_PROVIDERS = new Set([
  "calendly",
  "manychat",
  "fathom",
  "youtube",
  "typeform",
  "google_forms",
]);

export async function listIntegrationsAction(): Promise<Integration[]> {
  const [
    calendlyStatus,
    manychatStatus,
    fathomStatus,
    youtubeStatus,
    typeformStatus,
    googleFormsStatus,
  ] = await Promise.all([
    getCalendlyIntegrationStatusAction(),
    getManyChatIntegrationStatusAction(),
    getFathomIntegrationStatusAction(),
    getYoutubeIntegrationStatusAction(),
    getTypeformIntegrationStatusAction(),
    getGoogleFormsIntegrationStatusAction(),
  ]);

  const [
    calendlyRecords,
    manychatRecords,
    fathomRecords,
    youtubeRecords,
    typeformRecords,
    googleFormsRecords,
  ] = await Promise.all([
    calendlyStatus.connected ? countCalendlyClosingCalls() : 0,
    manychatStatus.connected ? countManyChatConversations() : 0,
    fathomStatus.connected ? countFathomCalls() : 0,
    youtubeStatus.connected ? countContentAssets("youtube") : 0,
    typeformStatus.connected ? countForms("typeform") : 0,
    googleFormsStatus.connected ? countForms("google_forms") : 0,
  ]);

  return mockIntegrations.map((integration) => {
    if (integration.provider === "instagram") {
      return { ...integration, status: "not_connected" as const };
    }

    const statusMap: Record<
      string,
      { connected: boolean; lastSyncAt: string | null | undefined; records: number }
    > = {
      calendly: {
        connected: calendlyStatus.connected,
        lastSyncAt: calendlyStatus.lastSyncAt ?? null,
        records: calendlyRecords,
      },
      manychat: {
        connected: manychatStatus.connected,
        lastSyncAt: manychatStatus.lastSyncAt,
        records: manychatRecords,
      },
      fathom: {
        connected: fathomStatus.connected,
        lastSyncAt: fathomStatus.lastSyncAt,
        records: fathomRecords,
      },
      youtube: {
        connected: youtubeStatus.connected,
        lastSyncAt: youtubeStatus.lastSyncAt,
        records: youtubeRecords,
      },
      typeform: {
        connected: typeformStatus.connected,
        lastSyncAt: typeformStatus.lastSyncAt,
        records: typeformRecords,
      },
      google_forms: {
        connected: googleFormsStatus.connected,
        lastSyncAt: googleFormsStatus.lastSyncAt,
        records: googleFormsRecords,
      },
    };

    const live = statusMap[integration.provider];
    if (live) {
      if (!live.connected) {
        return { ...integration, status: "not_connected" as const };
      }
      return {
        ...integration,
        status: "connected" as const,
        lastSync: live.lastSyncAt
          ? formatRelativeTime(live.lastSyncAt)
          : undefined,
        recordsSynced: live.records > 0 ? live.records : undefined,
      };
    }

    if (!REAL_PROVIDERS.has(integration.provider)) {
      return {
        ...integration,
        status: "not_connected" as const,
        lastSync: undefined,
        recordsSynced: undefined,
      };
    }

    return integration;
  });
}
