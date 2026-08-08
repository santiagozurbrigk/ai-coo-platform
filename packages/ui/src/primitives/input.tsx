import * as React from "react";
import { cn } from "../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[10px] border border-input bg-background px-[14px] py-[10px] text-sm text-foreground shadow-none transition-all duration-150 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-input dark:text-white/85 dark:placeholder:text-white/25 dark:focus-visible:border-[rgba(124,58,237,0.50)] dark:focus-visible:bg-[rgba(124,58,237,0.05)] dark:focus-visible:ring-[rgba(124,58,237,0.12)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
