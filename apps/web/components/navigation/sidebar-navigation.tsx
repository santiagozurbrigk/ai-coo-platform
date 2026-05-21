"use client";

import { usePathname } from "next/navigation";
import { platformNavigation } from "@/routes/navigation";
import { useSidebarExpanded } from "@/hooks/use-sidebar-expanded";
import { NavGroup } from "./nav-group";

export function SidebarNavigation() {
  const pathname = usePathname();
  const { isExpanded, toggle } = useSidebarExpanded(pathname, platformNavigation);

  return (
    <div className="space-y-0.5">
      {platformNavigation.map((item) => (
        <NavGroup
          key={item.href}
          item={item}
          pathname={pathname}
          isExpanded={isExpanded(item.href)}
          onToggle={() => toggle(item.href)}
        />
      ))}
    </div>
  );
}
