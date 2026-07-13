import type { ZernioAdMetrics } from "@/lib/zernio/client";

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("es-AR");
}

export function formatSeconds(value: number): string {
  return `${value.toFixed(1)}s`;
}

export function formatActionKey(key: string): string {
  const segment = key.includes(".") ? (key.split(".").pop() ?? key) : key;
  const cleaned = segment.replace(/^fb_/, "").replace(/_/g, " ").trim();

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeAdMetrics(
  metrics?: Partial<ZernioAdMetrics> | null
): ZernioAdMetrics {
  return {
    spend: metrics?.spend ?? 0,
    impressions: metrics?.impressions ?? 0,
    reach: metrics?.reach ?? 0,
    clicks: metrics?.clicks ?? 0,
    ctr: metrics?.ctr ?? 0,
    cpc: metrics?.cpc ?? 0,
    cpm: metrics?.cpm ?? 0,
    engagement: metrics?.engagement ?? 0,
    conversions: metrics?.conversions ?? 0,
    costPerConversion: metrics?.costPerConversion ?? 0,
    purchaseValue: metrics?.purchaseValue ?? 0,
    roas: metrics?.roas ?? 0,
    actions: metrics?.actions ?? {},
    actionValues: metrics?.actionValues ?? {},
    videoPlayActions: metrics?.videoPlayActions ?? 0,
    video30SecWatchedActions: metrics?.video30SecWatchedActions ?? 0,
    videoThruplayWatchedActions: metrics?.videoThruplayWatchedActions ?? 0,
    videoP25WatchedActions: metrics?.videoP25WatchedActions ?? 0,
    videoP50WatchedActions: metrics?.videoP50WatchedActions ?? 0,
    videoP75WatchedActions: metrics?.videoP75WatchedActions ?? 0,
    videoP95WatchedActions: metrics?.videoP95WatchedActions ?? 0,
    videoP100WatchedActions: metrics?.videoP100WatchedActions ?? 0,
    videoAvgTimeWatchedActions: metrics?.videoAvgTimeWatchedActions ?? 0,
    lastSyncedAt: metrics?.lastSyncedAt ?? "",
  };
}

export function hasPositiveActions(metrics: ZernioAdMetrics): boolean {
  return Object.values(metrics.actions).some((value) => value > 0);
}
