"use client";

import { cn } from "@ai-coo/ui";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { SidebarProfileArea } from "./sidebar-profile-area";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarFooter } from "./sidebar-footer";

export function AppSidebar() {
  const { collapsed, toggle, hydrated } = useSidebarCollapsed();

  return (
    <aside
      className={cn("sidebar h-full", collapsed && "collapsed")}
      data-collapsed={collapsed ? "true" : "false"}
    >
      {hydrated ? (
        <SidebarProfileArea collapsed={collapsed} onToggleCollapsed={toggle} />
      ) : (
        <div className="mb-2 h-[52px] shrink-0" aria-hidden />
      )}

      <nav className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <SidebarNavigation collapsed={collapsed} />
      </nav>

      <div className="sidebar-divider" aria-hidden />

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
