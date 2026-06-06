import { isMissingTableError } from "@/lib/auth/bootstrap";
import { FathomApiError, validateFathomApiKey } from "@/lib/fathom/api";
import { syncFathomMeetingsForOrganization } from "@/lib/fathom/sync";
import { createAdminClient } from "@/lib/supabase/admin";

import { apiKeySchema, firstZodError } from "@/lib/validations";

export type ConnectFathomResult = {
  ok: boolean;
  error?: string;
  synced?: number;
};

export function mapFathomConnectError(msg: string): string {
  if (isMissingTableError(msg)) {
    return "Falta la tabla fathom_integrations. Ejecuta las migraciones de Supabase.";
  }
  if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("api key")) {
    return "API key de Fathom inválida. Revisala en fathom.video/settings/api.";
  }
  return msg;
}

export async function connectFathomWithApiKey(
  organizationId: string,
  apiKey: string,
  options?: { syncOnConnect?: boolean }
): Promise<ConnectFathomResult> {
  const trimmed = apiKey.trim();
  const parsed = apiKeySchema.safeParse(trimmed);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    await validateFathomApiKey(parsed.data);
  } catch (e) {
    const message =
      e instanceof FathomApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : "No se pudo validar la API key.";
    return { ok: false, error: mapFathomConnectError(message) };
  }

  const now = new Date().toISOString();
  const admin = createAdminClient();
  const { error } = await admin.from("fathom_integrations").upsert(
    {
      organization_id: organizationId,
      api_key: parsed.data,
      webhook_secret: process.env.FATHOM_WEBHOOK_SECRET ?? null,
      status: "connected",
      last_sync_at: now,
    },
    { onConflict: "organization_id" }
  );

  if (error) {
    return { ok: false, error: mapFathomConnectError(error.message) };
  }

  if (options?.syncOnConnect === false) {
    return { ok: true, synced: 0 };
  }

  try {
    const synced = await syncFathomMeetingsForOrganization(organizationId);
    return { ok: true, synced };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al sincronizar";
    return {
      ok: true,
      synced: 0,
      error: `Fathom conectado, pero falló la sincronización inicial: ${message}`,
    };
  }
}
