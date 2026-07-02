"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn(
        "flex min-h-0 flex-1 flex-col motion-safe:animate-fade-in"
      )}
    >
      {children}
    </div>
  );
}
