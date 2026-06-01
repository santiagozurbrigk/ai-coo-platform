import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-[3px] text-[11px] font-medium transition-colors duration-150",
  {
    variants: {
      variant: {
        default:
          "border-border bg-muted text-muted-foreground dark:border-white/10 dark:bg-white/[0.08] dark:text-white/90",
        secondary:
          "border-border bg-muted text-muted-foreground dark:border-white/10 dark:bg-white/[0.05] dark:text-white/50",
        success:
          "badge-positive border-border bg-muted text-foreground dark:border-white/12 dark:bg-white/[0.08] dark:text-white/90",
        warning:
          "border-border bg-muted/80 text-muted-foreground dark:border-white/08 dark:bg-white/[0.05] dark:text-white/50",
        destructive:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-400",
        outline:
          "border-border bg-transparent text-muted-foreground dark:border-white/10 dark:text-white/70",
        ai: "border-primary/30 bg-primary/10 text-primary dark:border-[rgba(124,58,237,0.25)] dark:bg-[rgba(124,58,237,0.15)] dark:text-[#A78BFA]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
