"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

export interface SparklineProps {
  data: number[];
  color: string;
  /** Stagger mount animation (ms). */
  animationDelay?: number;
  className?: string;
}

function toChartData(data: number[]) {
  return data.map((value, index) => ({ value, index }));
}

export function Sparkline({
  data,
  color,
  animationDelay = 0,
  className,
}: SparklineProps) {
  const gradientId = React.useId().replace(/:/g, "");
  const glowId = `${gradientId}-glow`;
  const chartData = React.useMemo(() => toChartData(data), [data]);
  const lastIndex = data.length - 1;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (data.length < 2) return null;

  return (
    <div ref={containerRef} className={className} style={{ minWidth: 0, minHeight: 32 }} aria-hidden>
      {size.width > 0 && size.height > 0 ? (
      <ResponsiveContainer width={size.width} height={size.height}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 6, bottom: 4, left: 4 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
            animationBegin={animationDelay}
            dot={(props) => {
              const { cx, cy, index } = props;
              if (index !== lastIndex || cx == null || cy == null) return <g />;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={color}
                  filter={`url(#${glowId})`}
                  style={{ opacity: 0.95 }}
                />
              );
            }}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      ) : null}
    </div>
  );
}
