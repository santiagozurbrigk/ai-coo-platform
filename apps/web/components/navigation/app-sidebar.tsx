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
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-white/[0.06] bg-[rgba(10,8,20,0.70)] backdrop-blur-[40px] transition-[width] duration-200 ease-out",
        collapsed ? "w-[56px]" : "w-[220px]"
      )}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center border-b border-white/[0.06]",
          collapsed ? "justify-center px-2 py-4" : "justify-between px-3 py-4"
        )}
      >
        {!collapsed ? (
          <div className="relative min-w-0 flex-1">
            <div
              className="pointer-events-none absolute inset-x-2 top-2 h-12 rounded-full bg-[rgba(124,58,237,0.12)] blur-2xl"
              aria-hidden
            />
            <AppLogo display="sidebar" />
          </div>
        ) : null}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {!collapsed && hydrated ? (
        <>
          <div className="px-3 pb-2 pt-2">
            <WorkspaceSwitcher />
          </div>
          <div className="mx-3 border-t border-white/[0.06]" />
        </>
      ) : null}

      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2">
        <SidebarNavigation collapsed={collapsed} />
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
