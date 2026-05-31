"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { AppLogo } from "@/components/brand";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarFooter } from "./sidebar-footer";

export function AppSidebar() {
  const { collapsed, toggle, hydrated } = useSidebarCollapsed();

  return (
    <aside
      className={cn("sidebar", collapsed && "collapsed")}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className="sidebar-logo">
        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <AppLogo display="sidebar" />
          </div>
        ) : (
          <span className="sr-only">OTC</span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="sidebar-collapse-btn"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {!collapsed && hydrated ? (
        <div className="mb-2 px-1">
          <WorkspaceSwitcher />
        </div>
      ) : null}

      <nav className="flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto">
        <SidebarNavigation collapsed={collapsed} />
      </nav>

      <div className="sidebar-divider" aria-hidden />

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
