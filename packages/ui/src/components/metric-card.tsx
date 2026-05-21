import * as React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../primitives/card";
import { Badge } from "../primitives/badge";

export type MetricTrend = "up" | "down" | "neutral";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: MetricTrend;
  trendValue?: string;
  badge?: string;
  className?: string;
  icon?: React.ReactNode;
}

const trendConfig = {
  up: { icon: TrendingUp, color: "text-success", badge: "success" as const },
  down: { icon: TrendingDown, color: "text-destructive", badge: "destructive" as const },
  neutral: { icon: Minus, color: "text-muted-foreground", badge: "secondary" as const },
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  badge,
  className,
  icon,
}: MetricCardProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="rounded-md bg-muted/60 p-2 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
          {trend && trendValue && TrendIcon && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                trendConfig[trend].color
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {trendValue}
            </span>
          )}
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
