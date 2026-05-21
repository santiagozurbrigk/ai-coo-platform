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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-ai/25 bg-gradient-to-br from-ai/10 via-card to-card p-5",
        variant === "recommendation" && "border-primary/30 from-primary/10",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ai/20 blur-3xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ai/20 text-ai">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gradient-ai">{title}</span>
            <Badge variant="ai">AI</Badge>
            {confidence !== undefined && (
              <span className="text-2xs text-muted-foreground">
                {Math.round(confidence * 100)}% confidence
              </span>
            )}
          </div>
          <div className="text-sm leading-relaxed text-foreground/90">
            {children}
          </div>
          {source && (
            <p className="text-2xs text-muted-foreground">Source: {source}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
