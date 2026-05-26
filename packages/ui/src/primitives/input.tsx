import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[10px] border border-white/10 bg-white/[0.05] px-[14px] py-[10px] text-sm text-white/85 shadow-none transition-all duration-150 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/25 focus-visible:border-[rgba(124,58,237,0.50)] focus-visible:bg-[rgba(124,58,237,0.05)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[rgba(124,58,237,0.12)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
