import { AppProviders } from "@/providers";
import { WelcomeGate } from "@/components/platform/welcome-gate";
import { HoldingPlatformProvider } from "@/components/holding/holding-platform-provider";
import { getHoldingSessionState } from "@/lib/holding/session";
import { PlatformLayout } from "@/layouts";
import { getCurrentUserPermissions } from "@/lib/auth/get-current-permissions";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { OnboardingProvider } from "@/providers/onboarding-provider";
import { TourRunner } from "@/components/onboarding/tour-runner";
import { getCurrentOnboardingContext } from "@/lib/onboarding/current";

export default async function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [holdingSession, permissions, onboarding] = await Promise.all([
    getHoldingSessionState(),
    getCurrentUserPermissions(),
    // El checklist viene en null para cuentas invitadas; los tours, no.
    getCurrentOnboardingContext(),
  ]);

  return (
    <AppProviders>
      <PermissionsProvider value={permissions}>
        <HoldingPlatformProvider value={holdingSession}>
          <OnboardingProvider value={onboarding}>
            <WelcomeGate>
              <PlatformLayout>{children}</PlatformLayout>
            </WelcomeGate>
            <TourRunner />
          </OnboardingProvider>
        </HoldingPlatformProvider>
      </PermissionsProvider>
    </AppProviders>
  );
}
