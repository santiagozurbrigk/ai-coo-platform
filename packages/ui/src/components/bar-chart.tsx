"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type BarChartDatum = {
  label: string;
  value: number;
  color?: string;
};

export interface BarChartProps {
  data: BarChartDatum[];
  maxValue?: number;
  height?: number;
  className?: string;
  showLabels?: boolean;
  /** `line` = área con gradiente (premium); `bar` = barras clásicas */
  variant?: "line" | "bar";
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function BarChart({
  data,
  maxValue,
  height = 200,
  className,
  showLabels = true,
  variant = "line",
}: BarChartProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const pad = { top: 16, right: 8, bottom: showLabels ? 28 : 8, left: 8 };
  const w = 400;
  const innerH = height - pad.top - pad.bottom;
  const innerW = w - pad.left - pad.right;

  const points = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * innerW,
    y: pad.top + innerH - (d.value / max) * innerH,
    datum: d,
    i,
  }));

  const linePath = smoothPath(points);
  const areaPath =
    linePath &&
    `${linePath} L ${points[points.length - 1].x} ${pad.top + innerH} L ${points[0].x} ${pad.top + innerH} Z`;

  if (variant === "bar") {
    return (
      <div className={cn("w-full", className)}>
        <div
          className="flex items-end gap-2 sm:gap-3"
          style={{ height }}
          role="img"
          aria-label="Gráfico de barras"
        >
          {data.map((datum, i) => {
            const pct = (datum.value / max) * 100;
            return (
              <div
                key={datum.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <div
                    className={cn(
                      "w-full max-w-[48px] rounded-t-md bg-gradient-to-t from-[#7C3AED]/90 to-[#A78BFA]/40 shadow-[0_0_12px_rgba(124,58,237,0.35)]",
                      datum.color
                    )}
                    style={{
                      height: `${pct}%`,
                      minHeight: datum.value > 0 ? "4px" : 0,
                    }}
                  />
                </div>
                {showLabels && (
                  <span className="max-w-full truncate text-center text-2xs text-white/50">
                    {datum.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const active = hover !== null ? points[hover] : null;

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-[20px] bg-black/20", className)}
      role="img"
      aria-label="Gráfico de tendencia"
    >
      <svg
        viewBox={`0 0 ${w} ${height}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="chartAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(124,58,237,0.15)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </linearGradient>
          <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.top + innerH * (1 - t);
          return (
            <line
              key={t}
              x1={pad.left}
              x2={w - pad.right}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          );
        })}

        {areaPath && (
          <path d={areaPath} fill="url(#chartAreaFill)" />
        )}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#chartLine)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p) => (
          <rect
            key={p.i}
            x={p.x - innerW / data.length / 2}
            y={pad.top}
            width={innerW / data.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(p.i)}
          />
        ))}

        {active && (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={pad.top}
              y2={pad.top + innerH}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 4"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r={5}
              fill="rgba(124,58,237,0.25)"
              style={{ filter: "drop-shadow(0 0 8px rgba(124,58,237,0.6))" }}
            />
            <circle cx={active.x} cy={active.y} r={2} fill="#7C3AED" />
          </>
        )}
      </svg>

      {showLabels && (
        <div className="flex justify-between px-2 pb-2">
          {data.map((d) => (
            <span
              key={d.label}
              className="flex-1 truncate text-center text-[10px] text-white/50"
            >
              {d.label}
            </span>
          ))}
        </div>
      )}

      {active && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-white/10 border-l-[3px] border-l-[#7C3AED] bg-white/[0.06] px-3.5 py-2.5 shadow-[var(--shadow-float)] backdrop-blur-[20px]"
          style={{
            left: `${(active.x / w) * 100}%`,
            top: Math.max(active.y - 8, 8),
            transform: "translate(-50%, -100%)",
            width: "max-content",
            maxWidth: "160px",
          }}
        >
          <p className="text-lg font-semibold text-white tabular-nums">
            {active.datum.value}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/50">
            {active.datum.label}
          </p>
        </div>
      )}
    </div>
  );
}
