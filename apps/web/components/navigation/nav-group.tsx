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
    "flex items-center gap-2.5 rounded-xl py-2.5 text-sm transition-all duration-150 ease-out",
    indent ? "px-3.5 pl-9" : "px-3.5",
    active
      ? "border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.15)] font-medium text-[#A78BFA] shadow-[0_0_12px_rgba(124,58,237,0.15)] [&_svg]:text-[#A78BFA]"
      : "border border-transparent text-white/38 hover:bg-white/[0.05] hover:text-white/65"
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
          "flex items-center rounded-xl",
          sectionActive && "bg-white/[0.03]"
        )}
      >
        <Link
          href={item.href}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 px-3.5 py-2.5 text-sm transition-all duration-150 ease-out",
            sectionActive
              ? "font-medium text-[#A78BFA] [&_svg]:text-[#A78BFA]"
              : "text-white/38 hover:text-white/65"
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
          className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-white/38 transition-all duration-150 hover:bg-white/[0.05] hover:text-white/65"
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
