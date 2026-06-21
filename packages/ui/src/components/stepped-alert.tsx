import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type SteppedAlertVariant = "warning" | "destructive" | "info";

const variantStyles: Record<
  SteppedAlertVariant,
  { header: string; icon: string; body: string; step: string }
> = {
  warning: {
    header:
      "bg-amber-500/15 text-amber-800 dark:bg-amber-500/12 dark:text-amber-200",
    icon: "text-amber-600 dark:text-amber-400",
    body: "bg-amber-500/[0.06] dark:bg-amber-500/[0.08]",
    step: "bg-amber-500/[0.06] border-amber-500/20 dark:bg-amber-500/[0.08] dark:border-amber-500/25",
  },
  destructive: {
    header:
      "bg-destructive/12 text-destructive dark:bg-destructive/15 dark:text-red-300",
    icon: "text-destructive",
    body: "bg-destructive/[0.06] dark:bg-destructive/[0.08]",
    step: "bg-destructive/[0.06] border-destructive/20 dark:bg-destructive/[0.08]",
  },
  info: {
    header: "bg-primary/10 text-primary dark:bg-primary/15 dark:text-[#A78BFA]",
    icon: "text-primary dark:text-[#A78BFA]",
    body: "bg-primary/[0.05] dark:bg-primary/[0.08]",
    step: "bg-primary/[0.05] border-primary/20 dark:bg-primary/[0.08]",
  },
};

export interface SteppedAlertProps {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  variant?: SteppedAlertVariant;
  className?: string;
  action?: ReactNode;
}

/**
 * Alert with a stepped top edge — taller title block on the left (visual-v2 preview pattern).
 */
export function SteppedAlert({
  title,
  icon,
  children,
  variant = "warning",
  className,
  action,
}: SteppedAlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "stepped-alert overflow-hidden rounded-xl border border-border shadow-card",
        className
      )}
      role="alert"
    >
      <div className="stepped-alert-top flex min-h-[var(--notch-height)]">
        <div
          className={cn(
            "stepped-alert-header flex min-w-[min(100%,var(--step-alert-tab-width))] items-center gap-2 rounded-br-xl px-4 py-3 text-caption font-semibold",
            styles.header
          )}
        >
          {icon ? (
            <span className={cn("shrink-0 [&_svg]:h-4 [&_svg]:w-4", styles.icon)}>
              {icon}
            </span>
          ) : null}
          <span>{title}</span>
        </div>
        <div
          className={cn(
            "stepped-alert-step mt-[var(--step-alert-step-height)] flex-1 border-b border-l",
            styles.step
          )}
          aria-hidden
        />
      </div>
      <div
        className={cn(
          "stepped-alert-body px-4 py-4 text-body text-muted-foreground",
          styles.body
        )}
      >
        <div className="space-y-3">
          {children}
          {action ? <div>{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
