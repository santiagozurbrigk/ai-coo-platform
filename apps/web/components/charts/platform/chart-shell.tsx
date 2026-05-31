"use client";

import { GlassPanel, cn } from "@ai-coo/ui";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function ChartShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassPanel className={cn("space-y-3 p-4", className)}>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </GlassPanel>
  );
}
