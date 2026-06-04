"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { SpatialProductNode } from "@/types/product";

const NODE_COLORS: Record<SpatialProductNode["type"], string> = {
  avatar: "border-blue-500/30 bg-blue-500/5",
  offer: "border-violet-500/30 bg-violet-500/5",
  "value-ladder": "border-green-500/30 bg-green-500/5",
  proposition: "border-amber-500/30 bg-amber-500/5",
};

export function ProductNode({
  node,
  delay = 0,
}: {
  node: SpatialProductNode;
  delay?: number;
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      type="button"
      className={cn(
        "absolute w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl border p-3 text-left",
        "cursor-pointer transition-all duration-200",
        NODE_COLORS[node.type],
        isHovered && "scale-105 shadow-lg shadow-violet-500/10"
      )}
      style={{ left: node.position.x, top: node.position.y }}
      animate={{ y: [0, -4, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => router.push(node.href)}
    >
      {node.badge ? (
        <span
          className={cn(
            "mb-2 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
            node.badgeColor ?? "bg-black/5 text-slate-500 dark:bg-white/8 dark:text-white/50"
          )}
        >
          {node.badge}
        </span>
      ) : null}
      <p className="text-xs font-semibold leading-tight text-slate-900 dark:text-white/85">
        {node.title}
      </p>
      <p className="mt-0.5 text-[10px] text-slate-500 dark:text-white/40">
        {node.subtitle}
      </p>
      {node.aiInsight ? (
        <div className="mt-2 border-t border-black/5 pt-2 dark:border-white/6">
          <div className="flex items-start gap-1.5">
            <Sparkles className="mt-0.5 h-2.5 w-2.5 shrink-0 text-violet-500 dark:text-violet-400" />
            <p className="text-[9px] leading-tight text-violet-600/80 dark:text-violet-400/70">
              {node.aiInsight}
            </p>
          </div>
        </div>
      ) : null}
    </motion.button>
  );
}
