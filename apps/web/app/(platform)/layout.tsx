import { AppProviders } from "@/providers";
import { WelcomeGate } from "@/components/platform/welcome-gate";
import { HoldingPlatformProvider } from "@/components/holding/holding-platform-provider";
import { getHoldingSessionState } from "@/lib/holding/session";
import { PlatformLayout } from "@/layouts";
import { getCurrentUserPermissions } from "@/lib/auth/get-current-permissions";
import { PermissionsProvider } from "@/providers/permissions-provider";

export default async function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [holdingSession, permissions] = await Promise.all([
    getHoldingSessionState(),
    getCurrentUserPermissions(),
  ]);

  return (
    <AppProviders>
      <PermissionsProvider value={permissions}>
        <HoldingPlatformProvider value={holdingSession}>
          <WelcomeGate>
            <PlatformLayout>{children}</PlatformLayout>
          </WelcomeGate>
        </HoldingPlatformProvider>
      </PermissionsProvider>
    </AppProviders>
  );
}
