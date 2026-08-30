"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@ai-coo/ui";
import { ThreeColumnLayout } from "@/layouts/three-column-layout";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PlatformDocumentTitle } from "@/components/brand";
import { HoldingViewingBanner } from "@/components/holding/holding-viewing-banner";
import { useHoldingSession } from "@/components/holding/holding-platform-provider";
import { NAV_STYLE } from "@/lib/navigation/nav-style";
import { PlatformNotchShell } from "@/components/layout/platform-notch-shell";

export function PlatformShell({ children }: { children: ReactNode }) {
  // Experimento de navegación: NEXT_PUBLIC_NAV_STYLE=notch reemplaza el
  // sidebar por la barra de islas. Sin la variable, todo sigue como estaba.
  if (NAV_STYLE === "notch") {
    return <PlatformNotchShell>{children}</PlatformNotchShell>;
  }

  return <PlatformSidebarShell>{children}</PlatformSidebarShell>;
}

function PlatformSidebarShell({ children }: { children: ReactNode }) {
  const { isHolding, viewingBusiness } = useHoldingSession();
  // En la vista holding (sin un negocio activo) el sidebar no aplica
  const showSidebar = !isHolding || viewingBusiness;

  return (
    <TooltipProvider>
      <PlatformDocumentTitle />
      <ThreeColumnLayout
        sidebar={showSidebar ? <AppSidebar /> : undefined}
      >
        <HoldingViewingBanner />
        <AppTopbar />
        <div className="main-container-scroll flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </ThreeColumnLayout>
    </TooltipProvider>
  );
}
