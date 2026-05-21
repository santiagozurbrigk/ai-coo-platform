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
  /** Legacy flat nav — ignored when `navigation` is provided */
  items?: SidebarNavItem[];
  /** Custom nav tree (collapsible groups, etc.) */
  navigation?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Custom link renderer (e.g. Next.js Link). Falls back to <a>. */
  renderLink?: (item: SidebarNavItem, className: string) => React.ReactNode;
}

function navLinkClassName(active?: boolean) {
  return cn(
    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
    active
      ? "bg-sidebar-accent text-sidebar-active font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-active"
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
        "flex h-full w-[240px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      {logo && <div className="flex h-14 items-center px-4">{logo}</div>}
      {workspace && (
        <>
          <div className="px-3 pb-2">{workspace}</div>
          <Separator className="bg-sidebar-border" />
        </>
      )}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navigation ??
          items.map((item) => (
            <div key={item.href} className="space-y-0.5">
              <NavLink item={item} renderLink={renderLink} />
              {item.children?.map((child) => (
                <div key={child.href} className="pl-7">
                  <NavLink item={child} renderLink={renderLink} />
                </div>
              ))}
            </div>
          ))}
      </nav>
      {footer && (
        <>
          <Separator className="bg-sidebar-border" />
          <div className="p-3">{footer}</div>
        </>
      )}
    </aside>
  );
}
