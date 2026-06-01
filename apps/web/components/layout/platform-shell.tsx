"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@ai-coo/ui";
import { ThreeColumnLayout } from "@/layouts/three-column-layout";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { ContextPanelDrawer } from "@/components/layout/context-panel-drawer";

export function PlatformShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ThreeColumnLayout sidebar={<AppSidebar />}>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <AppTopbar />
          <div className="main-container-scroll flex min-h-0 flex-1">
            <div className="flex min-h-full min-w-0 flex-1">{children}</div>
          </div>
        </div>
        <ContextPanelDrawer />
      </ThreeColumnLayout>
    </TooltipProvider>
  );
}
