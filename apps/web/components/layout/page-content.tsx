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
    <main
      className={cn(
        fullWidth ? "page-content-full" : "page-content",
        "min-w-0",
        className
      )}
    >
      {children}
    </main>
  );
}
