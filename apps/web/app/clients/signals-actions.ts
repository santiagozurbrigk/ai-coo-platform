"use server";

/**
 * Las señales de la lista de clientes: hace cuánto no hay novedades de cada
 * growth partner y qué fechas con aviso de sus creadores se acercan.
 *
 * ⭐ Sólo con el add-on `growth_partners`, como todo lo que vino del pedido de
 * Limitless. Sin él las lecturas devuelven vacío y la escritura se rechaza.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile, requireOrganizationId } from "@/lib/auth/bootstrap";
import { orgHasAddOn, requireAddOn } from "@/lib/auth/add-ons";
import { listFieldDefinitionsAction } from "@/app/clients/custom-field-actions";
import {
  DEFAULT_SILENCE_DAYS,
  resolveSilence,
  upcomingDateAlerts,
  type ClientSilence,
  type DateAlert,
} from "@/lib/clients/signals";
import { isValidFieldKey } from "@/lib/custom-fields/key";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all-rows";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes";
import type { CustomFieldValues } from "@/types/custom-fields";

const ADD_ON = "growth_partners" as const;

export type ClientSignals = {
  thresholdDays: number;
  silence: Record<string, ClientSilence>;
  dateAlerts: Record<string, DateAlert[]>;
};

async function leerUmbral(organizationId: string): Promise<number> {
  const { data, error } = await createAdminClient()
    .from("organizations")
    .select("client_silence_days")
    .eq("id", organizationId)
    .maybeSingle();
  if (error) {
    // Antes de la migración la columna no existe: se usa el valor por defecto.
    return DEFAULT_SILENCE_DAYS;
  }
  const dias = (data?.client_silence_days as number | null) ?? DEFAULT_SILENCE_DAYS;
  return dias > 0 ? dias : DEFAULT_SILENCE_DAYS;
}

export async function getClientSignalsAction(): Promise<ClientSignals> {
  const organizationId = await requireOrganizationId();
  const vacio: ClientSignals = {
    thresholdDays: DEFAULT_SILENCE_DAYS,
    silence: {},
    dateAlerts: {},
  };
  if (!(await orgHasAddOn(organizationId, ADD_ON))) return vacio;

  const admin = createAdminClient();
  const supabase = await createClient();
  const [thresholdDays, fields] = await Promise.all([
    leerUmbral(organizationId),
    listFieldDefinitionsAction("client"),
  ]);

  /*
   * ⭐ De los creadores sólo se leen los campos de fecha con aviso, no el
   * jsonb entero: con el onboarding cargado son 80 respuestas por creador que
   * la lista no necesita.
   */
  const fechas = fields
    .filter((f) => f.fieldType === "date" && f.alertDaysBefore !== null && f.section !== null)
    .map((f) => f.key)
    .filter(isValidFieldKey);
  const columnasFecha = fechas.map((key) => `${key}:custom->>${key}`).join(", ");

  const [actividad, creadores] = await Promise.all([
    fetchAllRows<{ client_id: string; last_at: string; source: string }>((from, to) =>
      admin.rpc("client_last_activity", { p_org: organizationId }).range(from, to)
    ),
    fechas.length === 0
      ? Promise.resolve({ rows: [], truncated: false, error: null })
      : fetchAllRows<Record<string, string | null>>(
          (from, to) =>
            // Las columnas se arman con las claves de la organización: el
            // tipado de supabase-js no puede leer un select dinámico.
            supabase
              .from("client_sub_clients")
              .select(`client_id, name, ${columnasFecha}` as "*")
              .eq("organization_id", organizationId)
              .order("created_at", { ascending: true })
              .range(from, to) as unknown as PromiseLike<{
              data: Record<string, string | null>[] | null;
              error: { message: string } | null;
            }>
        ),
  ]);
  if (actividad.error) console.error("[señales] última novedad", actividad.error);
  if (creadores.error) console.error("[señales] fechas de creadores", creadores.error);

  const now = new Date();
  const silence: Record<string, ClientSilence> = {};
  for (const row of actividad.rows) {
    const resuelto = resolveSilence(row.last_at, row.source, thresholdDays, now);
    if (resuelto) silence[row.client_id] = resuelto;
  }

  const subClients = creadores.rows.map((row) => {
    const custom: CustomFieldValues = {};
    for (const key of fechas) if (row[key]) custom[key] = row[key];
    return { clientId: row.client_id as string, name: row.name as string, custom };
  });

  return {
    thresholdDays,
    silence,
    dateAlerts: upcomingDateAlerts(fields, subClients, now),
  };
}

/** A partir de cuántos días sin novedades se marca un cliente. */
export async function getClientSilenceDaysAction(): Promise<number> {
  const organizationId = await requireOrganizationId();
  return leerUmbral(organizationId);
}

const umbralSchema = z
  .number()
  .int("Tiene que ser un número entero de días.")
  .min(1, "Tiene que ser al menos 1 día.")
  .max(365, "Como mucho, 365 días.");

/** Cambia a partir de cuántos días sin novedades se marca un cliente. */
export async function setClientSilenceDaysAction(
  days: number
): Promise<MutationResult<number>> {
  return runMutation(async () => {
    const parsed = umbralSchema.safeParse(days);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Valor inválido.");

    const profile = await getCurrentProfile();
    if (profile?.role !== "founder") throw new Error("Solo el founder puede cambiar el aviso.");
    const organizationId = await requireOrganizationId();
    await requireAddOn(organizationId, ADD_ON);

    // Con service role: `authenticated` no puede escribir `organizations`.
    // Lo que protege es el chequeo de founder y de organización de arriba.
    const { error } = await createAdminClient()
      .from("organizations")
      .update({ client_silence_days: parsed.data })
      .eq("id", organizationId);
    if (error) throw new Error(error.message);

    revalidatePath(paths.platform.clients.root);
    return parsed.data;
  });
}
