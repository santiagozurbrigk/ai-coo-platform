"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@ai-coo/ui";
import { MainContainerPanel } from "@/components/layout/main-container-panel";
import { PlatformNotchNav } from "@/components/navigation/notch-nav/platform-notch-nav";
import { PlatformDocumentTitle } from "@/components/brand";
import { HoldingViewingBanner } from "@/components/holding/holding-viewing-banner";
import { useHoldingSession } from "@/components/holding/holding-platform-provider";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { isFullBleedPath } from "@/lib/navigation/full-bleed";

/**
 * Shell de plataforma: barra superior de islas (notch nav).
 *
 * Reemplazó al sidebar el 2026-08-30 tras validarse el experimento. La
 * navegación se deriva de `lib/navigation/sidebar-modules.ts`, que sigue siendo
 * la única fuente de verdad de módulos, permisos y add-ons.
 */
export function PlatformShell({ children }: { children: ReactNode }) {
  const { isHolding, viewingBusiness } = useHoldingSession();
  const pathname = usePathname();
  // Vista holding sin negocio activo: sin items de navegación (como el
  // sidebar, que directamente no se muestra en ese estado)
  const showItems = !isHolding || Boolean(viewingBusiness);
  const fullBleed = isFullBleedPath(pathname);
  const { title, subtitle } = getPageMeta(pathname);

  return (
    <TooltipProvider>
      <PlatformDocumentTitle />
      <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-background">
        <PlatformNotchNav showItems={showItems} />
        <div className="flex min-h-0 flex-1 flex-col px-0 pb-0 pt-3 md:px-[var(--space-shell)] md:pb-[var(--space-shell)]">
          <MainContainerPanel className="min-h-0 flex-1">
            <HoldingViewingBanner />
            {/* El topbar clásico ponía el título de página; acá lo pone esta franja */}
            {!fullBleed && (
              <div className="shrink-0 border-b border-border/60 px-4 pb-3 pt-4 md:px-6">
                <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}
            <div className="main-container-scroll flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </div>
          </MainContainerPanel>
        </div>
      </div>
    </TooltipProvider>
  );
}
