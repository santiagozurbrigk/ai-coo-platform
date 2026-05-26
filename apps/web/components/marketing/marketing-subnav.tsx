"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@ai-coo/ui";
import { paths } from "@/routes";

const TABS = [
  { label: "Overview", href: paths.platform.marketing.overview },
  { label: "Contenido", href: paths.platform.marketing.content },
  {
    label: "Conexión con Ventas",
    href: paths.platform.marketing.salesConnection,
  },
] as const;

export function MarketingSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-3">
      {TABS.map((tab) => {
        const active =
          tab.href === paths.platform.marketing.overview
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
