"use client";

import { GlassPanel, cn } from "@ai-coo/ui";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function ChartShell({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassPanel className={cn("space-y-3 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <motion.div
        className="w-full overflow-visible"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </GlassPanel>
  );
}
