"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth/require-auth";
import { validateFathomApiKey, listFathomMeetings } from "@/lib/fathom/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/security/encryption";
import { paths } from "@/routes";
import { apiKeySchema, firstZodError } from "@/lib/validations";

function storeApiKey(apiKey: string): string {
  try {
    return encrypt(apiKey);
  } catch {
    return apiKey;
  }
}

function readApiKey(stored: string): string {
  try {
    return decrypt(stored);
  } catch {
    return stored;
  }
}

export type FathomMemberStatus = {
  userId: string;
  name: string;
  connected: boolean;
  lastSyncAt?: string | null;
};

export async function listFathomMemberStatusesAction(): Promise<FathomMemberStatus[]> {
  const { orgId: organizationId } = await requireAuthContext();
  const supabase = await createClient();

  const { data: members, error: membersError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (membersError) throw new Error(membersError.message);

  const admin = createAdminClient();
  const { data: integrations, error: integrationsError } = await admin
    .from("team_member_integrations")
    .select("user_id, last_sync_at")
    .eq("organization_id", organizationId)
    .eq("integration_type", "fathom");

  if (integrationsError) throw new Error(integrationsError.message);

  const byUser = new Map(
    (integrations ?? []).map((row) => [
      row.user_id as string,
      row.last_sync_at as string | null,
    ])
  );

  return (members ?? []).map((member) => ({
    userId: member.id as string,
    name: (member.full_name as string | null) ?? (member.email as string),
    connected: byUser.has(member.id as string),
    lastSyncAt: byUser.get(member.id as string) ?? null,
  }));
}

export async function connectMemberFathomAction(
  apiKey: string
): Promise<{ ok: boolean; error?: string }> {
  const parsed = apiKeySchema.safeParse(apiKey.trim());
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const { user, orgId: organizationId } = await requireAuthContext();

  try {
    await validateFathomApiKey(parsed.data);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "API key inválida",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("team_member_integrations").upsert(
    {
      organization_id: organizationId,
      user_id: user.id,
      integration_type: "fathom",
      encrypted_api_key: storeApiKey(parsed.data),
      connected_at: new Date().toISOString(),
    },
    { onConflict: "organization_id,user_id,integration_type" }
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(paths.platform.integrations);
  return { ok: true };
}

export async function disconnectMemberFathomAction(): Promise<void> {
  const { user, orgId: organizationId } = await requireAuthContext();
  const admin = createAdminClient();

  const { error } = await admin
    .from("team_member_integrations")
    .delete()
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("integration_type", "fathom");

  if (error) throw new Error(error.message);
  revalidatePath(paths.platform.integrations);
}

export async function syncMemberFathomAction(): Promise<{ synced: number }> {
  const { user, orgId: organizationId } = await requireAuthContext();
  const admin = createAdminClient();

  const { data: integration, error } = await admin
    .from("team_member_integrations")
    .select("encrypted_api_key, last_sync_at")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("integration_type", "fathom")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!integration?.encrypted_api_key) {
    throw new Error("No tenés Fathom conectado");
  }

  const apiKey = readApiKey(integration.encrypted_api_key as string);
  const meetings = await listFathomMeetings(apiKey, {
    createdAfter: (integration.last_sync_at as string | null) ?? undefined,
    maxPages: 5,
  });

  let synced = 0;

  for (const meeting of meetings) {
    const fathomCallId = String(meeting.recording_id ?? meeting.id);
    const title = meeting.title || meeting.meeting_title || "Sin título";
    const recordingStart =
      meeting.recording_start_time ??
      meeting.scheduled_start_time ??
      meeting.callDate ??
      new Date().toISOString();

    const { error: upsertError } = await admin.from("fathom_calls").upsert(
      {
        organization_id: organizationId,
        user_id: user.id,
        fathom_call_id: fathomCallId,
        title,
        raw_title: meeting.meeting_title || meeting.title,
        fathom_url: meeting.url ?? null,
        call_date: recordingStart,
        // La clasificación la resuelve el pipeline con el clasificador único.
        // Antes acá se clasificaba por keywords y el cron lo sobrescribía con
        // el resultado de la IA —o con null si fallaba—, así que este trabajo
        // se tiraba siempre.
        status: "pending",
        processed_after: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        association_candidates: [],
        ai_next_steps: [],
        ai_problems_detected: [],
      },
      { onConflict: "organization_id,fathom_call_id" }
    );

    if (!upsertError) synced += 1;
  }

  await admin
    .from("team_member_integrations")
    .update({
      last_sync_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("integration_type", "fathom");

  revalidatePath(paths.platform.integrations);
  return { synced };
}
