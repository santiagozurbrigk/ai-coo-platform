"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchOnboardingStatus } from "@/lib/onboarding/onboarding-status";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-storage";
import { paths } from "@/routes";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!isSupabaseConfigured()) {
        if (
          !isOnboardingComplete() &&
          pathname !== paths.auth.onboarding
        ) {
          router.replace(paths.auth.onboarding);
        }
        if (!cancelled) setReady(true);
        return;
      }

      const status = await fetchOnboardingStatus();
      if (cancelled) return;

      if (!status.completed && pathname !== paths.auth.onboarding) {
        router.replace(paths.auth.onboarding);
      }
      setReady(true);
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready && isSupabaseConfigured()) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
