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
      <ThreeColumnLayout
        sidebar={<AppSidebar />}
        contextPanel={<ContextPanel />}
      >
        <div className="flex h-screen min-h-0 flex-col overflow-hidden">
          <AppTopbar />
          {children}
        </div>
      </ThreeColumnLayout>
    </TooltipProvider>
  );
}
