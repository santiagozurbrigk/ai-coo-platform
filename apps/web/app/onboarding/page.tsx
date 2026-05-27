"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { fetchOnboardingStatus } from "@/lib/onboarding/onboarding-status";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-storage";
import { paths } from "@/routes";

export default function OnboardingPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      if (isOnboardingComplete()) {
        router.replace(paths.platform.dashboard);
      }
      return;
    }

    void fetchOnboardingStatus().then((status) => {
      if (status.completed) {
        router.replace(paths.platform.dashboard);
      } else {
        setAllowed(true);
      }
    });
  }, [router]);

  if (!allowed) {
    return (
      <p className="text-center text-sm text-muted-foreground py-12">
        Cargando…
      </p>
    );
  }

  return <OnboardingWizard />;
}
