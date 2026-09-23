"use server";

/**
 * Los clientes de un cliente, con su Marketing, Ventas y Sistemas.
 *
 * ⭐ Todo pasa por el add-on `growth_partners`. Sin él, las lecturas devuelven
 * vacío y las escrituras se rechazan: la tarjeta no se dibuja, pero una Server
 * Action se puede llamar igual.
 *
 * Los valores se validan contra las mismas columnas configurables que antes se
 * cargaban en el cliente —las que tienen sección—, así renombrar o agregar un
 * campo sigue siendo una edición en Campos personalizados.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { orgHasAddOn, requireAddOn } from "@/lib/auth/add-ons";
import { listFieldDefinitionsAction } from "@/app/clients/custom-field-actions";
import { activeFields, mergeCustomFieldValues, validateFieldValues } from "@/lib/custom-fields";
import {
  SUB_CLIENT_COLUMNS,
  SUB_CLIENT_NAME_MAX,
  normalizeInstagramUrl,
  planLegacyMove,
  rowToSubClient,
  type SubClient,
  type SubClientRow,
} from "@/lib/clients/sub-clients";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { firstZodError } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes";
import type { CustomFieldValues } from "@/types/custom-fields";

const ADD_ON = "growth_partners" as const;

const nameSchema = z
  .string()
  .trim()
  .min(1, "Poné el nombre del cliente.")
  .max(SUB_CLIENT_NAME_MAX, "Ese nombre es demasiado largo.");

const createSchema = z.object({
  clientId: z.string().uuid(),
  name: nameSchema,
  instagramUrl: z.string().max(500).nullish(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  name: nameSchema,
  instagramUrl: z.string().max(500).nullish(),
});

const valuesSchema = z.object({
  id: z.string().uuid(),
  values: z.record(z.string(), z.unknown()).default({}),
});

const moveSchema = z.object({
  clientId: z.string().uuid(),
  subClientId: z.string().uuid(),
});

function revalidar(clientId: string) {
  revalidatePath(paths.platform.clients.detail(clientId));
}

function linkOError(raw: string | null | undefined): string | null {
  const link = normalizeInstagramUrl(raw);
  if (!link.ok) throw new Error(link.error);
  return link.url;
}

/** Los campos de Marketing, Ventas y Sistemas: todos, archivados incluidos. */
async function sectionFields() {
  const all = await listFieldDefinitionsAction("client");
  return all.filter((field) => field.section !== null);
}

export async function listSubClientsAction(clientId: string): Promise<SubClient[]> {
  const organizationId = await requireOrganizationId();
  if (!(await orgHasAddOn(organizationId, ADD_ON))) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_sub_clients")
    .select(SUB_CLIENT_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    console.error("[sub-clients] listar", error.message);
    return [];
  }
  return ((data ?? []) as SubClientRow[]).map(rowToSubClient);
}

export async function createSubClientAction(
  input: z.input<typeof createSchema>
): Promise<MutationResult<SubClient>> {
  return runMutation(async () => {
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const { clientId, name } = parsed.data;
    const instagramUrl = linkOError(parsed.data.instagramUrl);

    const organizationId = await requireOrganizationId();
    await requireAddOn(organizationId, ADD_ON);
    const profile = await getCurrentProfile();
    const supabase = await createClient();

    // RLS mira la organización de la fila nueva, no la del cliente: sin esto
    // se podría colgar un sub-cliente de un cliente ajeno.
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!client) throw new Error("No se encontró ese cliente en tu organización.");

    const { data, error } = await supabase
      .from("client_sub_clients")
      .insert({
        organization_id: organizationId,
        client_id: clientId,
        name,
        instagram_url: instagramUrl,
        created_by: profile?.id ?? null,
      })
      .select(SUB_CLIENT_COLUMNS)
      .single();

    if (error) {
      if (isMissingTableError(error.message)) {
        throw new Error("La tabla de clientes todavía no existe en la base. Falta aplicar la migración.");
      }
      throw new Error(error.message);
    }

    revalidar(clientId);
    return rowToSubClient(data as SubClientRow);
  });
}

