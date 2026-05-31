"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@ai-coo/ui";
import { ThreeColumnLayout } from "@/layouts/three-column-layout";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { ContextPanel } from "@/components/layout/context-panel";

export function PlatformShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ThreeColumnLayout sidebar={<AppSidebar />}>
        <AppTopbar />
        <div className="main-container-scroll flex min-h-0 flex-1">
          <div className="flex min-h-full min-w-0 flex-1">
            {children}
            <aside
              className="hidden h-full w-[300px] shrink-0 border-l border-border xl:flex"
              data-slot="context-panel"
            >
              <ContextPanel />
            </aside>
          </div>
        </div>
      </ThreeColumnLayout>
    </TooltipProvider>
  );
}
