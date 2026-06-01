"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "context-insight-read:";

/** Bump a route key when the insight content changes to show the unread dot again. */
const INSIGHT_VERSION_BY_PATH: Record<string, string> = {
  "/dashboard": "v1",
  default: "v1",
};

function insightVersion(pathname: string): string {
  if (INSIGHT_VERSION_BY_PATH[pathname]) {
    return INSIGHT_VERSION_BY_PATH[pathname];
  }
  const section = pathname.split("/").filter(Boolean)[0] ?? "root";
  return INSIGHT_VERSION_BY_PATH[section] ?? INSIGHT_VERSION_BY_PATH.default;
}

export function useContextInsightRead(pathname: string) {
  const version = insightVersion(pathname);
  const storageKey = `${STORAGE_PREFIX}${pathname}`;
  const [hasUnread, setHasUnread] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const read = localStorage.getItem(storageKey);
      setHasUnread(read !== version);
    } catch {
      setHasUnread(true);
    }
    setHydrated(true);
  }, [pathname, storageKey, version]);

  const markRead = useCallback(() => {
    try {
      localStorage.setItem(storageKey, version);
    } catch {
      /* ignore */
    }
    setHasUnread(false);
  }, [storageKey, version]);

  return { hasUnread: hydrated && hasUnread, markRead };
}
