import "server-only";

/**
 * Los add-ons de una organización, del lado del servidor.
 *
 * ⭐ Esconder un botón no es un permiso. `useHasAddOn` decide qué se dibuja;
 * esto decide qué acepta una Server Action, que se puede llamar a mano aunque
 * el botón no exista.
 *
 * Se lee con service role por las cuentas holding: la organización efectiva
 * puede ser un negocio del portfolio, que no es la del perfil y que RLS no
 * siempre deja leer. Es una sola columna, y no sale al cliente.
 */

import { cache } from "react";
import { ADD_ON_IDS, type AddOnId } from "@/lib/auth/add-on-ids";
import { createAdminClient } from "@/lib/supabase/admin";

const loadEnabledAddOns = cache(async (organizationId: string): Promise<AddOnId[]> => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select("enabled_add_ons")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    console.error("[add-ons] no se pudieron leer", error.message);
    return [];
  }
  const raw = (data?.enabled_add_ons as string[] | null) ?? [];
  return raw.filter((id): id is AddOnId => ADD_ON_IDS.includes(id as AddOnId));
});

export async function orgHasAddOn(organizationId: string, addOn: AddOnId): Promise<boolean> {
  return (await loadEnabledAddOns(organizationId)).includes(addOn);
}

export async function requireAddOn(organizationId: string, addOn: AddOnId): Promise<void> {
  if (!(await orgHasAddOn(organizationId, addOn))) {
    throw new Error("Esta función no está habilitada para tu organización.");
  }
}
