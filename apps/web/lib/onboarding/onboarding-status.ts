import { getOnboardingStatusAction } from "@/app/onboarding/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  isOnboardingComplete as isLocalOnboardingComplete,
  markOnboardingComplete as markLocalOnboardingComplete,
} from "@/lib/onboarding/onboarding-storage";
import { resolveOnboardingPath } from "@/lib/onboarding/resolve-onboarding-path";
import type { OnboardingData } from "@/types/onboarding";

/** Estado de onboarding: DB si hay Supabase, si no localStorage. */
export async function fetchOnboardingStatus(): Promise<{
  completed: boolean;
  data: OnboardingData | null;
  accountType: "founder" | "holding" | null;
  onboardingPath: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      completed: isLocalOnboardingComplete(),
      data: null,
      accountType: null,
      onboardingPath: resolveOnboardingPath("founder"),
    };
  }

  const status = await getOnboardingStatusAction();
  if (status.completed) {
    markLocalOnboardingComplete();
  }
  return status;
}
