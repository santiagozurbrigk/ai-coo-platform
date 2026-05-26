"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@ai-coo/ui";
import { pushHashTab } from "@/lib/hooks/use-hash-tab";

export type ModuleSubnavTab = {
  label: string;
  href: string;
};

function isSameRouteHashLink(pathname: string, href: string): boolean {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return false;
  const pathPart = href.slice(0, hashIndex);
  return pathPart === pathname;
}

export function ModuleSubnav({
  tabs,
  isTabActive,
}: {
  tabs: readonly ModuleSubnavTab[];
  isTabActive: (href: string) => boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/20 p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          scroll={false}
          onClick={(e) => {
            if (isSameRouteHashLink(pathname, tab.href) && pushHashTab(tab.href)) {
              e.preventDefault();
            }
          }}
          className={cn(
            "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isTabActive(tab.href)
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
