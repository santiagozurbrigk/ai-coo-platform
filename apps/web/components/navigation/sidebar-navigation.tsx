"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { paths } from "@/routes";
import { buildPlatformSidebarNav } from "@/lib/navigation/sidebar-modules";
import type { SidebarDirectModule } from "@/lib/navigation/sidebar-nav-config";
import { useHoldingSession } from "@/components/holding/holding-platform-provider";
import { usePlatformData } from "@/providers";
import { useEnabledAddOns } from "@/providers/permissions-provider";
import { SidebarItem } from "./sidebar-item";
import { SidebarTwoLevelNavigation } from "./sidebar-two-level-navigation";

export function SidebarNavigation({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { isHolding } = useHoldingSession();
  const { clients } = usePlatformData();
  const enabledAddOns = useEnabledAddOns();

  const config = buildPlatformSidebarNav(enabledAddOns);

  const mapDirectModules = useCallback(
    (modules: SidebarDirectModule[]) =>
      modules.map((entry) =>
        entry.href === paths.platform.clients.root
          ? { ...entry, badge: clients.length }
          : entry
      ),
    [clients.length]
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
        config={config}
        collapsed={collapsed}
        mapDirectModules={mapDirectModules}
      />
    </>
  );
}
