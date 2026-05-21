import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {action}
    </div>
  );
}
