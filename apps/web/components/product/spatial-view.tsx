"use client";

import { mockSpatialNodes, spatialConnections } from "@/mocks/product";
import { BusinessNode } from "./business-node";
import { ProductNode } from "./product-node";

export function ProductSpatialView() {
  return (
    <div className="relative min-h-[600px] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-[#080810]">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {spatialConnections.map((conn, i) => (
          <line
            key={i}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="rgba(124,58,237,0.20)"
            strokeWidth="0.15"
            strokeDasharray="0.8 0.8"
          />
        ))}
      </svg>

      <BusinessNode />

      {mockSpatialNodes.map((node, i) => (
        <ProductNode key={node.id} node={node} delay={i * 0.35} />
      ))}
    </div>
  );
}
