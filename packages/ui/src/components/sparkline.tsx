"use client";

import { curveMonotoneX } from "@visx/curve";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { AreaClosed, LinePath } from "@visx/shape";
import * as React from "react";

export interface SparklineProps {
  data: number[];
  color: string;
  /** @deprecated Bklit charts animan al montar; se ignora. */
  animationDelay?: number;
  className?: string;
}

function SparklineInner({
  width,
  height,
  data,
  color,
}: {
  width: number;
  height: number;
  data: number[];
  color: string;
}) {
  const pad = { top: 4, right: 4, bottom: 4, left: 4 };
  const innerW = Math.max(width - pad.left - pad.right, 1);
  const innerH = Math.max(height - pad.top - pad.bottom, 1);

  const xScale = scaleLinear({
    domain: [0, Math.max(data.length - 1, 1)],
    range: [pad.left, pad.left + innerW],
  });

  const yScale = scaleLinear({
    domain: [Math.min(...data, 0), Math.max(...data, 1)],
    range: [pad.top + innerH, pad.top],
    nice: true,
  });

  const getX = (_: number, i: number) => xScale(i) ?? 0;
  const getY = (v: number) => yScale(v) ?? 0;

  const gradientId = React.useId().replace(/:/g, "");

  return (
    <svg width={width} height={height} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <AreaClosed
        data={data}
        x={getX}
        y={getY}
        yScale={yScale}
        curve={curveMonotoneX}
        fill={`url(#${gradientId})`}
      />
      <LinePath
        data={data}
        x={getX}
        y={getY}
        curve={curveMonotoneX}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
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

export function Sparkline({ data, color, className }: SparklineProps) {
  if (data.length < 2) return null;

  return (
    <div className={className} style={{ minWidth: 0, minHeight: 32 }}>
      <ParentSize debounceTime={10}>
        {({ width, height }) =>
          width > 0 && height > 0 ? (
            <SparklineInner
              width={width}
              height={height}
              data={data}
              color={color}
            />
          ) : null
        }
      </ParentSize>
    </div>
  );
}
