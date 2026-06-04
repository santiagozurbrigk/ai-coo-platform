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
import { NavIcon } from "./nav-icons";

function SidebarTooltip({
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

export function SidebarItem({
  icon,
  label,
  href,
  isActive,
  collapsed,
  badge,
  onLinkClick,
}: {
  icon?: string;
  label: string;
  href: string;
  isActive: boolean;
  collapsed?: boolean;
  badge?: number;
  onLinkClick?: () => void;
}) {
  const link = (
    <Link
      href={href}
      onClick={onLinkClick}
      className={cn(
        "sidebar-item",
        collapsed && "sidebar-item-collapsed",
        isActive && "active"
      )}
    >
      {icon ? <NavIcon name={icon} className="sidebar-item-icon" /> : (
        <span
          className={cn(
            "sidebar-item-icon h-1.5 w-1.5 rounded-full bg-current opacity-60",
            isActive && "opacity-100"
          )}
          aria-hidden
        />
      )}
      <span className="sidebar-item-label">{label}</span>
      {!collapsed && badge != null && badge > 0 ? (
        <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-2xs font-medium text-primary-foreground tabular-nums">
          {badge}
        </span>
      ) : null}
    </Link>
  );

  return (
    <SidebarTooltip label={label} collapsed={collapsed}>
      {collapsed ? <div className="sidebar-item-slot">{link}</div> : link}
    </SidebarTooltip>
  );
}

export function SidebarItemWithChildren({
  icon,
  label,
  isActive,
  collapsed,
  onClick,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  collapsed?: boolean;
  onClick: () => void;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "sidebar-item w-full",
        collapsed && "sidebar-item-collapsed",
        isActive && "active"
      )}
    >
      <NavIcon name={icon} className="sidebar-item-icon" />
      {!collapsed ? (
        <>
          <span className="sidebar-item-label flex-1 text-left">{label}</span>
          <ChevronRight
            className={cn(
              "h-3 w-3 shrink-0 transition-colors",
              isActive ? "opacity-70" : "opacity-40"
            )}
          />
        </>
      ) : null}
    </button>
  );

  return (
    <SidebarTooltip label={label} collapsed={collapsed}>
      {collapsed ? <div className="sidebar-item-slot">{button}</div> : button}
    </SidebarTooltip>
  );
}
