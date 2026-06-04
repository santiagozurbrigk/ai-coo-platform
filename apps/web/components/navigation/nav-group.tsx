"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@ai-coo/ui";
import type { NavItem } from "@/routes/navigation";
import { isNavItemActive, isPathActive } from "@/lib/navigation/active-path";
import { NavIcon } from "./nav-icons";

type NavGroupProps = {
  item: NavItem;
  pathname: string;
  isExpanded: boolean;
  onToggle: () => void;
  collapsed?: boolean;
};

function NavTooltip({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed?: boolean;
  children: ReactNode;
}) {
  if (!collapsed) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function NavGroup({
  item,
  pathname,
  isExpanded,
  onToggle,
  collapsed,
}: NavGroupProps) {
  const hasChildren = Boolean(item.children?.length);
  const sectionActive = isNavItemActive(item.href, pathname, item.children);
  const leafActive = isPathActive(item.href, pathname);

  if (!hasChildren) {
    const link = (
      <Link
        href={item.href}
        className={cn(
          "sidebar-item",
          collapsed && "sidebar-item-collapsed",
          leafActive && "active"
        )}
      >
        {item.icon && (
          <NavIcon name={item.icon} className="sidebar-item-icon" />
        )}
        {!collapsed && (
          <span className="sidebar-item-label">{item.label}</span>
        )}
        {!collapsed && item.badge != null && item.badge > 0 && (
          <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-2xs font-medium text-primary-foreground tabular-nums">
            {item.badge}
          </span>
        )}
      </Link>
    );

    return (
      <NavTooltip label={item.label} collapsed={collapsed}>
        {collapsed ? <div className="sidebar-item-slot">{link}</div> : link}
      </NavTooltip>
    );
  }

  if (collapsed) {
    return (
      <NavTooltip label={item.label} collapsed>
        <div className="sidebar-item-slot">
          <Link
            href={item.href}
            className={cn(
              "sidebar-item sidebar-item-collapsed",
              sectionActive && "active"
            )}
          >
            {item.icon && (
              <NavIcon name={item.icon} className="sidebar-item-icon" />
            )}
          </Link>
        </div>
      </NavTooltip>
    );
  }

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "sidebar-item",
          sectionActive && "active",
          isExpanded && "open"
        )}
      >
        <Link
          href={item.href}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          {item.icon && (
            <NavIcon name={item.icon} className="sidebar-item-icon" />
          )}
          <span className="sidebar-item-label">{item.label}</span>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${item.label}`}
          className="mr-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <ChevronRight className="sidebar-item-arrow" />
        </button>
      </div>

      {isExpanded && (
        <div className="sidebar-subitems space-y-0.5">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "sidebar-subitem",
                isPathActive(child.href, pathname) && "active"
              )}
            >
              <span className="truncate">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
