"use server";

import {
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { isSuperAdminEmail } from "@/lib/auth/require-super-admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { OnboardingData } from "@/types/onboarding";

export type OnboardingStatus = {
  completed: boolean;
  data: OnboardingData | null;
};

type OnboardingRow = {
  organization_id: string;
  data: OnboardingData;
  completed_at: string;
};

export async function getOnboardingStatusAction(): Promise<OnboardingStatus> {
  if (!isSupabaseConfigured()) {
    return { completed: false, data: null };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email && (await isSuperAdminEmail(user.email))) {
      return { completed: true, data: null };
    }

    const organizationId = await requireOrganizationId();

    const { data, error } = await supabase
      .from("onboarding_responses")
      .select("data, completed_at")
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error.message)) {
        console.error(
          "[onboarding] Ejecuta supabase/migrations/20260521400000_onboarding_responses.sql"
        );
      }
      return { completed: false, data: null };
    }

    if (!data?.completed_at) {
      return { completed: false, data: null };
    }

    return {
      completed: true,
      data: (data as OnboardingRow).data,
    };
  } catch {
    return { completed: false, data: null };
  }
}

export async function completeOnboardingAction(
  payload: OnboardingData
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("onboarding_responses")
    .select("id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("onboarding_responses")
      .update({
        data: payload,
        completed_at: now,
        updated_at: now,
      })
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error(mapOnboardingError(error.message));
    }
  } else {
    const { error } = await supabase.from("onboarding_responses").insert({
      organization_id: organizationId,
      data: payload,
      completed_at: now,
    });

    if (error) {
      throw new Error(mapOnboardingError(error.message));
    }
  }

  if (payload.businessName.trim()) {
    await supabase
      .from("organizations")
      .update({ name: payload.businessName.trim() })
      .eq("id", organizationId);
  }
}

function mapOnboardingError(msg: string): string {
  if (isMissingTableError(msg)) {
    return "Falta la tabla onboarding_responses. Ejecuta la migración en Supabase SQL Editor.";
  }
  return msg;
}
