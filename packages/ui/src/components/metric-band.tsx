import * as React from "react";
import { cn } from "../lib/utils";

export interface MetricBandProps {
  children: React.ReactNode;
  className?: string;
  /** Glass surface in dark mode (marketing / operational bands). */
  glass?: boolean;
}

export function MetricBand({ children, className, glass = false }: MetricBandProps) {
  const items = React.Children.toArray(children);

  return (
    <div
      className={cn(
        "metric-band overflow-hidden rounded-2xl border border-border bg-card shadow-band",
        glass &&
          "dark:border-glass dark:bg-glass dark:backdrop-blur-md transition-all duration-200",
        className
      )}
    >
      <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
        {items.map((child, index) => (
          <div
            key={index}
            className="metric-band-cell min-w-0 flex-1 px-[var(--space-metric-band-x)] py-[var(--space-metric-band-y)]"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
