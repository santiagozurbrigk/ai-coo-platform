"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchOnboardingStatus } from "@/lib/onboarding/onboarding-status";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isOnboardingComplete } from "@/lib/onboarding/onboarding-storage";
import { resolveOnboardingPath } from "@/lib/onboarding/resolve-onboarding-path";
import { paths } from "@/routes";

const ONBOARDING_PATHS = [
  paths.auth.onboarding,
  paths.platform.holdingOnboarding,
] as const;

function isOnboardingRoute(pathname: string): boolean {
  return ONBOARDING_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!isSupabaseConfigured()) {
        const target = resolveOnboardingPath("founder");
        if (!isOnboardingComplete() && !isOnboardingRoute(pathname)) {
          router.replace(target);
        }
        if (!cancelled) setReady(true);
        return;
      }

      const status = await fetchOnboardingStatus();
      if (cancelled) return;

      if (!status.completed && !isOnboardingRoute(pathname)) {
        router.replace(status.onboardingPath);
      }

      if (
        status.completed &&
        pathname === paths.platform.holdingOnboarding &&
        status.accountType === "holding"
      ) {
        router.replace(paths.platform.holding);
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