export async function updateSubClientAction(
  input: z.input<typeof updateSchema>
): Promise<MutationResult<SubClient>> {
  return runMutation(async () => {
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const { id, name } = parsed.data;
    const instagramUrl = linkOError(parsed.data.instagramUrl);

    const organizationId = await requireOrganizationId();
    await requireAddOn(organizationId, ADD_ON);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("client_sub_clients")
      .update({ name, instagram_url: instagramUrl, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("organization_id", organizationId)
      .select(SUB_CLIENT_COLUMNS)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Ese cliente ya no existe.");

    const sub = rowToSubClient(data as SubClientRow);
    revalidar(sub.clientId);
    return sub;
  });
}

/**
 * Guarda Marketing, Ventas y Sistemas de un sub-cliente.
 *
 * Las mismas dos reglas que `updateClientCustomFieldsAction`: se valida contra
 * los campos activos, y lo cargado en uno archivado se conserva.
 */
export async function updateSubClientFieldsAction(
  input: z.input<typeof valuesSchema>
): Promise<MutationResult<CustomFieldValues>> {
  return runMutation(async () => {
    const parsed = valuesSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const { id, values } = parsed.data;

    const organizationId = await requireOrganizationId();
    await requireAddOn(organizationId, ADD_ON);
    const supabase = await createClient();

    const { data: current, error: readError } = await supabase
      .from("client_sub_clients")
      .select("client_id, custom")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!current) throw new Error("Ese cliente ya no existe.");

    const all = await sectionFields();
    const validation = validateFieldValues(activeFields(all), values);
    if (!validation.ok) {
      const mensajes = Object.values(validation.errors);
      throw new Error(mensajes.join(" · ") || "Datos inválidos");
    }

    const loaded = (current.custom ?? {}) as CustomFieldValues;
    const merged = mergeCustomFieldValues(all, loaded, validation.values);

    const { error } = await supabase
      .from("client_sub_clients")
      .update({ custom: merged, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);

    revalidar(current.client_id as string);
    return merged;
  });
}

export async function deleteSubClientAction(id: string): Promise<MutationResult<void>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    await requireAddOn(organizationId, ADD_ON);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("client_sub_clients")
      .delete()
      .eq("id", id)
      .eq("organization_id", organizationId)
      .select("client_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data?.client_id) revalidar(data.client_id as string);
  });
}

/**
 * Pasa a un sub-cliente los datos de Marketing, Ventas y Sistemas que quedaron
 * cargados en el growth partner, de antes de que existieran sus clientes.
 *
 * ⭐ No pisa nada: lo que el destino ya tiene se respeta, y ese dato viejo se
 * queda en el growth partner para pasarlo a otro. Ver `planLegacyMove`.
 *
 * Son dos escrituras. Se escribe primero el destino: si la segunda falla, el
 * dato queda en los dos lados —repetido, no perdido— y volver a apretar el
 * botón lo termina de pasar.
 */
export async function moveLegacySectionValuesAction(
  input: z.input<typeof moveSchema>
): Promise<MutationResult<{ moved: number; kept: number }>> {
  return runMutation(async () => {
    const parsed = moveSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const { clientId, subClientId } = parsed.data;

    const organizationId = await requireOrganizationId();
    await requireAddOn(organizationId, ADD_ON);
    const supabase = await createClient();

    const [{ data: client, error: clientError }, { data: sub, error: subError }] =
      await Promise.all([
        supabase
          .from("clients")
          .select("custom")
          .eq("id", clientId)
          .eq("organization_id", organizationId)
          .maybeSingle(),
        supabase
          .from("client_sub_clients")
          .select("custom")
          .eq("id", subClientId)
          .eq("client_id", clientId)
          .eq("organization_id", organizationId)
          .maybeSingle(),
      ]);
    if (clientError) throw new Error(clientError.message);
    if (subError) throw new Error(subError.message);
    if (!client) throw new Error("No se encontró ese cliente en tu organización.");
    if (!sub) throw new Error("Ese cliente ya no existe.");

    const plan = planLegacyMove(
      await sectionFields(),
      (client.custom ?? {}) as CustomFieldValues,
      (sub.custom ?? {}) as CustomFieldValues
    );

    if (plan.moved.length > 0) {
      const now = new Date().toISOString();

      const { error: subUpdateError } = await supabase
        .from("client_sub_clients")
        .update({ custom: plan.subClientCustom, updated_at: now })
        .eq("id", subClientId)
        .eq("organization_id", organizationId);
      if (subUpdateError) throw new Error(subUpdateError.message);

      const { error: clientUpdateError } = await supabase
        .from("clients")
        .update({ custom: plan.clientCustom, updated_at: now })
        .eq("id", clientId)
        .eq("organization_id", organizationId);
      if (clientUpdateError) throw new Error(clientUpdateError.message);
    }

    revalidar(clientId);
    revalidatePath(paths.platform.clients.root);
    return { moved: plan.moved.length, kept: plan.kept.length };
  });
}
