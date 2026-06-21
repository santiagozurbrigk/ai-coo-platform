import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type SectionHeaderVariant = "panel" | "uppercase" | "settings";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  variant?: SectionHeaderVariant;
  className?: string;
  action?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  variant = "panel",
  className,
  action,
}: SectionHeaderProps) {
  if (variant === "uppercase") {
    return (
      <div
        className={cn(
          "mb-3 flex items-center gap-2",
          action && "justify-between",
          className
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.07em] text-muted-foreground">
            {title}
          </span>
          <div className="h-px flex-1 bg-border/40" />
        </div>
        {action}
      </div>
    );
  }

  if (variant === "settings") {
    return (
      <div
        className={cn(
          "mb-4 flex items-center gap-2 border-b border-border/40 pb-2.5",
          action && "justify-between",
          className
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : null}
          <span className="text-[13px] font-medium text-foreground">{title}</span>
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <div
        className={cn(
          "flex items-start justify-between gap-3",
          description ? "flex-col gap-0" : undefined
        )}
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
    </div>
  );
}
