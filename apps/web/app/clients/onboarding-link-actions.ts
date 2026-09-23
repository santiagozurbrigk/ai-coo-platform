"use server";

/**
 * El link de onboarding de cada cliente de un growth partner, y su historial.
 *
 * ⭐ Todo detrás del add-on `growth_partners`, como el resto de los clientes de
 * un cliente. Las lecturas y escrituras van con la sesión del usuario (RLS por
 * organización); sólo la página pública usa service role.
 */

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { orgHasAddOn, requireAddOn } from "@/lib/auth/add-ons";
import {
  ONBOARDING_LINK_COLUMNS,
  ONBOARDING_SUBMISSION_COLUMNS,
  rowToOnboardingSubmission,
  type OnboardingLink,
  type OnboardingSubmission,
  type OnboardingSubmissionRow,
} from "@/lib/client-onboarding/links";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes";

const ADD_ON = "growth_partners" as const;
const idSchema = z.string().uuid();

type LinkRow = {
  id: string;
  sub_client_id: string;
  token: string;
  created_at: string;
  revoked_at: string | null;
};

function rowToLink(row: LinkRow): OnboardingLink {
  return {
    id: row.id,
    subClientId: row.sub_client_id,
    token: row.token,
    createdAt: row.created_at,
  };
}

export type OnboardingStatus = {
  link: OnboardingLink | null;
  submissions: OnboardingSubmission[];
};

/** El link activo y los envíos de un cliente, el más nuevo primero. */
export async function getOnboardingStatusAction(subClientId: string): Promise<OnboardingStatus> {
  const vacio: OnboardingStatus = { link: null, submissions: [] };
  if (!idSchema.safeParse(subClientId).success) return vacio;

  const organizationId = await requireOrganizationId();
  if (!(await orgHasAddOn(organizationId, ADD_ON))) return vacio;

  const supabase = await createClient();
  const [links, envios] = await Promise.all([
    supabase
      .from("client_onboarding_links")
      .select(ONBOARDING_LINK_COLUMNS)
      .eq("organization_id", organizationId)
      .eq("sub_client_id", subClientId)
      .is("revoked_at", null)
      .maybeSingle(),
    supabase
      .from("client_onboarding_submissions")
      .select(ONBOARDING_SUBMISSION_COLUMNS)
      .eq("organization_id", organizationId)
      .eq("sub_client_id", subClientId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  for (const error of [links.error, envios.error]) {
    if (!error) continue;
    if (isMissingTableError(error.message)) return vacio;
    console.error("[onboarding] estado", error.message);
  }

  return {
    link: links.data ? rowToLink(links.data as LinkRow) : null,
    submissions: ((envios.data ?? []) as OnboardingSubmissionRow[]).map(
      rowToOnboardingSubmission
    ),
  };
}

/**
 * El link del cliente. Si ya tiene uno activo, devuelve ese: generar otro sin
 * querer dejaría sin efecto el que ya le mandaron.
 */
export async function createOnboardingLinkAction(
  subClientId: string
): Promise<MutationResult<OnboardingLink>> {
  return runMutation(async () => {
    if (!idSchema.safeParse(subClientId).success) throw new Error("Cliente inválido.");
    const organizationId = await requireOrganizationId();
    await requireAddOn(organizationId, ADD_ON);
    const profile = await getCurrentProfile();
    const supabase = await createClient();

    const { data: sub } = await supabase
      .from("client_sub_clients")
      .select("id, client_id")
      .eq("id", subClientId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!sub) throw new Error("Ese cliente ya no existe.");

    const { data: activo } = await supabase
      .from("client_onboarding_links")
      .select(ONBOARDING_LINK_COLUMNS)
      .eq("organization_id", organizationId)
      .eq("sub_client_id", subClientId)
      .is("revoked_at", null)
      .maybeSingle();
    if (activo) return rowToLink(activo as LinkRow);

    const { data, error } = await supabase
      .from("client_onboarding_links")
      .insert({
        organization_id: organizationId,
        client_id: sub.client_id as string,
        sub_client_id: subClientId,
        // 24 bytes al azar: 32 caracteres que no se pueden adivinar.
        token: randomBytes(24).toString("base64url"),
        created_by: profile?.id ?? null,
      })
      .select(ONBOARDING_LINK_COLUMNS)
      .single();

    if (error) {
      if (isMissingTableError(error.message)) {
        throw new Error("Falta aplicar la migración del onboarding en la base.");
      }
      throw new Error(error.message);
    }

    revalidatePath(paths.platform.clients.detail(sub.client_id as string));
    return rowToLink(data as LinkRow);
  });
}

/**
 * Apaga el link. Quien lo tenga ve «este link no está activo». Lo ya
 * respondido queda en la ficha y en el historial.
 */
export async function revokeOnboardingLinkAction(
  linkId: string
): Promise<MutationResult<void>> {
  return runMutation(async () => {
    if (!idSchema.safeParse(linkId).success) throw new Error("Link inválido.");
    const organizationId = await requireOrganizationId();
    await requireAddOn(organizationId, ADD_ON);
    const supabase = await createClient();

    const { error } = await supabase
      .from("client_onboarding_links")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", linkId)
      .eq("organization_id", organizationId)
      .is("revoked_at", null);
    if (error) throw new Error(error.message);
  });
}
