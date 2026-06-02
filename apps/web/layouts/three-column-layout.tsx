import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";
import { MainContainerPanel } from "@/components/layout/main-container-panel";

/**
 * Shell flotante: sidebar sobre el fondo + panel principal redondeado.
 */
export function ThreeColumnLayout({
  sidebar,
  children,
  overlay,
  className,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  overlay?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("app-shell", className)} data-layout="app-shell">
      <div className="flex h-full min-h-0 shrink-0 md:flex" data-slot="sidebar">
        {sidebar}
      </div>

      <MainContainerPanel>{children}</MainContainerPanel>

      {overlay}
    </div>
  );
}
