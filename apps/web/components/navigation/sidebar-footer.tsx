"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { secondaryNavigation } from "@/routes/navigation";
import { isPathActive } from "@/lib/navigation/active-path";
import { NavIcon } from "./nav-icons";

export function SidebarFooter() {
  const pathname = usePathname();

  return (
    <div className="space-y-2 border-t border-white/[0.06] pt-2 mx-1">
      <div className="space-y-0.5">
        {secondaryNavigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 ease-out",
              isPathActive(item.href, pathname)
                ? "border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.15)] font-medium text-[#A78BFA] shadow-[0_0_12px_rgba(124,58,237,0.15)] [&_svg]:text-[#A78BFA]"
                : "border border-transparent text-white/38 hover:bg-white/[0.05] hover:text-white/65"
            )}
          >
            {item.icon && <NavIcon name={item.icon} />}
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
      <p className="px-3.5 text-2xs text-white/25">{es.app.phasePrototype}</p>
    </div>
  );
}
