"use client";

import { curveMonotoneX } from "@visx/curve";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { AreaClosed, LinePath } from "@visx/shape";
import * as React from "react";
import { cn } from "../lib/utils";

export interface MetricLineChartProps {
  /** Datos del período actual */
  data: number[];
  /** Datos del período anterior (línea gris de comparación) */
  previousData?: number[];
  /** Etiqueta izquierda (fecha inicio) */
  startLabel?: string;
  /** Etiqueta derecha (fecha fin). Default "Hoy" */
  endLabel?: string;
  /** Color línea principal. Default: violeta primario de marca */
  color?: string;
  className?: string;
}

function MetricLineChartInner({
  width,
  height,
  data,
  previousData,
  color,
}: {
  width: number;
  height: number;
  data: number[];
  previousData?: number[];
  color: string;
}) {
  const labelHeight = 0; // labels are rendered in HTML, not SVG
  const chartH = Math.max(height - labelHeight, 1);
  const pad = { top: 6, right: 0, bottom: 4, left: 0 };

  const allValues = [
    ...data,
    ...(previousData ?? []),
    0,
  ];
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues, 1);

  const xScale = scaleLinear({
    domain: [0, Math.max(data.length - 1, 1)],
    range: [pad.left, width - pad.right],
  });

  const yScale = scaleLinear({
    domain: [yMin, yMax],
    range: [chartH - pad.bottom, pad.top],
    nice: true,
  });

  const getX = (_: number, i: number) => xScale(i) ?? 0;
  const getY = (v: number) => yScale(v) ?? 0;

  const gradientId = React.useId().replace(/:/g, "");

  return (
    <svg width={width} height={chartH} aria-hidden style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Línea período anterior (gris) */}
      {previousData && previousData.length >= 2 && (
        <LinePath
          data={previousData}
          x={getX}
          y={getY}
          curve={curveMonotoneX}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeOpacity={0.2}
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
      )}

      {/* Área fill bajo línea principal */}
      <AreaClosed
        data={data}
        x={getX}
        y={getY}
        yScale={yScale}
        curve={curveMonotoneX}
        fill={`url(#${gradientId})`}
      />

      {/* Línea principal */}
      <LinePath
        data={data}
        x={getX}
        y={getY}
        curve={curveMonotoneX}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Punto final */}
      {data.length > 0 && (
        <circle
          cx={xScale(data.length - 1)}
          cy={getY(data[data.length - 1])}
          r={3}
          fill={color}
        />
      )}
    </svg>
  );
}

export function MetricLineChart({
  data,
  previousData,
  startLabel,
  endLabel = "Hoy",
  color = "hsl(var(--primary))",
  className,
}: MetricLineChartProps) {
  if (data.length < 2) return null;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex-1" style={{ minHeight: 0 }}>
        <ParentSize debounceTime={10}>
          {({ width, height }) =>
            width > 0 ? (
              <MetricLineChartInner
                width={width}
                height={Math.max(height, 64)}
                data={data}
                previousData={previousData}
                color={color}
              />
            ) : null
          }
        </ParentSize>
      </div>
      {(startLabel || endLabel) && (
        <div className="flex items-center justify-between px-0 pt-1">
          {startLabel ? (
            <span className="text-[10px] leading-none text-muted-foreground/60">
              {startLabel}
            </span>
          ) : (
            <span />
          )}
          <span className="text-[10px] leading-none text-muted-foreground/60">
            {endLabel}
          </span>
        </div>
      )}
    </div>
  );
}
