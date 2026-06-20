"use server";

import {
  getCurrentProfileAccountType,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { isSuperAdminEmail } from "@/lib/auth/require-super-admin";
import { resolveOnboardingPath } from "@/lib/onboarding/resolve-onboarding-path";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { OnboardingData } from "@/types/onboarding";

export type OnboardingStatus = {
  completed: boolean;
  data: OnboardingData | null;
  accountType: "founder" | "holding" | null;
  onboardingPath: string;
};

type OnboardingRow = {
  organization_id: string;
  data: OnboardingData;
  completed_at: string;
};

type OnboardingDbClient =
  | Awaited<ReturnType<typeof createClient>>
  | ReturnType<typeof createAdminClient>;

async function readOrganizationOnboardingContext(
  supabase: OnboardingDbClient,
  organizationId: string
): Promise<{
  accountType: "founder" | "holding";
  skipOnboarding: boolean;
}> {
  const { data } = await supabase
    .from("organizations")
    .select("account_type, skip_onboarding")
    .eq("id", organizationId)
    .maybeSingle();

  return {
    accountType: data?.account_type === "holding" ? "holding" : "founder",
    skipOnboarding: Boolean(data?.skip_onboarding),
  };
}

export async function getOnboardingStatusAction(): Promise<OnboardingStatus> {
  const defaultFounderPath = resolveOnboardingPath("founder");

  if (!isSupabaseConfigured()) {
    return {
      completed: false,
      data: null,
      accountType: null,
      onboardingPath: defaultFounderPath,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email && (await isSuperAdminEmail(user.email))) {
      return {
        completed: true,
        data: null,
        accountType: null,
        onboardingPath: defaultFounderPath,
      };
    }

    const organizationId = await requireOrganizationId();
    const profileAccountType = await getCurrentProfileAccountType();
    const isHoldingUser = profileAccountType === "holding";
    const dbClient: OnboardingDbClient = isHoldingUser
      ? createAdminClient()
      : supabase;

    const { accountType, skipOnboarding } =
      await readOrganizationOnboardingContext(dbClient, organizationId);
    const onboardingPath = resolveOnboardingPath(accountType);

    if (skipOnboarding) {
      return {
        completed: true,
        data: null,
        accountType,
        onboardingPath,
      };
    }

    const { data, error } = await dbClient
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
      return {
        completed: false,
        data: null,
        accountType,
        onboardingPath,
      };
    }

    if (!data?.completed_at) {
      return {
        completed: false,
        data: null,
        accountType,
        onboardingPath,
      };
    }

    return {
      completed: true,
      data: (data as OnboardingRow).data,
      accountType,
      onboardingPath,
    };
  } catch {
    return {
      completed: false,
      data: null,
      accountType: null,
      onboardingPath: defaultFounderPath,
    };
  }
}

export async function completeOnboardingAction(
  payload: OnboardingData
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const organizationId = await requireOrganizationId();
  const profileAccountType = await getCurrentProfileAccountType();
  const isHoldingUser = profileAccountType === "holding";
  const dbClient: OnboardingDbClient = isHoldingUser
    ? createAdminClient()
    : await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await dbClient
    .from("onboarding_responses")
    .select("id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (existing) {
    const { error } = await dbClient
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
    const { error } = await dbClient.from("onboarding_responses").insert({
      organization_id: organizationId,
      data: payload,
      completed_at: now,
    });

    if (error) {
      throw new Error(mapOnboardingError(error.message));
    }
  }

  if (payload.businessName.trim()) {
    await dbClient
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
