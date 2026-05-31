"use client";

import { Gauge } from "@/components/charts/gauge";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export type GaugeVariant = "default" | "inverted" | "margin";

function resolveGradients(
  variant: GaugeVariant,
  value: number,
  target?: number
): {
  active: [string, string];
  inactive: [string, string];
} {
  if (variant === "margin" && target != null) {
    if (value >= target) {
      return { active: ["#34D399", "#10B981"], inactive: ["#1a2e24", "#142820"] };
    }
    if (value >= target * 0.9) {
      return { active: ["#FBBF24", "#F59E0B"], inactive: ["#2a2418", "#1f1a12"] };
    }
    return { active: ["#F87171", "#EF4444"], inactive: ["#2a1818", "#1f1212"] };
  }

  if (variant === "inverted") {
    const good = value <= (target ?? 20);
    return good
      ? { active: ["#34D399", "#10B981"], inactive: ["#1a2e24", "#142820"] }
      : { active: ["#F87171", "#EF4444"], inactive: ["#2a1818", "#1f1212"] };
  }

  const pct = target != null && target > 0 ? (value / target) * 100 : value;
  if (pct >= 100) {
    return { active: ["#34D399", "#10B981"], inactive: ["#1a2e24", "#142820"] };
  }
  return { active: ["#7C3AED", "#A78BFA"], inactive: ["#2a2540", "#1a1828"] };
}

export function GaugeTargetChart({
  value,
  max = 100,
  target,
  label,
  suffix = "%",
  displayValue,
  variant = "default",
  className,
  subtitle,
}: {
  value: number;
  max?: number;
  target?: number;
  label: string;
  suffix?: string;
  displayValue?: number;
  variant?: GaugeVariant;
  className?: string;
  subtitle?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const { active, inactive } = resolveGradients(variant, value, target);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <ChartWrapper
        data={[value]}
        minPoints={1}
        className={cn("w-full max-w-[240px]", CHART_MIN_HEIGHT.gauge)}
        minHeight={CHART_MIN_HEIGHT.gauge}
      >
        <Gauge
          value={pct}
          centerValue={displayValue ?? value}
          defaultLabel={label}
          suffix={suffix}
          useGradient
          activeGradient={active}
          inactiveGradient={inactive}
          className="h-full w-full"
        />
      </ChartWrapper>
      {target != null ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {subtitle ?? `Objetivo: ${target}${suffix}`}
        </p>
      ) : null}
    </div>
  );
}
