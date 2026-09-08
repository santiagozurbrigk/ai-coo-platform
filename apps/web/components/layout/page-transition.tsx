"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";

/**
 * Entrada suave al cambiar de ruta.
 *
 * ⚠️ La animación es **sólo de opacidad**, y no puede volver a tener
 * `transform`. Un elemento con `transform` —incluso la matriz identidad que
 * Chrome deja computada después de una animación— pasa a ser el **bloque
 * contenedor** de todos sus descendientes `position: fixed`. Como este wrapper
 * envuelve la página entera, con `animate-fade-in` (que anima `translateY`)
 * cualquier panel fijo de adentro se posicionaba contra este div en vez de
 * contra el viewport: se corría del borde, perdía la altura completa y quedaba
 * asomando fuera de alcance, sin forma de verlo ni con scroll.
 *
 * Los diálogos de Radix no se veían afectados porque hacen portal a `body`.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn(
        "flex min-h-0 flex-1 flex-col motion-safe:animate-page-fade-in"
      )}
    >
      {children}
    </div>
  );
}
