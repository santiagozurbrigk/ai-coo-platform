"use client";

import Link from "next/link";
import { SidebarShell } from "@ai-coo/ui";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarFooter } from "./sidebar-footer";

export function AppSidebar() {
  return (
    <SidebarShell
      logo={
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary text-xs font-bold">
            AI
          </span>
          <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-foreground">
            AI COO
          </span>
        </Link>
      }
      workspace={<WorkspaceSwitcher />}
      navigation={<SidebarNavigation />}
      footer={<SidebarFooter />}
    />
  );
}
