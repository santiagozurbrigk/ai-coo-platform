import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-medium transition-all duration-premium ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-button border border-white/10 bg-gradient-to-b from-[#8B5CF6] to-[#6D28D9] text-white shadow-[0_4px_16px_rgba(123,63,242,0.35),0_0_20px_rgba(123,63,242,0.15)] hover:-translate-y-px hover:brightness-[1.08] hover:shadow-[0_6px_24px_rgba(123,63,242,0.45),0_0_24px_rgba(123,63,242,0.2)]",
        destructive:
          "rounded-button border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15",
        outline:
          "rounded-button border border-input bg-background text-muted-foreground hover:border-white/16 hover:bg-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75 dark:hover:border-white/16 dark:hover:bg-white/[0.06]",
        secondary:
          "rounded-button border border-input bg-background text-muted-foreground hover:bg-muted dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75 dark:hover:border-white/16 dark:hover:bg-white/[0.06]",
        ghost:
          "rounded-button border border-primary/30 bg-transparent text-primary hover:bg-primary/10 dark:border-[rgba(139,92,246,0.30)] dark:text-[#A78BFA] dark:hover:bg-[rgba(139,92,246,0.08)]",
        link: "text-primary underline-offset-4 hover:underline dark:text-[#A78BFA]",
        glass:
          "glass rounded-button text-foreground dark:hover:border-white/[0.16]",
      },
      size: {
        default: "h-9 px-[18px] py-[9px]",
        sm: "h-8 rounded-button px-3 text-xs",
        lg: "h-11 rounded-button px-8",
        icon: "h-8 w-8 rounded-button",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
