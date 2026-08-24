"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@ai-coo/ui";
import { ThreeColumnLayout } from "@/layouts/three-column-layout";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PlatformDocumentTitle } from "@/components/brand";
import { FloatingChat } from "@/components/agent";
import { HoldingViewingBanner } from "@/components/holding/holding-viewing-banner";
import { useHoldingSession } from "@/components/holding/holding-platform-provider";

export function PlatformShell({ children }: { children: ReactNode }) {
  const { isHolding, viewingBusiness } = useHoldingSession();
  // En la vista holding (sin un negocio activo) el sidebar no aplica
  const showSidebar = !isHolding || viewingBusiness;

  return (
    <TooltipProvider>
      <PlatformDocumentTitle />
      <ThreeColumnLayout
        sidebar={showSidebar ? <AppSidebar /> : undefined}
        overlay={
          <FloatingChat />
        }
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
