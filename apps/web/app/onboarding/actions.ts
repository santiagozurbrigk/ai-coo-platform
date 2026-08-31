"use server";

/**
 * Server Actions del gate de onboarding.
 *
 * Casi todo delega en las acciones que ya existen (`app/settings`, `app/product`):
 * el gate es una pantalla nueva sobre mutaciones viejas, no una capa de escritura
 * paralela. Lo único propio es marcar el gate como cruzado.
 */

import { redirect } from "next/navigation";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { saveGeneralOrganizationSettingsAction } from "@/app/settings/actions";
import { saveAvatarAction, saveProductAction } from "@/app/product/actions";
import {
  getOnboardingState,
  markGateCompleted,
} from "@/lib/onboarding/resolve";
import type { OnboardingState } from "@/lib/onboarding/derive";
import { paths } from "@/routes/paths";

export type OnboardingGateDefaults = {
  orgName: string;
  industry: string;
  websiteUrl: string;
  timezone: string;
  currency: string;
  language: string;
};

/** Valores actuales de la organización, para precargar el primer paso. */
export async function getOnboardingGateDefaultsAction(): Promise<OnboardingGateDefaults> {
  const empty: OnboardingGateDefaults = {
    orgName: "",
    industry: "",
    websiteUrl: "",
    timezone: "America/Argentina/Buenos_Aires",
    currency: "USD",
    language: "es",
  };

  if (!isSupabaseConfigured()) return empty;

  const organizationId = await requireOrganizationId();
  const { data } = await createAdminClient()
    .from("organizations")
    .select("name, industry, website_url, timezone, currency, language")
    .eq("id", organizationId)
    .maybeSingle();

  if (!data) return empty;

  return {
    // El nombre llega cargado por el super-admin: se muestra para confirmar,
    // no se pide de nuevo.
    orgName: (data.name as string | null) ?? "",
    industry: (data.industry as string | null) ?? "",
    websiteUrl: (data.website_url as string | null) ?? "",
    timezone: (data.timezone as string | null) ?? empty.timezone,
    currency: (data.currency as string | null) ?? empty.currency,
    language: (data.language as string | null) ?? empty.language,
  };
}

export type SaveGateBusinessInput = {
  orgName: string;
  industry?: string;
  websiteUrl?: string;
  timezone: string;
  currency: string;
  language: string;
};

export async function saveGateBusinessAction(
  input: SaveGateBusinessInput
): Promise<MutationResult> {
  return saveGeneralOrganizationSettingsAction({
    orgName: input.orgName,
    industry: input.industry,
    websiteUrl: input.websiteUrl ?? "",
    timezone: input.timezone,
    currency: input.currency,
    language: input.language,
  });
}

export type SaveGateOfferInput = {
  name: string;
  description?: string;
  price?: number;
  currency: string;
};

export async function saveGateOfferAction(
  input: SaveGateOfferInput
): Promise<MutationResult<{ ok: true }>> {
  return saveProductAction({
    name: input.name,
    description: input.description,
    price: input.price,
    currency: input.currency,
    // El primer producto es, por definición, la oferta principal y el primer
    // escalón del value ladder.
    isCoreOffer: true,
    isActive: true,
    valueLadderPosition: 1,
  });
}

export type SaveGateAvatarInput = {
  name: string;
  mainPain: string;
  occupation?: string;
  ageRange?: string;
};

export async function saveGateAvatarAction(
  input: SaveGateAvatarInput
): Promise<MutationResult<{ ok: true }>> {
  return saveAvatarAction({
    name: input.name,
    mainPain: input.mainPain,
    occupation: input.occupation,
    ageRange: input.ageRange,
    isPrimary: true,
  });
}

/** Estado del gate para la organización activa, ya derivado. */
export async function getOnboardingGateStateAction(): Promise<OnboardingState | null> {
  if (!isSupabaseConfigured()) return null;

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const [{ data: profile }, { data: org }] = await Promise.all([
    admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    admin
      .from("organizations")
      .select("skip_onboarding")
      .eq("id", organizationId)
      .maybeSingle(),
  ]);

  return getOnboardingState(organizationId, {
    role: (profile?.role as string | null) ?? "viewer",
    skipOnboarding: Boolean(org?.skip_onboarding),
  });
}

/**
 * Cierra el gate y manda al panel.
 *
 * Se niega a cerrarlo si los tres ítems no están cumplidos: el cliente ya lo
 * impide, pero la acción es la que escribe y no puede confiar en eso.
 */
export async function completeOnboardingGateAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const state = await getOnboardingGateStateAction();

    if (!state?.gate.satisfied) {
      throw new Error("Todavía faltan datos para terminar la configuración.");
    }

    await markGateCompleted(organizationId);
  });
}

/**
 * Cierra el gate sin pedir nada cuando los datos ya estaban cargados.
 *
 * Es el caso de una organización que se configuró por fuera del wizard: no
 * tiene sentido hacerla repetir tres pantallas que ya están completas.
 */
export async function skipSatisfiedGateAction(): Promise<void> {
  const organizationId = await requireOrganizationId();
  const state = await getOnboardingGateStateAction();

  if (state?.gate.satisfied && !state.gate.passed) {
    await markGateCompleted(organizationId);
  }

  redirect(paths.platform.dashboard);
}
