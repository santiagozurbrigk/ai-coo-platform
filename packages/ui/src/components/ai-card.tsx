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
        "ai-card glass-liquid-subtle relative overflow-hidden rounded-[20px] border border-white/8 p-5 dark:border-white/8",
        variant === "recommendation" && "ai-card-recommendation",
        className
      )}
      data-variant={variant}
    >
      <div className="relative flex items-start gap-3">
        <div className="ai-card-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border bg-muted text-foreground dark:border-white/10 dark:bg-white/[0.06]">
          <Sparkles className="h-4 w-4 text-primary dark:text-[#A78BFA]" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="ai-card-title text-sm font-medium">{title}</span>
            <Badge variant="ai">AI</Badge>
            {confidence !== undefined && (
              <span className="ai-card-muted text-2xs">
                {Math.round(confidence * 100)}% confianza
              </span>
            )}
          </div>
          <div className="ai-insight-text text-sm leading-relaxed">{children}</div>
          {source && (
            <p className="ai-card-muted text-2xs">Fuente: {source}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
