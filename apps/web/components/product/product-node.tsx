"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { SpatialProductNode } from "@/types/product";

const NODE_SURFACE: Record<SpatialProductNode["type"], string> = {
  avatar:
    "border-blue-200 bg-blue-50/95 dark:border-blue-500/30 dark:bg-blue-950/60",
  offer:
    "border-brand-200 bg-brand-50/95 dark:border-brand-500/30 dark:bg-brand-950/60",
  "value-ladder":
    "border-green-200 bg-green-50/95 dark:border-green-500/30 dark:bg-green-950/60",
  proposition:
    "border-amber-200 bg-amber-50/95 dark:border-amber-500/30 dark:bg-amber-950/60",
};

const BADGE_SURFACE: Record<SpatialProductNode["type"], string> = {
  avatar: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  offer: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
  "value-ladder":
    "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  proposition:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
};

export function ProductNode({
  node,
  registerRef,
}: {
  node: SpatialProductNode;
  delay?: number;
  registerRef?: (id: string, el: HTMLDivElement | null) => void;
}) {
  const router = useRouter();

  return (
    <div
      ref={(el) => registerRef?.(node.id, el)}
      className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-[1.03]"
      style={{ left: node.position.x, top: node.position.y }}
      role="button"
      tabIndex={0}
      onClick={() => router.push(node.href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(node.href);
        }
      }}
    >
      <div
        className={cn(
          "w-44 rounded-2xl border p-4 shadow-sm dark:shadow-none",
          NODE_SURFACE[node.type]
        )}
      >
        {node.badge ? (
          <span
            className={cn(
              "mb-3 inline-block rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
              BADGE_SURFACE[node.type]
            )}
          >
            {node.badge}
          </span>
        ) : null}
        <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white/90">
          {node.title}
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-white/45">
          {node.subtitle}
        </p>
        {node.aiInsight ? (
          <div className="mt-3 flex items-start gap-1.5 border-t border-slate-200/80 pt-3 dark:border-white/8">
            <Sparkles className="mt-0.5 h-2.5 w-2.5 shrink-0 text-brand-600 dark:text-brand-400" />
            <p className="text-[10px] leading-tight text-brand-700 dark:text-brand-400/80">
              {node.aiInsight}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
