import * as React from "react";
import { cn } from "../lib/utils";

const inputSurfaceClass =
  "rounded-input border border-input bg-background px-4 text-sm text-foreground shadow-none transition-all duration-premium ease-premium file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:hover:border-white/[0.16] dark:focus-visible:border-[#8B5CF6] dark:focus-visible:ring-[rgba(139,92,246,0.15)]";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full py-2.5",
        inputSurfaceClass,
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
