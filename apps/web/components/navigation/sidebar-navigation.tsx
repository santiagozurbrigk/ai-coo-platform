"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { countPendingFathomCallsAction } from "@/app/fathom/actions";
import { platformNavigation } from "@/routes/navigation";
import { paths } from "@/routes";
import { useSidebarExpanded } from "@/hooks/use-sidebar-expanded";
import { NavGroup } from "./nav-group";

export function SidebarNavigation() {
  const pathname = usePathname();
  const [pendingCalls, setPendingCalls] = useState(0);
  const baseNav = useSidebarExpanded(pathname, platformNavigation);

  useEffect(() => {
    countPendingFathomCallsAction()
      .then(setPendingCalls)
      .catch(() => setPendingCalls(0));
  }, [pathname]);

  const navigation = useMemo(
    () =>
      platformNavigation.map((item) =>
        item.href === paths.platform.clients.root
          ? { ...item, badge: pendingCalls }
          : item
      ),
    [pendingCalls]
  );

  return (
    <div className="space-y-0.5">
      {navigation.map((item) => (
        <NavGroup
          key={item.href}
          item={item}
          pathname={pathname}
          isExpanded={baseNav.isExpanded(item.href)}
          onToggle={() => baseNav.toggle(item.href)}
        />
      ))}
    </div>
  );
}
