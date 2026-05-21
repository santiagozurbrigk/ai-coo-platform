"use client";

import { useCallback, useEffect, useState } from "react";
import type { NavItem } from "@/routes/navigation";
import { isNavItemActive } from "@/lib/navigation/active-path";

/**
 * Tracks which sidebar sections are expanded.
 * Auto-expands the section that contains the active route.
 */
export function useSidebarExpanded(pathname: string, items: NavItem[]) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (
          item.children?.length &&
          isNavItemActive(item.href, pathname, item.children)
        ) {
          next[item.href] = true;
        }
      }
      return next;
    });
  }, [pathname, items]);

  const isExpanded = useCallback(
    (href: string) => expanded[href] ?? false,
    [expanded]
  );

  const toggle = useCallback((href: string) => {
    setExpanded((prev) => ({ ...prev, [href]: !prev[href] }));
  }, []);

  return { isExpanded, toggle };
}
