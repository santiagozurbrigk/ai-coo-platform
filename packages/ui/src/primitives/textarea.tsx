import * as React from "react";
import { cn } from "../lib/utils";

const textareaSurfaceClass =
  "rounded-input border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-premium ease-premium focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:hover:border-white/[0.16] dark:focus-visible:border-[#8B5CF6] dark:focus-visible:ring-[rgba(139,92,246,0.15)]";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full",
        textareaSurfaceClass,
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
