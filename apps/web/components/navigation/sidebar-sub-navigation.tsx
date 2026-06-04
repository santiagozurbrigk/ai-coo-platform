"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@ai-coo/ui";
import type { SidebarNavConfig } from "@/lib/navigation/sidebar-nav-config";
import { isSidebarChildActive } from "@/lib/navigation/sidebar-nav-config";
import { SidebarItem } from "./sidebar-item";

export function SidebarSubNavigation({
  config,
  moduleKey,
  onBack,
  collapsed,
  onLinkClick,
}: {
  config: SidebarNavConfig;
  moduleKey: string;
  onBack: () => void;
  collapsed?: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const parentModule = config.modulesWithChildren[moduleKey];

  if (!parentModule) return null;

  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className={cn(
        "sidebar-item",
        collapsed && "sidebar-item-collapsed mb-2",
        !collapsed &&
          "mb-2 w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs text-black/40 transition-colors hover:bg-black/[0.04] hover:text-black/70 dark:text-white/40 dark:hover:bg-white/[0.04] dark:hover:text-white/70"
      )}
      aria-label="Volver al menú principal"
    >
      <ChevronLeft className={cn("shrink-0", collapsed ? "h-4 w-4" : "h-3.5 w-3.5")} />
      {!collapsed ? <span>Volver</span> : null}
    </button>
  );

  return (
    <>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="sidebar-item-slot mb-2">{backButton}</div>
          </TooltipTrigger>
          <TooltipContent side="right">Volver</TooltipContent>
        </Tooltip>
      ) : (
        backButton
      )}

      {!collapsed ? (
        <p className="sidebar-section-label mb-1 px-3">{parentModule.label}</p>
      ) : null}

      {parentModule.children.map((child) => (
        <SidebarItem
          key={child.href}
          icon={child.icon}
          label={child.label}
          href={child.href}
          isActive={isSidebarChildActive(child.href, pathname)}
          collapsed={collapsed}
          onLinkClick={onLinkClick}
        />
      ))}
    </>
  );
}
