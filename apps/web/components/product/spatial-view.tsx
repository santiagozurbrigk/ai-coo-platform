"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Package } from "lucide-react";
import {
  getElementCenter,
  type SpatialLine,
} from "@/lib/product/spatial-layout";
import { EmptyState } from "@/components/shared/empty-state";
import type { SpatialProductNode } from "@/types/product";
import { BusinessNode } from "./business-node";
import { ProductNode } from "./product-node";

export function ProductSpatialView({
  nodes,
  hasRealData,
}: {
  nodes: SpatialProductNode[];
  hasRealData: boolean;
}) {
  const displayNodes = nodes;
  const canvasRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [lines, setLines] = useState<SpatialLine[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const measureLines = useCallback(() => {
    const canvas = canvasRef.current;
    const center = centerRef.current;
    if (!canvas || !center) return;

    const { width, height } = canvas.getBoundingClientRect();
    setCanvasSize({ width, height });

    const origin = getElementCenter(center, canvas);
    const next: SpatialLine[] = [];

    for (const node of displayNodes) {
      const el = nodeRefs.current.get(node.id);
      if (!el) continue;
      const target = getElementCenter(el, canvas);
      next.push({
        id: node.id,
        x1: origin.x,
        y1: origin.y,
        x2: target.x,
        y2: target.y,
      });
    }

    setLines(next);
  }, [displayNodes]);

  const registerNodeRef = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      if (el) nodeRefs.current.set(id, el);
      else nodeRefs.current.delete(id);
      requestAnimationFrame(measureLines);
    },
    [measureLines]
  );

  const registerCenterRef = useCallback(
    (el: HTMLDivElement | null) => {
      centerRef.current = el;
      requestAnimationFrame(measureLines);
    },
    [measureLines]
  );

  useEffect(() => {
    measureLines();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => measureLines());
    observer.observe(canvas);
    window.addEventListener("resize", measureLines);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureLines);
    };
  }, [measureLines]);

  if (!hasRealData || displayNodes.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8" />}
        title="Sin datos de producto configurados"
        description="Agregá tu primer avatar y oferta para mapear tu propuesta de valor."
      />
    );
  }

  return (
    <div ref={canvasRef} className="product-spatial-canvas w-full">
      {canvasSize.width > 0 && canvasSize.height > 0 ? (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ zIndex: 1 }}
          aria-hidden
        >
          {lines.map((conn) => (
            <g key={conn.id}>
              <line
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke="rgba(124,58,237,0.15)"
                strokeWidth="1"
                strokeDasharray="6 6"
              />
              <line
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke="rgba(167,139,250,0.08)"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>
      ) : null}

      <BusinessNode registerRef={registerCenterRef} />

      {displayNodes.map((node) => (
        <ProductNode key={node.id} node={node} registerRef={registerNodeRef} />
      ))}
    </div>
  );
}
