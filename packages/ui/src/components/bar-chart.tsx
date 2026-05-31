"use client";

import { curveMonotoneX } from "@visx/curve";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar as VisxBar, LinePath } from "@visx/shape";
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
  /** `line` = tendencia Bklit-style; `bar` = barras verticales */
  variant?: "line" | "bar";
}

function LineTrend({
  width,
  height,
  data,
  maxValue,
  showLabels,
}: {
  width: number;
  height: number;
  data: BarChartDatum[];
  maxValue?: number;
  showLabels?: boolean;
}) {
  const pad = { top: 16, right: 8, bottom: showLabels ? 28 : 8, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  const xScale = scaleLinear({
    domain: [0, Math.max(data.length - 1, 1)],
    range: [pad.left, pad.left + innerW],
  });

  const yScale = scaleLinear({
    domain: [0, max],
    range: [pad.top + innerH, pad.top],
  });

  const stroke = "var(--chart-1, #7C3AED)";

  return (
    <svg width={width} height={height} role="img" aria-label="Gráfico de tendencia">
      <defs>
        <linearGradient id="ui-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <LinePath
        data={data}
        x={(_, i) => xScale(i) ?? 0}
        y={(d) => yScale(d.value) ?? 0}
        curve={curveMonotoneX}
        stroke={stroke}
        strokeWidth={2.5}
      />
      {showLabels &&
        data.map((d, i) => (
          <text
            key={d.label}
            x={xScale(i)}
            y={height - 6}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            className="text-muted-foreground"
          >
            {d.label}
          </text>
        ))}
    </svg>
  );
}

function VerticalBars({
  width,
  height,
  data,
  maxValue,
  showLabels,
}: {
  width: number;
  height: number;
  data: BarChartDatum[];
  maxValue?: number;
  showLabels?: boolean;
}) {
  const pad = { top: 12, right: 8, bottom: showLabels ? 28 : 8, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  const xScale = scaleBand<string>({
    domain: data.map((d) => d.label),
    range: [pad.left, pad.left + innerW],
    padding: 0.25,
  });

  const yScale = scaleLinear({
    domain: [0, max],
    range: [pad.top + innerH, pad.top],
  });

  return (
    <svg width={width} height={height} role="img" aria-label="Gráfico de barras">
      {data.map((d) => {
        const x = xScale(d.label) ?? 0;
        const w = xScale.bandwidth();
        const y = yScale(d.value) ?? 0;
        const h = pad.top + innerH - y;
        return (
          <VisxBar
            key={d.label}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={d.color ?? "var(--chart-1, #7C3AED)"}
            rx={4}
          />
        );
      })}
      {showLabels &&
        data.map((d) => {
          const x = (xScale(d.label) ?? 0) + xScale.bandwidth() / 2;
          return (
            <text
              key={`${d.label}-lbl`}
              x={x}
              y={height - 6}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              className="text-muted-foreground"
            >
              {d.label}
            </text>
          );
        })}
    </svg>
  );
}

export function BarChart({
  data,
  maxValue,
  height = 200,
  className,
  showLabels = true,
  variant = "line",
}: BarChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ParentSize debounceTime={10}>
        {({ width, height: parentHeight }) => {
          const chartHeight = parentHeight || height;
          if (width < 10 || chartHeight < 10) return null;
          return variant === "bar" ? (
            <VerticalBars
              width={width}
              height={chartHeight}
              data={data}
              maxValue={maxValue}
              showLabels={showLabels}
            />
          ) : (
            <LineTrend
              width={width}
              height={chartHeight}
              data={data}
              maxValue={maxValue}
              showLabels={showLabels}
            />
          );
        }}
      </ParentSize>
    </div>
  );
}
