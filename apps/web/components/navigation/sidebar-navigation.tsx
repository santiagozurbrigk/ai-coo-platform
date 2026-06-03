"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { countPendingFathomCallsAction } from "@/app/fathom/actions";
import { paths } from "@/routes";
import { platformSidebarNav } from "@/lib/navigation/sidebar-modules";
import type { SidebarDirectModule } from "@/lib/navigation/sidebar-nav-config";
import { SidebarTwoLevelNavigation } from "./sidebar-two-level-navigation";

export function SidebarNavigation({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const [pendingCalls, setPendingCalls] = useState(0);

  useEffect(() => {
    countPendingFathomCallsAction()
      .then(setPendingCalls)
      .catch(() => setPendingCalls(0));
  }, [pathname]);

  const mapDirectModules = useCallback(
    (modules: SidebarDirectModule[]) =>
      modules.map((entry) =>
        entry.href === paths.platform.clients.root
          ? { ...entry, badge: pendingCalls }
          : entry
      ),
    [pendingCalls]
  );

  return (
    <SidebarTwoLevelNavigation
      config={platformSidebarNav}
      collapsed={collapsed}
      mapDirectModules={mapDirectModules}
    />
  );
}
