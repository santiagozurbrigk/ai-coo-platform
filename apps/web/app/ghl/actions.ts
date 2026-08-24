"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { integrationConnectRateLimit, rateLimitErrorMessage } from "@/lib/rate-limit";
import { requireAuthContext } from "@/lib/auth/require-auth";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { revalidatePath } from "next/cache";
import { paths } from "@/routes";
import {
  validateGHLApiKey,
  GHLApiError,
  type GHLCalendar,
} from "@/lib/ghl/client";
import {
  getGHLIntegrationForOrg,
  upsertGHLIntegration,
  getGHLCredentialsForOrg,
} from "@/lib/ghl/integration";
import { syncGHLOrganizationSafe } from "@/lib/ghl/sync-pipeline";

// ─── Status ───────────────────────────────────────────────────────────────────

export type GHLIntegrationStatus = {
  connected: boolean;
  locationId: string | null;
  defaultCalendarId: string | null;
  connectedCalendars: GHLCalendar[];
  lastSyncAt: string | null;
};

const EMPTY_STATUS: GHLIntegrationStatus = {
  connected: false,
  locationId: null,
  defaultCalendarId: null,
  connectedCalendars: [],
  lastSyncAt: null,
};

export async function getGHLIntegrationStatusAction(): Promise<GHLIntegrationStatus> {
  if (!isSupabaseConfigured()) return EMPTY_STATUS;

  try {
    const organizationId = await requireOrganizationId();
    const row = await getGHLIntegrationForOrg(organizationId);
    if (!row) return EMPTY_STATUS;

    return {
      connected: true,
      locationId: row.location_id,
      defaultCalendarId: row.default_calendar_id,
      connectedCalendars: row.connected_calendars ?? [],
      lastSyncAt: row.last_sync_at,
    };
  } catch {
    return EMPTY_STATUS;
  }
}

// ─── Conectar ─────────────────────────────────────────────────────────────────

export type GHLValidateResult =
  | { success: true; calendars: GHLCalendar[] }
  | { success: false; error: string };

/**
 * Valida la API key + location ID y devuelve los calendarios disponibles.
 * No guarda nada en DB todavía — el usuario elige el calendario primero.
 */
export async function validateGHLKeyAction(
  apiKey: string,
  locationId: string
): Promise<GHLValidateResult> {
  if (!apiKey?.trim()) {
    return { success: false, error: "Ingresá tu Private Integration Token de GHL." };
  }
  if (!locationId?.trim()) {
    return { success: false, error: "Ingresá tu Location ID de GHL." };
  }

  try {
    const { user } = await requireAuthContext();
    const { allowed, resetAt } = await integrationConnectRateLimit(user.id);
    if (!allowed) return { success: false, error: rateLimitErrorMessage(resetAt) };

    const calendars = await validateGHLApiKey(apiKey.trim(), locationId.trim());
    if (!calendars.length) {
      return { success: false, error: "No se encontraron calendarios en esta ubicación." };
    }
    return { success: true, calendars };
  } catch (e) {
    if (e instanceof GHLApiError) {
      if (e.status === 401 || e.status === 403) {
        return { success: false, error: "Token inválido o sin permisos. Verificá tu Private Integration Token." };
      }
    }
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al conectar con GHL.",
    };
  }
}

/**
 * Guarda la integración GHL con el calendario elegido por el usuario.
 */
export async function connectGHLAction(
  apiKey: string,
  locationId: string,
  calendars: GHLCalendar[],
  selectedCalendarId: string
): Promise<MutationResult> {
  return runMutation(async () => {
    if (!selectedCalendarId) throw new Error("Seleccioná un calendario.");

    const organizationId = await requireOrganizationId();
    await upsertGHLIntegration(
      organizationId,
      apiKey.trim(),
      locationId.trim(),
      calendars,
      selectedCalendarId
    );
    revalidatePath(paths.platform.integrations);
  });
}

/**
 * Cambia el calendario activo sin re-validar la API key.
 */
export async function updateGHLCalendarAction(
  calendarId: string
): Promise<MutationResult> {
  return runMutation(async () => {
    if (!calendarId) throw new Error("Seleccioná un calendario.");
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("ghl_integrations")
      .update({ default_calendar_id: calendarId, updated_at: new Date().toISOString() })
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
  });
}

// ─── Sync manual ──────────────────────────────────────────────────────────────

export type GHLSyncActionResult = {
  fetched: number;
  inserted: number;
  updated: number;
  skippedCancelled: number;
};

export async function syncGHLAppointmentsAction(): Promise<
  MutationResult<GHLSyncActionResult>
> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    // Validar que la integración esté configurada
    await getGHLCredentialsForOrg(organizationId);
    const result = await syncGHLOrganizationSafe(organizationId);
    return {
      fetched: result.fetched,
      inserted: result.inserted,
      updated: result.updated,
      skippedCancelled: result.skippedCancelled,
    };
  });
}

// ─── Desconectar ──────────────────────────────────────────────────────────────

export async function disconnectGHLAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("ghl_integrations")
      .delete()
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
  });
}
