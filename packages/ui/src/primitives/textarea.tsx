import * as React from "react";
import { cn } from "../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-[10px] border border-white/10 bg-white/[0.05] px-[14px] py-[10px] text-sm text-white/85 placeholder:text-white/25 transition-all duration-150 ease-out focus-visible:border-[rgba(124,58,237,0.50)] focus-visible:bg-[rgba(124,58,237,0.05)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[rgba(124,58,237,0.12)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
