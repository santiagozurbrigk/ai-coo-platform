"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@ai-coo/ui";
import { ThreeColumnLayout } from "@/layouts/three-column-layout";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PlatformDocumentTitle } from "@/components/brand";
import { FloatingChat } from "@/components/agent";
import { HoldingViewingBanner } from "@/components/holding/holding-viewing-banner";
import { AiCredentialBanner } from "@/components/platform/ai-credential-banner";
import type { AiCredentialBannerState } from "@/lib/ai/credential-types";

export function PlatformShell({
  children,
  aiCredentialBanner,
}: {
  children: ReactNode;
  aiCredentialBanner?: AiCredentialBannerState | null;
}) {
  return (
    <TooltipProvider>
      <PlatformDocumentTitle />
      <ThreeColumnLayout
        sidebar={<AppSidebar />}
        overlay={
          <FloatingChat />
        }
      >
        <HoldingViewingBanner />
        <AiCredentialBanner state={aiCredentialBanner ?? null} />
        <AppTopbar />
        <div className="main-container-scroll flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </ThreeColumnLayout>
    </TooltipProvider>
  );
}
