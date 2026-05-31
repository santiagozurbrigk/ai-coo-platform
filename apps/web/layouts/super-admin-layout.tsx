"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Topbar, TooltipProvider, cn } from "@ai-coo/ui";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { SuperAdminBreadcrumbs } from "@/components/navigation/super-admin-breadcrumbs";
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar";
import { ThreeColumnLayout } from "@/layouts/three-column-layout";
import { getPageMeta } from "@/lib/navigation/page-meta";

export function SuperAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);

  return (
    <TooltipProvider>
      <ThreeColumnLayout sidebar={<SuperAdminSidebar />}>
        <Topbar
          className={cn(
            "shell-topbar bg-transparent dark:bg-transparent dark:backdrop-blur-none"
          )}
          breadcrumbs={<SuperAdminBreadcrumbs className="hidden sm:flex" />}
          title={title}
          subtitle={subtitle}
          actions={<ThemeToggle />}
        />
        <div className="main-container-scroll flex min-h-0 flex-1">
          <main className="page-content min-w-0 flex-1">{children}</main>
        </div>
      </ThreeColumnLayout>
    </TooltipProvider>
  );
}
