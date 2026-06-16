import { AppProviders } from "@/providers";
import { OnboardingGuard } from "@/components/platform/onboarding-guard";
import { WelcomeGate } from "@/components/platform/welcome-gate";
import { HoldingPlatformProvider } from "@/components/holding/holding-platform-provider";
import { getHoldingSessionState } from "@/lib/holding/session";
import { PlatformLayout } from "@/layouts";

export default async function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const holdingSession = await getHoldingSessionState();

  return (
    <AppProviders>
      <HoldingPlatformProvider value={holdingSession}>
        <OnboardingGuard>
          <WelcomeGate>
            <PlatformLayout>{children}</PlatformLayout>
          </WelcomeGate>
        </OnboardingGuard>
      </HoldingPlatformProvider>
    </AppProviders>
  );
}
