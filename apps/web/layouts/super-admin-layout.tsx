"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Topbar } from "@ai-coo/ui";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { superAdminNavigation } from "@/routes/navigation";
import { useSidebarExpanded } from "@/hooks/use-sidebar-expanded";
import { NavGroup } from "@/components/navigation/nav-group";
import { paths } from "@/routes";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { SuperAdminBreadcrumbs } from "@/components/navigation/super-admin-breadcrumbs";
import { es } from "@/lib/locale/es";

export function SuperAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);
  const { isExpanded, toggle } = useSidebarExpanded(
    pathname,
    superAdminNavigation
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-14 items-center px-4">
          <Link
            href={paths.superAdmin.dashboard}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            {es.nav.superAdmin}
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {superAdminNavigation.map((item) => (
            <NavGroup
              key={item.href}
              item={item}
              pathname={pathname}
              isExpanded={isExpanded(item.href)}
              onToggle={() => toggle(item.href)}
            />
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link
            href={paths.superAdmin.login}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {es.nav.signOut}
          </Link>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar
          breadcrumbs={<SuperAdminBreadcrumbs className="hidden sm:flex" />}
          title={title}
          subtitle={subtitle}
          actions={<ThemeToggle />}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
