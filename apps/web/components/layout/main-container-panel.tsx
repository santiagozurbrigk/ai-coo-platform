"use client";

import type { ReactNode } from "react";
import { MainContainerBackground } from "./main-container-background";

/** Contenedor principal flotante con patrón de fondo y contenido encima. */
export function MainContainerPanel({ children }: { children: ReactNode }) {
  return (
    <div className="main-container" data-slot="main-panel">
      <MainContainerBackground />
      <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
