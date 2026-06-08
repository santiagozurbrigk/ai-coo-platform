"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pushHashTab } from "@/lib/hooks/use-hash-tab";
import {
  segmentedNavContainerClass,
  segmentedNavItemClass,
} from "./segmented-nav-styles";

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
    <nav className={segmentedNavContainerClass}>
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
          className={segmentedNavItemClass(isTabActive(tab.href))}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
