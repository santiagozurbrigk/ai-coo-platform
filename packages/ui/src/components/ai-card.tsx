"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { Badge } from "../primitives/badge";

export interface AiCardProps {
  title?: string;
  children: React.ReactNode;
  confidence?: number;
  source?: string;
  className?: string;
  variant?: "default" | "insight" | "recommendation";
}

export function AiCard({
  title = "AI Insight",
  children,
  confidence,
  source,
  className,
  variant = "default",
}: AiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-white/[0.10] border-t-white/[0.14] border-l-[3px] border-l-[#7C3AED] bg-white/[0.06] p-5 backdrop-blur-[40px] backdrop-saturate-[200%] surface-card",
        variant === "recommendation" &&
          "border-l-[#7C3AED] bg-gradient-to-br from-[rgba(124,58,237,0.08)] via-white/[0.04] to-transparent",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[rgba(124,58,237,0.10)] blur-3xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(124,58,237,0.25)] bg-[rgba(124,58,237,0.12)] text-[#A78BFA]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gradient-ai">{title}</span>
            <Badge variant="ai">AI</Badge>
            {confidence !== undefined && (
              <span className="text-2xs text-white/50">
                {Math.round(confidence * 100)}% confianza
              </span>
            )}
          </div>
          <div className="text-sm leading-relaxed text-white/85">
            {children}
          </div>
          {source && (
            <p className="text-2xs text-white/45">Fuente: {source}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
