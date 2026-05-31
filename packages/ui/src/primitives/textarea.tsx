import * as React from "react";
import { cn } from "../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-[10px] border border-input bg-background px-[14px] py-[10px] text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 ease-out focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/85 dark:placeholder:text-white/25 dark:focus-visible:border-[rgba(124,58,237,0.50)] dark:focus-visible:bg-[rgba(124,58,237,0.05)] dark:focus-visible:ring-[rgba(124,58,237,0.12)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
