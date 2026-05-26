"use client";

import { SidebarShell } from "@ai-coo/ui";
import { AppLogo } from "@/components/brand";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarFooter } from "./sidebar-footer";

export function AppSidebar() {
  return (
    <SidebarShell
      logo={<AppLogo display="sidebar" />}
      workspace={<WorkspaceSwitcher />}
      navigation={<SidebarNavigation />}
      footer={<SidebarFooter />}
    />
  );
}
