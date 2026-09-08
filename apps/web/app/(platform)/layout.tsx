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
import { headers } from "next/headers";
import { permissionModuleForPath } from "@/lib/navigation/module-for-path";
import { getPermissionModuleLabel } from "@/constants/permission-modules";
import { SinAcceso } from "@/components/platform/sin-acceso";

export default async function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [holdingSession, permissions, onboarding, headerList] = await Promise.all([
    getHoldingSessionState(),
    getCurrentUserPermissions(),
    // El checklist viene en null para cuentas invitadas; los tours, no.
    getCurrentOnboardingContext(),
    headers(),
  ]);

  /**
   * ⭐ El permiso se aplica acá, en el servidor, no sólo escondiendo links.
   *
   * `x-pathname` lo pone el middleware. Antes de este chequeo, alguien sin
   * acceso a Finanzas que tipeaba `/finance` entraba igual: la pantalla se
   * renderizaba entera y las Server Actions le respondían. Ahora el módulo no
   * llega a renderizarse.
   *
   * El fundador pasa siempre —`getCurrentUserPermissions` le da todo en
   * `full`—, y las rutas sin módulo (onboarding, holding) devuelven `null`.
   */
  const pathname = headerList.get("x-pathname") ?? "";
  const moduleId = pathname ? permissionModuleForPath(pathname) : null;
  const sinAcceso =
    moduleId !== null &&
    !permissions.isFounder &&
    // Sin rol cargado no hay nada que hacer cumplir: ver `hasRoleConfigured`.
    permissions.hasRoleConfigured &&
    (permissions.modules[moduleId] ?? "none") === "none";

  return (
    <AppProviders>
      <PermissionsProvider value={permissions}>
        <HoldingPlatformProvider value={holdingSession}>
          <OnboardingProvider value={onboarding}>
            <WelcomeGate>
              <PlatformLayout>
                {sinAcceso && moduleId ? (
                  <SinAcceso moduleLabel={getPermissionModuleLabel(moduleId)} />
                ) : (
                  children
                )}
              </PlatformLayout>
            </WelcomeGate>
            <TourRunner />
          </OnboardingProvider>
        </HoldingPlatformProvider>
      </PermissionsProvider>
    </AppProviders>
  );
}
