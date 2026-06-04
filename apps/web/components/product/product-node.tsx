"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { SpatialProductNode } from "@/types/product";

const NODE_SURFACE: Record<SpatialProductNode["type"], string> = {
  avatar: "bg-blue-950/60 border-blue-500/30",
  offer: "bg-violet-950/60 border-violet-500/30",
  "value-ladder": "bg-green-950/60 border-green-500/30",
  proposition: "bg-amber-950/60 border-amber-500/30",
};

const BADGE_SURFACE: Record<SpatialProductNode["type"], string> = {
  avatar: "bg-blue-500/20 text-blue-400",
  offer: "bg-violet-500/20 text-violet-400",
  "value-ladder": "bg-green-500/20 text-green-400",
  proposition: "bg-amber-500/20 text-amber-400",
};

export function ProductNode({
  node,
  delay = 0,
  registerRef,
}: {
  node: SpatialProductNode;
  delay?: number;
  registerRef?: (id: string, el: HTMLDivElement | null) => void;
}) {
  const router = useRouter();

  return (
    <motion.div
      ref={(el) => registerRef?.(node.id, el)}
      className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: node.position.x, top: node.position.y }}
      animate={{ y: [0, -5, 0] }}
      transition={{
        duration: 4 + (delay % 3) * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      whileHover={{ scale: 1.06 }}
      onClick={() => router.push(node.href)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(node.href);
        }
      }}
    >
      <div
        className={cn(
          "w-44 rounded-2xl border p-4 backdrop-blur-sm",
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
        <p className="text-sm font-semibold leading-tight text-white/90">
          {node.title}
        </p>
        <p className="mt-1 text-xs text-white/45">{node.subtitle}</p>
        {node.aiInsight ? (
          <div className="mt-3 flex items-start gap-1.5 border-t border-white/8 pt-3">
            <Sparkles className="mt-0.5 h-2.5 w-2.5 shrink-0 text-violet-400" />
            <p className="text-[10px] leading-tight text-violet-400/80">
              {node.aiInsight}
            </p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
