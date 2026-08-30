import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-[3px] text-[11px] font-medium transition-colors duration-150",
  {
    variants: {
      variant: {
        default:
          "border-border bg-muted text-muted-foreground backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-muted-foreground",
        secondary:
          "border-border bg-muted text-muted-foreground backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/50",
        success:
          "badge-positive border-emerald-500/20 bg-emerald-900/20 text-emerald-400 backdrop-blur-sm dark:border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-400",
        warning:
          "border-border bg-muted/80 text-muted-foreground backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/50",
        destructive:
          "border-red-200 bg-red-50 text-red-700 backdrop-blur-sm dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-400",
        outline:
          "border-border bg-transparent text-muted-foreground backdrop-blur-sm dark:border-white/[0.08] dark:text-white/70",
        ai: "border-brand-500/20 bg-brand-900/20 text-brand-400 backdrop-blur-sm dark:border-brand-500/20 dark:bg-brand-900/20 dark:text-brand-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
