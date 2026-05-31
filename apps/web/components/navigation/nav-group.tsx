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

function linkClass(active: boolean, collapsed?: boolean, sub?: boolean) {
  return cn(
    "flex items-center transition-all duration-150 ease-out",
    collapsed
      ? "mx-auto h-10 w-10 justify-center rounded-[10px]"
      : cn(
          "gap-2.5 rounded-[10px] py-2.5 text-sm",
          sub ? "ml-8 px-3 text-[13px]" : "px-3"
        ),
    active
      ? collapsed
        ? "bg-[rgba(124,58,237,0.15)] text-[#A78BFA] [&_svg]:text-[#A78BFA]"
        : "border-l-2 border-[#7C3AED] bg-[rgba(124,58,237,0.15)] font-medium text-[#A78BFA] [&_svg]:text-[#A78BFA]"
      : collapsed
        ? "text-white/45 hover:bg-white/[0.05] hover:text-white/70"
        : sub
          ? "text-white/55 hover:bg-white/[0.05] hover:text-white/75"
          : "text-white/45 hover:bg-white/[0.05] hover:text-white/70"
  );
}

function NavTooltip({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed?: boolean;
  children: React.ReactNode;
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

  if (!hasChildren) {
    const link = (
      <Link
        href={item.href}
        className={linkClass(isPathActive(item.href, pathname), collapsed)}
      >
        {item.icon && <NavIcon name={item.icon} />}
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.badge != null && item.badge > 0 && (
          <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-2xs font-medium text-primary-foreground tabular-nums">
            {item.badge}
          </span>
        )}
      </Link>
    );

    return (
      <NavTooltip label={item.label} collapsed={collapsed}>
        {link}
      </NavTooltip>
    );
  }

  if (collapsed) {
    return (
      <NavTooltip label={item.label} collapsed>
        <Link
          href={item.href}
          className={linkClass(sectionActive, true)}
        >
          {item.icon && <NavIcon name={item.icon} />}
        </Link>
      </NavTooltip>
    );
  }

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "flex items-center rounded-[10px]",
          sectionActive && "bg-white/[0.03]"
        )}
      >
        <Link
          href={item.href}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-sm transition-all duration-150 ease-out",
            sectionActive
              ? "font-medium text-[#A78BFA] [&_svg]:text-[#A78BFA]"
              : "text-white/45 hover:text-white/70"
          )}
        >
          {item.icon && <NavIcon name={item.icon} />}
          <span className="truncate">{item.label}</span>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${item.label}`}
          className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-all duration-150 hover:bg-white/[0.05] hover:text-white/65"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-0.5">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={linkClass(isPathActive(child.href, pathname), false, true)}
            >
              <span className="truncate">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
