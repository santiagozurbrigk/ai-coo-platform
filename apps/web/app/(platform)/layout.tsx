import { AppProviders } from "@/providers";
import { WelcomeGate } from "@/components/platform/welcome-gate";
import { HoldingPlatformProvider } from "@/components/holding/holding-platform-provider";
import { getHoldingSessionState } from "@/lib/holding/session";
import { PlatformLayout } from "@/layouts";
import { getCurrentUserPermissions } from "@/lib/auth/get-current-permissions";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { OnboardingProvider } from "@/providers/onboarding-provider";
import { getCurrentOnboardingState } from "@/lib/onboarding/current";

export default async function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [holdingSession, permissions, onboarding] = await Promise.all([
    getHoldingSessionState(),
    getCurrentUserPermissions(),
    // Devuelve null para cuentas invitadas, así que no se resuelve nada de más.
    getCurrentOnboardingState(),
  ]);

  return (
    <AppProviders>
      <PermissionsProvider value={permissions}>
        <HoldingPlatformProvider value={holdingSession}>
          <OnboardingProvider value={onboarding}>
            <WelcomeGate>
              <PlatformLayout>{children}</PlatformLayout>
            </WelcomeGate>
          </OnboardingProvider>
        </HoldingPlatformProvider>
      </PermissionsProvider>
    </AppProviders>
  );
}
