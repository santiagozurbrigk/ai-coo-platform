/**
 * Helpers para leer y escribir la integración GHL por organización.
 * Similar a lib/zernio/integration.ts — solo se usa con createAdminClient()
 * para leer la API key cifrada (la tabla no tiene RLS SELECT).
 */

import { decrypt, encrypt } from "@/lib/security/encryption";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  listGHLCalendars,
  type GHLCalendar,
} from "./client";

export type GHLIntegrationRow = {
  organization_id: string;
  api_key_encrypted: string;
  location_id: string;
  default_calendar_id: string | null;
  connected_calendars: GHLCalendar[];
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

// ─── Cifrado ─────────────────────────────────────────────────────────────────

export function encryptGHLApiKey(plainKey: string): string {
  try {
    return encrypt(plainKey);
  } catch {
    return plainKey;
  }
}

export function decryptGHLApiKey(stored: string): string {
  try {
    return decrypt(stored);
  } catch {
    return stored;
  }
}

// ─── Lectura ──────────────────────────────────────────────────────────────────

export async function getGHLIntegrationForOrg(
  organizationId: string
): Promise<GHLIntegrationRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ghl_integrations")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as GHLIntegrationRow | null) ?? null;
}

/**
 * Devuelve { apiKey (plano), locationId, calendarId } listos para usar.
 * Lanza si no hay integración configurada.
 */
export async function getGHLCredentialsForOrg(organizationId: string): Promise<{
  apiKey: string;
  locationId: string;
  calendarId: string;
}> {
  const row = await getGHLIntegrationForOrg(organizationId);
  if (!row) throw new Error("GHL no configurado para esta organización");
  if (!row.default_calendar_id) {
    throw new Error("No hay calendario GHL seleccionado");
  }
  return {
    apiKey: decryptGHLApiKey(row.api_key_encrypted),
    locationId: row.location_id,
    calendarId: row.default_calendar_id,
  };
}

/**
 * Guarda o actualiza la integración GHL (upsert).
 * Si `calendarId` no se provee, mantiene el valor anterior.
 */
export async function upsertGHLIntegration(
  organizationId: string,
  apiKey: string,
  locationId: string,
  calendars: GHLCalendar[],
  calendarId?: string
): Promise<void> {
  const admin = createAdminClient();

  const existing = await getGHLIntegrationForOrg(organizationId);
  const finalCalendarId =
    calendarId ?? existing?.default_calendar_id ?? null;

  const { error } = await admin.from("ghl_integrations").upsert(
    {
      organization_id: organizationId,
      api_key_encrypted: encryptGHLApiKey(apiKey),
      location_id: locationId,
      default_calendar_id: finalCalendarId,
      connected_calendars: calendars,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" }
  );

  if (error) throw new Error(error.message);
}

/**
 * Obtiene un cliente GHL con las credenciales de la org, listo para hacer fetch.
 */
export async function getGHLClientForOrg(organizationId: string): Promise<{
  apiKey: string;
  locationId: string;
  calendarId: string;
  calendars: GHLCalendar[];
}> {
  const row = await getGHLIntegrationForOrg(organizationId);
  if (!row) throw new Error("GHL no configurado para esta organización");
  if (!row.default_calendar_id) throw new Error("No hay calendario GHL seleccionado");

  return {
    apiKey: decryptGHLApiKey(row.api_key_encrypted),
    locationId: row.location_id,
    calendarId: row.default_calendar_id,
    calendars: row.connected_calendars ?? [],
  };
}

/**
 * Refresca la lista de calendarios desde la API y la guarda en DB.
 */
export async function refreshGHLCalendars(
  organizationId: string
): Promise<GHLCalendar[]> {
  const row = await getGHLIntegrationForOrg(organizationId);
  if (!row) throw new Error("GHL no configurado");

  const apiKey = decryptGHLApiKey(row.api_key_encrypted);
  const calendars = await listGHLCalendars(apiKey, row.location_id);

  const admin = createAdminClient();
  await admin
    .from("ghl_integrations")
    .update({ connected_calendars: calendars, updated_at: new Date().toISOString() })
    .eq("organization_id", organizationId);

  return calendars;
}
