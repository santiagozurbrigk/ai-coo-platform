import { AppProviders } from "@/providers";
import { OnboardingGuard } from "@/components/platform/onboarding-guard";
import { WelcomeGate } from "@/components/platform/welcome-gate";
import { PlatformLayout } from "@/layouts";

export default function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <OnboardingGuard>
        <WelcomeGate>
          <PlatformLayout>{children}</PlatformLayout>
        </WelcomeGate>
      </OnboardingGuard>
    </AppProviders>
  );
}
