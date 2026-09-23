import "server-only";

/**
 * El formulario de onboarding del lado público: se entra con el token del
 * link, sin sesión.
 *
 * ⭐ Todo con service role, porque no hay usuario: RLS no tiene a quién mirar.
 * Por eso cada lectura filtra a mano por la organización del link, y el link
 * tiene que estar vivo y la organización tener el add-on. Si cualquiera de las
 * tres cosas falla, el link "no existe": no se dice cuál, para no contarle a
 * quien prueba tokens qué parte acertó.
 */

import { orgHasAddOn } from "@/lib/auth/add-ons";
import { onboardingFields, type OnboardingField } from "@/lib/client-onboarding/form";
import { looksLikeOnboardingToken } from "@/lib/client-onboarding/links";
import { rowToFieldDefinition } from "@/lib/custom-fields/mapper";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CustomFieldValues, FieldDefinition, FieldDefinitionRow } from "@/types/custom-fields";

export type PublicOnboarding = {
  linkId: string;
  organizationId: string;
  /** Nulos en el link general: todavía no se sabe de quién es. */
  clientId: string | null;
  subClient: { id: string; name: string; custom: CustomFieldValues } | null;
  fields: OnboardingField[];
};

export async function loadOnboardingByToken(token: string): Promise<PublicOnboarding | null> {
  if (!looksLikeOnboardingToken(token)) return null;
  const admin = createAdminClient();

  const { data: link, error } = await admin
    .from("client_onboarding_links")
    .select("id, kind, organization_id, client_id, sub_client_id, revoked_at")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    console.error("[onboarding] leer link", error.message);
    return null;
  }
  if (!link || link.revoked_at) return null;

  const organizationId = link.organization_id as string;
  if (!(await orgHasAddOn(organizationId, "growth_partners"))) return null;

  const general = link.kind === "general";

  const [{ data: sub, error: subError }, { data: rows, error: fieldsError }] = await Promise.all([
    general
      ? Promise.resolve({ data: null, error: null })
      : admin
          .from("client_sub_clients")
          .select("id, name, custom")
          .eq("id", link.sub_client_id as string)
          .eq("organization_id", organizationId)
          .maybeSingle(),
    admin
      .from("field_definitions")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("entity", "client")
      .order("sort_order", { ascending: true }),
  ]);
  if (subError || fieldsError) {
    console.error("[onboarding] leer formulario", subError?.message ?? fieldsError?.message);
    return null;
  }
  if (!general && !sub) return null;

  const all = ((rows ?? []) as FieldDefinitionRow[])
    .map(rowToFieldDefinition)
    .filter((field): field is FieldDefinition => field !== null);

  const custom =
    sub?.custom && typeof sub.custom === "object" && !Array.isArray(sub.custom)
      ? (sub.custom as CustomFieldValues)
      : {};

  return {
    linkId: link.id as string,
    organizationId,
    clientId: (link.client_id as string | null) ?? null,
    subClient: sub ? { id: sub.id as string, name: sub.name as string, custom } : null,
    fields: onboardingFields(all),
  };
}
