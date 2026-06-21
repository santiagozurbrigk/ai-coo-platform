import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface NotchedCardProps {
  /** Text shown in the top-left tab (notch). */
  tab: ReactNode;
  children: ReactNode;
  className?: string;
  tabClassName?: string;
}

/**
 * Card with a folder-tab notch on the top-left edge (visual-v2 preview pattern).
 */
export function NotchedCard({
  tab,
  children,
  className,
  tabClassName,
}: NotchedCardProps) {
  return (
    <div
      className={cn(
        "notched-card relative rounded-xl border border-border bg-card shadow-card",
        className
      )}
    >
      <div
        className={cn(
          "notched-card-tab absolute left-0 top-0 z-[1] max-w-[min(100%,280px)] rounded-br-xl rounded-tl-xl border-b border-r border-border bg-card px-4 py-2.5 text-caption font-medium text-foreground",
          tabClassName
        )}
      >
        {tab}
      </div>
      <div className="notched-card-body relative px-[var(--space-card)] pb-[var(--space-card)] pt-[calc(var(--notch-height)+var(--space-card-sm))]">
        {children}
      </div>
    </div>
  );
}
