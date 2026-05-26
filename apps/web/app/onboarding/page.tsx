"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-storage";
import { paths } from "@/routes";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    if (isOnboardingComplete()) {
      router.replace(paths.platform.dashboard);
    }
  }, [router]);

  return <OnboardingWizard />;
}
