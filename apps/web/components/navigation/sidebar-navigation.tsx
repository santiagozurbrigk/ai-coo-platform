"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { countPendingFathomCallsAction } from "@/app/fathom/actions";
import { paths } from "@/routes";
import { platformSidebarNav } from "@/lib/navigation/sidebar-modules";
import type { SidebarDirectModule } from "@/lib/navigation/sidebar-nav-config";
import { useHoldingSession } from "@/components/holding/holding-platform-provider";
import { SidebarItem } from "./sidebar-item";
import { SidebarTwoLevelNavigation } from "./sidebar-two-level-navigation";

export function SidebarNavigation({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { isHolding } = useHoldingSession();
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

  const holdingActive =
    pathname === paths.platform.holding ||
    pathname.startsWith(`${paths.platform.holding}/`);

  return (
    <>
      {isHolding && (
        <div className="px-2 pb-1 pt-2">
          <SidebarItem
            icon="layers"
            label="Mi Holding"
            href={paths.platform.holding}
            isActive={holdingActive}
            collapsed={collapsed}
          />
        </div>
      )}
      <SidebarTwoLevelNavigation
        config={platformSidebarNav}
        collapsed={collapsed}
        mapDirectModules={mapDirectModules}
      />
    </>
  );
}
