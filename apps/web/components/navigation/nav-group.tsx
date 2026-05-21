"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { NavItem } from "@/routes/navigation";
import { isNavItemActive, isPathActive } from "@/lib/navigation/active-path";
import { NavIcon } from "./nav-icons";

type NavGroupProps = {
  item: NavItem;
  pathname: string;
  isExpanded: boolean;
  onToggle: () => void;
  indent?: boolean;
};

function linkClass(active: boolean, indent?: boolean) {
  return cn(
    "flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors",
    indent ? "px-2.5 pl-9" : "px-2.5",
    active
      ? "bg-sidebar-accent font-medium text-sidebar-active"
      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-active"
  );
}

export function NavGroup({
  item,
  pathname,
  isExpanded,
  onToggle,
  indent,
}: NavGroupProps) {
  const hasChildren = Boolean(item.children?.length);
  const sectionActive = isNavItemActive(item.href, pathname, item.children);

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={linkClass(isPathActive(item.href, pathname), indent)}
      >
        {item.icon && <NavIcon name={item.icon} />}
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "flex items-center rounded-md",
          sectionActive && "bg-sidebar-accent/40"
        )}
      >
        <Link
          href={item.href}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-sm transition-colors",
            sectionActive
              ? "font-medium text-sidebar-active"
              : "text-sidebar-foreground hover:text-sidebar-active"
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
          className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-active"
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
              className={linkClass(isPathActive(child.href, pathname), true)}
            >
              <span className="truncate">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
