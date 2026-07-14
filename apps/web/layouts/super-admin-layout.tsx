"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Topbar, TooltipProvider } from "@ai-coo/ui";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { SuperAdminBreadcrumbs } from "@/components/navigation/super-admin-breadcrumbs";
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar";
import { ToastViewport } from "@/components/shared/toast-viewport";
import { ThreeColumnLayout } from "@/layouts/three-column-layout";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { ToastProvider } from "@/providers/toast-provider";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { emptyPermissions } from "@/constants/permission-modules";

const SUPER_ADMIN_PERMISSIONS = {
  role: "operator" as const,
  isFounder: true,
  modules: emptyPermissions(),
};

export function SuperAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);

  return (
    <ToastProvider>
      <PermissionsProvider value={SUPER_ADMIN_PERMISSIONS}>
      <TooltipProvider>
        <ThreeColumnLayout sidebar={<SuperAdminSidebar />}>
          <Topbar
            breadcrumbs={<SuperAdminBreadcrumbs className="hidden sm:flex" />}
            title={title}
            subtitle={subtitle}
            actions={<ThemeToggle className="topbar-icon h-8 w-8 rounded-lg" />}
          />
          <div className="main-container-scroll flex min-h-0 flex-1 flex-col">
            <main className="page-content min-w-0 flex-1">{children}</main>
          </div>
        </ThreeColumnLayout>
      </TooltipProvider>
      </PermissionsProvider>
      <ToastViewport />
    </ToastProvider>
  );
}
