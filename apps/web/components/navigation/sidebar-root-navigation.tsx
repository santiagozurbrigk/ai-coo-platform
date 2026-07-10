"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { SidebarDirectModule, SidebarNavConfig } from "@/lib/navigation/sidebar-nav-config";
import { isSidebarDirectActive } from "@/lib/navigation/sidebar-nav-config";
import type { PermissionModuleId } from "@/constants/permission-modules";
import {
  canSeeNavItem,
  usePermissions,
} from "@/providers/permissions-provider";
import { SidebarItem, SidebarItemWithChildren } from "./sidebar-item";

export function SidebarRootNavigation({
  config,
  onEnterModule,
  collapsed,
  mapDirectModules,
  onLinkClick,
}: {
  config: SidebarNavConfig;
  onEnterModule: (parent: string) => void;
  collapsed?: boolean;
  mapDirectModules?: (modules: SidebarDirectModule[]) => SidebarDirectModule[];
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const activeParent = config.getParentFromPath(pathname);
  const { isFounder, modules } = usePermissions();
  const checkAccess = (moduleId: PermissionModuleId) =>
    isFounder || (modules[moduleId] ?? "none") !== "none";

  const linkModules = useMemo(() => {
    const modules = config.rootItems
      .filter((item): item is { type: "link"; module: SidebarDirectModule } =>
        item.type === "link"
      )
      .map((item) => item.module);
    return mapDirectModules ? mapDirectModules(modules) : modules;
  }, [config.rootItems, mapDirectModules]);

  const linkModuleByHref = useMemo(
    () => new Map(linkModules.map((link) => [link.href, link])),
    [linkModules]
  );

  return (
    <>
      {config.rootItems.map((item, index) => {
        if (item.type === "divider") {
          return <div key={`divider-${index}`} className="sidebar-divider my-1" aria-hidden />;
        }

        if (item.type === "link") {
          const direct = linkModuleByHref.get(item.module.href) ?? item.module;
          if (!canSeeNavItem(direct.permissionId, checkAccess, isFounder)) {
            return null;
          }

          return (
            <SidebarItem
              key={direct.href}
              icon={direct.icon}
              label={direct.label}
              href={direct.href}
              isActive={isSidebarDirectActive(direct.href, pathname)}
              collapsed={collapsed}
              badge={direct.badge}
              disabled={direct.disabled}
              comingSoonLabel={direct.comingSoonLabel}
              onLinkClick={onLinkClick}
            />
          );
        }

        const parent = config.modulesWithChildren[item.key];
        if (!parent) return null;

        const visibleChildren = parent.children.filter((child) =>
          canSeeNavItem(child.permissionId, checkAccess, isFounder)
        );
        if (visibleChildren.length === 0) return null;

        return (
          <SidebarItemWithChildren
            key={item.key}
            icon={parent.icon}
            label={parent.label}
            isActive={activeParent === item.key}
            collapsed={collapsed}
            onClick={() => onEnterModule(item.key)}
          />
        );
      })}
    </>
  );
}
