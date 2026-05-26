"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Separator } from "../primitives/separator";

export type SidebarNavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  children?: SidebarNavItem[];
};

export interface SidebarShellProps {
  logo?: React.ReactNode;
  workspace?: React.ReactNode;
  items?: SidebarNavItem[];
  navigation?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  renderLink?: (item: SidebarNavItem, className: string) => React.ReactNode;
}

function navLinkClassName(active?: boolean) {
  return cn(
    "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 ease-out",
    active
      ? "border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.15)] font-medium text-[#A78BFA] shadow-[0_0_12px_rgba(124,58,237,0.15)] [&_svg]:text-[#A78BFA]"
      : "border border-transparent text-white/38 hover:bg-white/[0.05] hover:text-white/65"
  );
}

function NavLink({
  item,
  renderLink,
}: {
  item: SidebarNavItem;
  renderLink?: SidebarShellProps["renderLink"];
}) {
  const className = navLinkClassName(item.active);

  if (renderLink) {
    return <>{renderLink(item, className)}</>;
  }

  return (
    <a href={item.href} className={className}>
      {item.icon}
      {item.label}
    </a>
  );
}

export function SidebarShell({
  logo,
  workspace,
  items = [],
  navigation,
  footer,
  className,
  renderLink,
}: SidebarShellProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[rgba(10,8,20,0.70)] backdrop-blur-[40px]",
        className
      )}
    >
      {logo && (
        <div className="relative flex min-h-[88px] shrink-0 items-center justify-center px-3 pt-6 pb-4">
          <div
            className="pointer-events-none absolute inset-x-4 top-4 h-16 rounded-full bg-[rgba(124,58,237,0.12)] blur-2xl"
            aria-hidden
          />
          <div className="relative">{logo}</div>
        </div>
      )}
      {workspace && (
        <>
          <div className="px-3 pb-2">{workspace}</div>
          <Separator className="mx-4 bg-white/[0.06]" />
        </>
      )}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">{navigation ?? items.map((item) => (
            <div key={item.href} className="space-y-0.5">
              <NavLink item={item} renderLink={renderLink} />
              {item.children?.map((child) => (
                <div key={child.href} className="pl-7">
                  <NavLink item={child} renderLink={renderLink} />
                </div>
              ))}
            </div>
          ))}</nav>
      {footer && (
        <>
          <Separator className="mx-4 bg-white/[0.06]" />
          <div className="p-3 pt-2">{footer}</div>
        </>
      )}
    </aside>
  );
}
