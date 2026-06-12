"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const UTM_STORAGE_KEY = "utm_data";

export function getStoredUtmData(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string | null>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function UTMCapture({ organizationId }: { organizationId: string }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utm_source = searchParams.get("utm_source");
    const utm_medium = searchParams.get("utm_medium");
    const utm_campaign = searchParams.get("utm_campaign");
    const utm_content = searchParams.get("utm_content");

    if (!utm_campaign) return;

    sessionStorage.setItem(
      UTM_STORAGE_KEY,
      JSON.stringify({
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
      })
    );

    if (!organizationId) return;

    void fetch("/api/utm/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        utm_campaign,
        organization_id: organizationId,
      }),
    });
  }, [searchParams, organizationId]);

  return null;
}
