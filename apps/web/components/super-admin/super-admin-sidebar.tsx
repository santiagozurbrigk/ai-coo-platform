"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@ai-coo/ui";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { useSidebarExpanded } from "@/hooks/use-sidebar-expanded";
import { superAdminNavigation } from "@/routes/navigation";
import { paths } from "@/routes";
import { es } from "@/lib/locale/es";
import { NavGroup } from "@/components/navigation/nav-group";

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarCollapsed();
  const { isExpanded, toggle: toggleSection } = useSidebarExpanded(
    pathname,
    superAdminNavigation
  );

  return (
    <aside
      className={cn("sidebar h-full", collapsed && "collapsed")}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className="sidebar-logo">
        {!collapsed ? (
          <Link
            href={paths.superAdmin.organizations}
            className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <Shield className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="truncate">{es.nav.superAdmin}</span>
          </Link>
        ) : (
          <Link
            href={paths.superAdmin.organizations}
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-amber-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            aria-label={es.nav.superAdmin}
          >
            <Shield className="h-4 w-4" />
          </Link>
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

      <nav className="flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto">
        {superAdminNavigation.map((item) => (
          <NavGroup
            key={item.href}
            item={item}
            pathname={pathname}
            isExpanded={collapsed ? false : isExpanded(item.href)}
            onToggle={() => toggleSection(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="sidebar-divider" aria-hidden />

      <div className="space-y-0.5">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={paths.superAdmin.login}
                className="sidebar-item sidebar-item-collapsed"
              >
                <span className="text-xs font-medium">↩</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{es.nav.signOut}</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href={paths.superAdmin.login}
            className="sidebar-item text-muted-foreground"
          >
            <span className="sidebar-item-label text-xs">{es.nav.signOut}</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
