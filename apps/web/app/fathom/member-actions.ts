"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth/require-auth";
import { validateFathomApiKey, listFathomMeetings } from "@/lib/fathom/api";
import {
  createFathomWebhook,
  deleteFathomWebhook,
  guessFathomAccountEmail,
} from "@/lib/fathom/webhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/security/encryption";
import { paths } from "@/routes";
import { apiKeySchema, firstZodError } from "@/lib/validations";

/**
 * 🔴 Si no se puede cifrar, **no se guarda**.
 *
 * Antes esto caía al `catch` y guardaba la key **en texto plano** sin avisarle a
 * nadie: la persona veía "conectado" y su credencial de Fathom quedaba legible en
 * la base. Fallar la conexión es incómodo; guardar una credencial en claro es un
 * problema de seguridad que nadie descubre hasta que es tarde.
 */
function storeApiKey(apiKey: string): string {
  try {
    return encrypt(apiKey);
  } catch (error) {
    console.error(
      "[fathom member] no se pudo cifrar la key",
      error instanceof Error ? error.message : String(error)
    );
    throw new Error(
      "No se puede guardar la credencial de forma segura (falta ENCRYPTION_MASTER_KEY). " +
        "No se guardó nada."
    );
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
): Promise<{
  ok: boolean;
  error?: string;
  /** El mail de la cuenta de Fathom, para que el miembro lo confirme. */
  accountEmail?: string | null;
  /** Si el webhook no se pudo crear, por qué. La conexión igual sirve. */
  webhookError?: string | null;
}> {
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

  // Se cifra ANTES de tocar nada: si no se puede, no se guarda ni se crea el
  // webhook. (`storeApiKey` lanza.)
  let encryptedKey: string;
  try {
    encryptedKey = storeApiKey(parsed.data);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo guardar la credencial",
    };
  }

  // ⭐ Quién es el dueño de esta key. Se le muestra para que confirme: asumirlo
  // en silencio atribuiría todas sus llamadas a otra persona si sale mal.
  const accountEmail = await guessFathomAccountEmail(parsed.data).catch(() => null);

  // ⭐ El token opaco de la URL de destino. Con esto la verificación de firma es
  // contra **un solo secreto**, en vez de escanear todas las organizaciones.
  const webhookToken = crypto.randomUUID().replace(/-/g, "");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  let webhook: { id: string; secret: string } | null = null;
  let webhookError: string | null = null;

  if (baseUrl) {
    try {
      // ⭐ OTC le crea el webhook con su propia key: el miembro no configura nada
      // a mano en Fathom.
      webhook = await createFathomWebhook(
        parsed.data,
        `${baseUrl}/api/integrations/fathom/webhook/${webhookToken}`
      );
    } catch (error) {
      // Si el webhook falla, la conexión igual sirve: queda el poll de
      // reconciliación. Pero se registra, porque sin webhook las llamadas
      // llegan tarde y eso hay que poder verlo en el panel.
      webhookError = error instanceof Error ? error.message : String(error);
    }
  } else {
    webhookError = "NEXT_PUBLIC_APP_URL no configurada: no se pudo crear el webhook.";
  }

  const admin = createAdminClient();
  const { error } = await admin.from("team_member_integrations").upsert(
    {
      organization_id: organizationId,
      user_id: user.id,
      integration_type: "fathom",
      encrypted_api_key: encryptedKey,
      provider_account_email: accountEmail,
      webhook_id: webhook?.id ?? null,
      webhook_secret: webhook?.secret ?? null,
      webhook_token: webhook ? webhookToken : null,
      status: webhookError ? "error" : "connected",
      last_error: webhookError,
      last_error_at: webhookError ? new Date().toISOString() : null,
      connected_at: new Date().toISOString(),
    },
    { onConflict: "organization_id,user_id,integration_type" }
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(paths.platform.integrations);
  return { ok: true, accountEmail, webhookError };
}

export async function disconnectMemberFathomAction(): Promise<void> {
  const { user, orgId: organizationId } = await requireAuthContext();
  const admin = createAdminClient();

  // ⭐ Desconectarse tiene que **borrar el webhook de la cuenta de esa persona**,
  // no sólo dejar de leerlo. Si no, OTC deja basura colgada en una cuenta ajena.
  const { data: existing } = await admin
    .from("team_member_integrations")
    .select("encrypted_api_key, webhook_id")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("integration_type", "fathom")
    .maybeSingle();

  const row = existing as { encrypted_api_key: string | null; webhook_id: string | null } | null;
  if (row?.encrypted_api_key && row.webhook_id) {
    const result = await deleteFathomWebhook(
      readApiKey(row.encrypted_api_key),
      row.webhook_id
    );
    if (!result.deleted) {
      // No se bloquea la desconexión: un webhook huérfano molesta, impedir
      // desconectarse es peor.
      console.error("[fathom member] no se pudo borrar el webhook:", result.error);
    }
  }

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
