import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";
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
  accentColor: string;
  sparkline?: MarketingSparklineVariant;
  children?: ReactNode;
}

export function MarketingOverviewMetricCard({
  label,
  value,
  sub,
  badge,
  accentColor,
  sparkline,
  children,
}: MarketingOverviewMetricCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border/40 bg-muted/30 p-4"
      style={{ borderLeft: `2px solid ${accentColor}` }}
    >
      {sparkline && <SparklineSVG variant={sparkline} color={accentColor} />}
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
      {badge && (
        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-900/30 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
          <TrendingUp className="h-3 w-3" />
          {badge}
        </span>
      )}
      <p className="mb-1 text-[26px] font-medium leading-none text-foreground">
        {value}
      </p>
      {sub && (
        <p className="mt-1.5 text-[12px] text-muted-foreground">{sub}</p>
      )}
      {children}
    </div>
  );
}
