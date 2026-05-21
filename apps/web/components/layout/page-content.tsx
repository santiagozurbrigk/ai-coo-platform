import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";

export function PageContent({
  children,
  className,
  fullWidth,
}: {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        fullWidth ? "p-0" : "p-6 lg:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
