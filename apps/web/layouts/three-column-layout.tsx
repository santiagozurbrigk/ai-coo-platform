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
    <div className={cn("app-shell relative", className)} data-layout="app-shell">
      <div className="app-ambient" aria-hidden="true" />
      <div
        className="relative z-[1] hidden min-h-0 shrink-0 self-stretch border-r border-border md:flex"
        data-slot="sidebar"
      >
        {sidebar}
      </div>

      <MainContainerPanel className="relative z-[1] min-h-0 flex-1 self-stretch">
        {children}
      </MainContainerPanel>

      {overlay}
    </div>
  );
}
