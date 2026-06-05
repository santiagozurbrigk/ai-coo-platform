"use client";

import { Gauge } from "@/components/charts/gauge";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export type GaugeVariant = "default" | "inverted" | "margin" | "booking";

function neutralGradients(isDark: boolean): {
  active: [string, string];
  inactive: [string, string];
} {
  if (isDark) {
    return {
      active: ["#FFFFFF", "#FFFFFF"],
      inactive: ["#222228", "#1a1a20"],
    };
  }
  return {
    active: ["#0A0A0A", "#0A0A0A"],
    inactive: ["#e8e8ec", "#e2e2e8"],
  };
}

function accentGradients(isDark: boolean): {
  active: [string, string];
  inactive: [string, string];
} {
  if (isDark) {
    return {
      active: ["#7C3AED", "#A78BFA"],
      inactive: ["#2a2540", "#1a1828"],
    };
  }
  return {
    active: ["#7C3AED", "#6D28D9"],
    inactive: ["#ede9fe", "#e9e5ff"],
  };
}

function resolveGradients(
  variant: GaugeVariant,
  isDark: boolean
): {
  active: [string, string];
  inactive: [string, string];
} {
  if (variant === "margin" || variant === "booking") {
    return accentGradients(isDark);
  }
  return neutralGradients(isDark);
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const { active, inactive } = resolveGradients(variant, isDark);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-between",
        className
      )}
    >
      <ChartWrapper
        data={[value]}
        minPoints={1}
        align="center"
        className={cn("w-full flex-1 py-2", CHART_MIN_HEIGHT.gauge)}
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
          minWidth={0}
          className="mx-auto h-full w-full max-w-[240px]"
        />
      </ChartWrapper>
      {target != null ? (
        <p className="w-full shrink-0 pb-1 text-center text-xs text-muted-foreground">
          {subtitle ?? `Objetivo: ${target}${suffix}`}
        </p>
      ) : null}
    </div>
  );
}
