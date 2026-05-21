"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, Separator } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { secondaryNavigation } from "@/routes/navigation";
import { isPathActive } from "@/lib/navigation/active-path";
import { NavIcon } from "./nav-icons";

export function SidebarFooter() {
  const pathname = usePathname();

  return (
    <div className="space-y-2">
      <Separator className="bg-sidebar-border" />
      <div className="space-y-0.5 px-1">
        {secondaryNavigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
              isPathActive(item.href, pathname)
                ? "bg-sidebar-accent font-medium text-sidebar-active"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-active"
            )}
          >
            {item.icon && <NavIcon name={item.icon} />}
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
      <p className="px-2.5 text-2xs text-muted-foreground">{es.app.phasePrototype}</p>
    </div>
  );
}
