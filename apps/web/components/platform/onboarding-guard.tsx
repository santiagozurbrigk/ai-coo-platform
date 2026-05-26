"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-storage";
import { paths } from "@/routes";

/** Redirige al wizard si el onboarding no está completo (Fase 0). */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isOnboardingComplete() && pathname !== paths.auth.onboarding) {
      router.replace(paths.auth.onboarding);
    }
  }, [pathname, router]);

  return <>{children}</>;
}
