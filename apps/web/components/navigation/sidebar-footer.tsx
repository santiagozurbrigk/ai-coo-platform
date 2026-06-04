"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { secondaryNavigation } from "@/routes/navigation";
import { isPathActive } from "@/lib/navigation/active-path";
import { NavIcon } from "./nav-icons";

export function SidebarFooter({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <div className={cn("space-y-1", collapsed ? "px-0" : "px-0")}>
      <div className="space-y-0.5">
        {secondaryNavigation.map((item) => {
          const active = isPathActive(item.href, pathname);
          const link = (
            <Link
              href={item.href}
              className={cn(
                "sidebar-item",
                collapsed && "sidebar-item-collapsed",
                active && "active"
              )}
            >
              {item.icon && (
                <NavIcon name={item.icon} className="sidebar-item-icon" />
              )}
              <span className="sidebar-item-label">{item.label}</span>
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <div className="sidebar-item-slot">{link}</div>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{link}</div>;
        })}
      </div>
      {!collapsed ? (
        <p className="px-2.5 pt-2 text-2xs text-muted-foreground/80">
          {es.app.phasePrototype}
        </p>
      ) : null}
    </div>
  );
}
