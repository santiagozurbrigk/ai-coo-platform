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
import {
  countUnipileConversationsAction,
  getUnipileIntegrationStatusAction,
} from "@/app/unipile/actions";
import { getZernioIntegrationStatusAction } from "@/app/integrations/zernio/actions";
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

export async function disconnectInstagramAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("instagram_integrations")
      .delete()
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
  });
}

export async function disconnectFathomAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("fathom_integrations")
      .delete()
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
  });
}

export async function disconnectManyChatAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("manychat_integrations")
      .delete()
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
  });
}

export async function disconnectCalendlyAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("calendly_integrations")
      .delete()
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
  });
}

export async function disconnectTypeformAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("typeform_integrations")
      .delete()
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
  });
}

export async function disconnectZernioAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("zernio_integrations")
      .delete()
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
  "zernio",
  "unipile_whatsapp",
  "typeform",
  "google_forms",
  "google_ecosystem",
  "discord",
]);

const HIDDEN_INTEGRATION_PROVIDERS = new Set([
  "stripe",
  "mercadopago",
  "paypal",
  "unipile_instagram",
  "instagram",
  "unipile_whatsapp",
  "youtube",
  "google_forms",
]);

export async function listIntegrationsAction(): Promise<Integration[]> {
  const [
    calendlyStatus,
    manychatStatus,
    fathomStatus,
    youtubeStatus,
    instagramStatus,
    unipileWhatsappStatus,
    typeformStatus,
    googleFormsStatus,
    discordStatus,
    zernioStatus,
  ] = await Promise.all([
    getCalendlyIntegrationStatusAction(),
    getManyChatIntegrationStatusAction(),
    getFathomIntegrationStatusAction(),
    getYoutubeIntegrationStatusAction(),
    getInstagramIntegrationStatusAction(),
    getUnipileIntegrationStatusAction("whatsapp"),
    getTypeformIntegrationStatusAction(),
    getGoogleFormsIntegrationStatusAction(),
    getDiscordIntegrationStatusAction(),
    getZernioIntegrationStatusAction(),
  ]);

  const [
    calendlyRecords,
    manychatRecords,
    fathomRecords,
    youtubeRecords,
    instagramRecords,
    unipileWhatsappRecords,
    typeformRecords,
    googleFormsRecords,
    discordRecords,
    zernioRecords,
  ] = await Promise.all([
    calendlyStatus.connected ? countCalendlyClosingCalls() : 0,
    manychatStatus.connected ? countManyChatConversations() : 0,
    fathomStatus.connected ? countFathomCalls() : 0,
    youtubeStatus.connected ? countContentAssets("youtube") : 0,
    instagramStatus.connected ? countContentAssets("instagram") : 0,
    unipileWhatsappStatus.connected ? countUnipileConversationsAction("whatsapp") : 0,
    typeformStatus.connected ? countForms("typeform") : 0,
    googleFormsStatus.connected ? countForms("google_forms") : 0,
    discordStatus.connected ? discordStatus.stats.messagesCount : 0,
    zernioStatus.connected ? zernioStatus.connectedAccounts.length : 0,
  ]);

  return mockIntegrations
    .filter((integration) => !HIDDEN_INTEGRATION_PROVIDERS.has(integration.provider))
    .filter((integration) => integration.hidden !== true)
    .map((integration) => {
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
      unipile_whatsapp: {
        connected: unipileWhatsappStatus.connected,
        lastSyncAt: unipileWhatsappStatus.connectedAt,
        records: unipileWhatsappRecords,
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
      google_ecosystem: {
        connected: googleFormsStatus.connected || youtubeStatus.connected,
        lastSyncAt:
          [googleFormsStatus.lastSyncAt, youtubeStatus.lastSyncAt]
            .filter(Boolean)
            .sort()
            .reverse()[0] ?? null,
        records: googleFormsRecords + youtubeRecords,
      },
      zernio: {
        connected: zernioStatus.connected,
        lastSyncAt: zernioStatus.lastSyncAt,
        records: zernioRecords,
      },
    };

    const live = statusMap[integration.provider];
    if (live) {
      if (!live.connected) {
        return { ...integration, status: "not_connected" as const };
      }

      let description = integration.description;
      if (integration.provider === "unipile_whatsapp" && unipileWhatsappStatus.displayName) {
        description = `Cuenta: ${unipileWhatsappStatus.displayName}`;
      }
      if (integration.provider === "zernio" && zernioStatus.connected) {
        const accountLabel = zernioStatus.accountName
          ? `Cuenta: ${zernioStatus.accountName}`
          : null;
        const channels = zernioStatus.channelsLabel;
        description = [accountLabel, `Canales: ${channels}`]
          .filter(Boolean)
          .join(" · ");
      }

      return {
        ...integration,
        description,
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
