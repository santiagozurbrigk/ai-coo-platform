import { AppProviders } from "@/providers";
import { OnboardingGuard } from "@/components/platform/onboarding-guard";
import { WelcomeGate } from "@/components/platform/welcome-gate";
import { HoldingPlatformProvider } from "@/components/holding/holding-platform-provider";
import { getHoldingSessionState } from "@/lib/holding/session";
import { PlatformLayout } from "@/layouts";
import { getCurrentUserPermissions } from "@/lib/auth/get-current-permissions";
import { getAiCredentialBannerState } from "@/lib/ai/get-credential-banner-state";
import { PermissionsProvider } from "@/providers/permissions-provider";

export default async function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [holdingSession, permissions, aiCredentialBanner] = await Promise.all([
    getHoldingSessionState(),
    getCurrentUserPermissions(),
    getAiCredentialBannerState(),
  ]);

  return (
    <AppProviders>
      <PermissionsProvider value={permissions}>
        <HoldingPlatformProvider value={holdingSession}>
          <OnboardingGuard>
            <WelcomeGate>
              <PlatformLayout aiCredentialBanner={aiCredentialBanner}>
                {children}
              </PlatformLayout>
            </WelcomeGate>
          </OnboardingGuard>
        </HoldingPlatformProvider>
      </PermissionsProvider>
    </AppProviders>
  );
}
