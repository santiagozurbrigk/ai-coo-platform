import { paths } from "@/routes";
import type { HoldingBillingModel } from "@/lib/holding/billing";

export function resolveOnboardingPath(
  accountType: string | null | undefined
): string {
  return accountType === "holding"
    ? paths.platform.holdingOnboarding
    : paths.auth.onboarding;
}

export type { HoldingBillingModel };
