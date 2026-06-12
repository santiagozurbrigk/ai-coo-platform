import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SparklineSVG } from "./sparkline-svg";

export type MarketingSparklineVariant =
  | "reach"
  | "engage"
  | "convert"
  | "growth"
  | "comments";

export interface MarketingOverviewMetricCardProps {
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  sparkline?: MarketingSparklineVariant;
  sparklineColor?: string;
  children?: ReactNode;
}

export function MarketingOverviewMetricCard({
  label,
  value,
  sub,
  badge,
  sparkline,
  sparklineColor = "rgba(255, 255, 255, 0.35)",
  children,
}: MarketingOverviewMetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5",
        "dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover transition-all duration-200"
      )}
    >
      {sparkline && (
        <SparklineSVG variant={sparkline} color={sparklineColor} />
      )}
      <p className="metric-label mb-1.5">{label}</p>
      {badge && (
        <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-[3px] text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <TrendingUp className="h-3 w-3" />
          {badge}
        </span>
      )}
      <p className="metric-value text-[32px] leading-none tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      )}
      {children}
    </div>
  );
}
