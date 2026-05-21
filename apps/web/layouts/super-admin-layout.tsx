"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, Topbar } from "@ai-coo/ui";
import { superAdminNavigation } from "@/routes/navigation";
import { isPathActive } from "@/lib/navigation/active-path";
import { paths } from "@/routes";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { SuperAdminBreadcrumbs } from "@/components/navigation/super-admin-breadcrumbs";
import { es } from "@/lib/locale/es";

export function SuperAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-14 items-center px-4">
          <Link
            href={paths.superAdmin.organizations}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            {es.nav.superAdmin}
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {superAdminNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-2.5 py-2 text-sm transition-colors",
                isPathActive(item.href, pathname)
                  ? "bg-sidebar-accent font-medium text-sidebar-active"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Link
            href={paths.platform.dashboard}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Volver a la plataforma
          </Link>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar
          breadcrumbs={<SuperAdminBreadcrumbs className="hidden sm:flex" />}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
