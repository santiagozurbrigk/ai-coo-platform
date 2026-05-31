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
    <div
      className={cn(
        "space-y-2 border-t border-sidebar-border pt-2",
        collapsed ? "px-1 pb-2" : "mx-1 px-1 pb-2"
      )}
    >
      <div className="space-y-0.5">
        {secondaryNavigation.map((item) => {
          const active = isPathActive(item.href, pathname);
          const link = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center transition-all duration-150 ease-out",
                collapsed
                  ? "mx-auto h-10 w-10 justify-center rounded-[10px]"
                  : "gap-2.5 rounded-[10px] px-3 py-2.5 text-sm",
                active
                  ? collapsed
                    ? "bg-sidebar-accent text-[hsl(var(--sidebar-foreground-active))]"
                    : "border-l-2 border-primary bg-sidebar-accent font-medium text-[hsl(var(--sidebar-foreground-active))]"
                  : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon && <NavIcon name={item.icon} />}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{link}</div>;
        })}
      </div>
      {!collapsed ? (
        <p className="px-3 text-2xs text-muted-foreground">{es.app.phasePrototype}</p>
      ) : null}
    </div>
  );
}
