import "server-only";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getOnboardingState, resolvePersistedOnboardingState } from "./resolve";
import type { OnboardingState } from "./derive";

export type OnboardingContext = {
  /**
   * Checklist. `null` para cuentas invitadas: sus ítems viven en Ajustes,
   * Integraciones y Equipo, donde no tienen permiso.
   */
  state: OnboardingState | null;
  /**
   * Tours ya vistos. Va aparte del checklist a propósito: los tours **sí** le
   * corresponden a un invitado —es su única forma de onboarding— y resolverlos
   * es una consulta por clave primaria, no los ocho `count` del checklist.
   */
  toursSeen: string[];
};

/**
 * Estado de onboarding del usuario y la organización activos.
 *
 * Función server plana, no Server Action: la usan tanto el layout de plataforma
 * —que es un Server Component— como las acciones. Una Server Action llamada
 * desde un layout funciona, pero deja el endpoint expuesto sin necesidad.
 */
export async function getCurrentOnboardingContext(): Promise<OnboardingContext> {
  const empty: OnboardingContext = { state: null, toursSeen: [] };
  if (!isSupabaseConfigured()) return empty;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();

  const [{ data: profile }, { data: org }, persisted] = await Promise.all([
    admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    admin
      .from("organizations")
      .select("skip_onboarding")
      .eq("id", organizationId)
      .maybeSingle(),
    resolvePersistedOnboardingState(organizationId),
  ]);

  const role = (profile?.role as string | null) ?? "viewer";

  if (role !== "founder") {
    return { state: null, toursSeen: persisted.toursSeen };
  }

  const state = await getOnboardingState(organizationId, {
    role,
    skipOnboarding: Boolean(org?.skip_onboarding),
  });

  return { state, toursSeen: persisted.toursSeen };
}
