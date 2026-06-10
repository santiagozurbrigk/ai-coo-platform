"use server";

import { revalidatePath } from "next/cache";
import { getCalendlyIntegrationStatusAction } from "@/app/calendly/actions";
import { getFathomIntegrationStatusAction } from "@/app/fathom/actions";
import {
  getGoogleFormsIntegrationStatusAction,
  getTypeformIntegrationStatusAction,
} from "@/app/forms/actions";
import { getManyChatIntegrationStatusAction } from "@/app/manychat/actions";
import { getDiscordIntegrationStatusAction } from "@/app/discord/actions";
import {
  getInstagramIntegrationStatusAction,
  getYoutubeIntegrationStatusAction,
} from "@/app/marketing/actions";
import { getStripeIntegrationStatusAction } from "@/app/stripe/actions";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { formatRelativeTime } from "@/lib/format";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockIntegrations } from "@/mocks/integrations";
import type { GoogleIntegrationProvider } from "@/lib/google/oauth-paths";
import { paths } from "@/routes";
import type { Integration } from "@/types/integrations";

const GOOGLE_INTEGRATION_TABLE: Record<
  GoogleIntegrationProvider,
  "google_forms_integrations" | "youtube_integrations"
> = {
  google_forms: "google_forms_integrations",
  youtube: "youtube_integrations",
};

/** Desconecta una integración Google (revoca tokens en DB). */
export async function disconnectGoogleIntegrationAction(
  provider: GoogleIntegrationProvider
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from(GOOGLE_INTEGRATION_TABLE[provider])
      .update({
        status: "disconnected",
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
        last_sync_at: null,
      })
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
  });
}

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
  "instagram",
  "stripe",
  "typeform",
  "google_forms",
  "discord",
]);

export async function listIntegrationsAction(): Promise<Integration[]> {
  const [
    calendlyStatus,
    manychatStatus,
    fathomStatus,
    youtubeStatus,
    instagramStatus,
    stripeStatus,
    typeformStatus,
    googleFormsStatus,
    discordStatus,
  ] = await Promise.all([
    getCalendlyIntegrationStatusAction(),
    getManyChatIntegrationStatusAction(),
    getFathomIntegrationStatusAction(),
    getYoutubeIntegrationStatusAction(),
    getInstagramIntegrationStatusAction(),
    getStripeIntegrationStatusAction(),
    getTypeformIntegrationStatusAction(),
    getGoogleFormsIntegrationStatusAction(),
    getDiscordIntegrationStatusAction(),
  ]);

  const [
    calendlyRecords,
    manychatRecords,
    fathomRecords,
    youtubeRecords,
    instagramRecords,
    typeformRecords,
    googleFormsRecords,
    discordRecords,
  ] = await Promise.all([
    calendlyStatus.connected ? countCalendlyClosingCalls() : 0,
    manychatStatus.connected ? countManyChatConversations() : 0,
    fathomStatus.connected ? countFathomCalls() : 0,
    youtubeStatus.connected ? countContentAssets("youtube") : 0,
    instagramStatus.connected ? countContentAssets("instagram") : 0,
    typeformStatus.connected ? countForms("typeform") : 0,
    googleFormsStatus.connected ? countForms("google_forms") : 0,
    discordStatus.connected ? discordStatus.stats.messagesCount : 0,
  ]);

  return mockIntegrations.map((integration) => {
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
      instagram: {
        connected: instagramStatus.connected,
        lastSyncAt: instagramStatus.lastSyncAt,
        records: instagramRecords,
      },
      stripe: {
        connected: stripeStatus.connected,
        lastSyncAt: stripeStatus.lastSyncAt,
        records: 0,
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
      discord: {
        connected: discordStatus.connected,
        lastSyncAt: discordStatus.integration?.last_event_at ?? null,
        records: discordRecords,
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
