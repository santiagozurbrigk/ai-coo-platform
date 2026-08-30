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
  disabled,
  comingSoonLabel,
  onLinkClick,
}: {
  icon?: string;
  label: string;
  href: string;
  isActive: boolean;
  collapsed?: boolean;
  badge?: number;
  disabled?: boolean;
  comingSoonLabel?: string;
  onLinkClick?: () => void;
}) {
  const content = (
    <>
      {icon ? <NavIcon name={icon} className="sidebar-item-icon" /> : (
        <span
          className={cn(
            "sidebar-item-icon h-1.5 w-1.5 rounded-full bg-current opacity-60",
            isActive && "opacity-100"
          )}
          aria-hidden
        />
      )}
      {!collapsed ? <span className="sidebar-item-label">{label}</span> : null}
      {!collapsed && comingSoonLabel ? (
        <span className="ml-auto rounded-full bg-brand-500/15 px-1.5 py-0.5 text-2xs font-medium text-brand-700 dark:text-brand-300">
          {comingSoonLabel}
        </span>
      ) : null}
      {!collapsed && !comingSoonLabel && badge != null && badge > 0 ? (
        <span className="ml-auto px-1 text-2xs font-normal text-muted-foreground/60 tabular-nums">
          {badge}
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "sidebar-item",
    collapsed && "sidebar-item-collapsed",
    isActive && !disabled && "active",
    disabled && "cursor-not-allowed text-brand-700/80 hover:bg-brand-500/10 dark:text-brand-300/80"
  );

  const link = disabled ? (
    <button
      type="button"
      aria-disabled="true"
      className={cn(className, "appearance-none border-0 bg-transparent text-left")}
      onClick={(event) => event.preventDefault()}
    >
      {content}
    </button>
  ) : (
    <Link
      href={href}
      onClick={onLinkClick}
      className={className}
    >
      {content}
    </Link>
  );

  return (
    <SidebarTooltip
      label={comingSoonLabel ? `${label} · ${comingSoonLabel}` : label}
      collapsed={collapsed}
    >
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
        "sidebar-item",
        !collapsed && "w-full",
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
