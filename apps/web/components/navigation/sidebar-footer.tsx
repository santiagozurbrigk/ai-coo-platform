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
        "space-y-2 border-t border-white/[0.06] pt-2",
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
                    ? "bg-[rgba(124,58,237,0.15)] text-[#A78BFA]"
                    : "border-l-2 border-[#7C3AED] bg-[rgba(124,58,237,0.15)] font-medium text-[#A78BFA]"
                  : "text-white/45 hover:bg-white/[0.05] hover:text-white/70"
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
        <p className="px-3 text-2xs text-white/25">{es.app.phasePrototype}</p>
      ) : null}
    </div>
  );
}
