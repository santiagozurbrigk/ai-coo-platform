import "server-only";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getOnboardingState } from "./resolve";
import type { OnboardingState } from "./derive";

/**
 * Estado de onboarding del usuario y la organización activos.
 *
 * Función server plana, no Server Action: la usan tanto el layout de plataforma
 * —que es un Server Component— como las acciones. Una Server Action llamada
 * desde un layout funciona, pero deja el endpoint expuesto sin necesidad.
 */
export async function getCurrentOnboardingState(): Promise<OnboardingState | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();

  const [{ data: profile }, { data: org }] = await Promise.all([
    admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    admin
      .from("organizations")
      .select("skip_onboarding")
      .eq("id", organizationId)
      .maybeSingle(),
  ]);

  const role = (profile?.role as string | null) ?? "viewer";

  /*
   * El checklist es trabajo de founder: sus ítems viven en Ajustes,
   * Integraciones y Equipo, donde un `operator` o un `viewer` no tienen
   * permiso. Mostrárselo sería pedirles algo que no pueden hacer —y además
   * ahorra resolver los hechos en cada request de una cuenta invitada.
   */
  if (role !== "founder") return null;

  return getOnboardingState(organizationId, {
    role,
    skipOnboarding: Boolean(org?.skip_onboarding),
  });
}
