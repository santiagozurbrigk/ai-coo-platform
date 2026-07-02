"use client";

import * as React from "react";
import { motion, useSpring, useTransform, type SpringOptions } from "framer-motion";
import { useEffect } from "react";
import { cn } from "../lib/utils";
import { parseAnimatableMetricValue } from "../lib/parse-metric-value";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

export function AnimatedNumber({
  value,
  className,
  springOptions = { stiffness: 120, damping: 20, mass: 0.4 },
  decimals = 0,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const reducedMotion = usePrefersReducedMotion();
  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) => {
    const formatted =
      decimals > 0
        ? current.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : Math.round(current).toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  if (reducedMotion) {
    const formatted =
      decimals > 0
        ? value.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : Math.round(value).toLocaleString();
    return (
      <span className={cn("tabular-nums", className)}>
        {prefix}
        {formatted}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span className={cn("tabular-nums", className)}>{display}</motion.span>
  );
}

export type MetricAnimatedValueProps = {
  value: string | number;
  className?: string;
};

/** Animates metric text; falls back to plain text when value is not numeric. */
export function MetricAnimatedValue({ value, className }: MetricAnimatedValueProps) {
  const parsed = parseAnimatableMetricValue(value);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  return (
    <AnimatedNumber
      value={parsed.numeric}
      className={className}
      decimals={parsed.decimals}
      prefix={parsed.prefix}
      suffix={parsed.suffix}
    />
  );
}
