import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-[3px] text-[11px] font-medium transition-colors duration-150",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(124,58,237,0.30)] bg-[rgba(124,58,237,0.12)] text-[#A78BFA]",
        secondary:
          "border-white/10 bg-white/[0.05] text-white/50",
        success:
          "border-emerald-400/25 bg-emerald-500/10 text-emerald-400",
        warning:
          "border-amber-400/25 bg-amber-500/10 text-amber-400",
        destructive:
          "border-red-400/25 bg-red-500/10 text-red-400",
        outline: "border-white/10 bg-transparent text-white/70",
        ai: "border-[rgba(124,58,237,0.30)] bg-[rgba(124,58,237,0.12)] text-[#A78BFA]",
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
