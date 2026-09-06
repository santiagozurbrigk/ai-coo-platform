"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TooltipProvider } from "@ai-coo/ui";
import { PlatformNotchNav } from "@/components/navigation/notch-nav/platform-notch-nav";
import { PlatformDocumentTitle } from "@/components/brand";
import { HoldingViewingBanner } from "@/components/holding/holding-viewing-banner";
import { useHoldingSession } from "@/components/holding/holding-platform-provider";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { isFullBleedPath } from "@/lib/navigation/full-bleed";

/**
 * Shell de plataforma: barra superior de islas (notch nav).
 *
 * Reemplazó al sidebar el 2026-08-30 tras validarse el experimento. La
 * navegación se deriva de `lib/navigation/sidebar-modules.ts`, que sigue siendo
 * la única fuente de verdad de módulos, permisos y add-ons.
 *
 * El contenido va directo sobre el fondo de la app: no hay panel/tarjeta
 * envolviendo la página. `MainContainerPanel` sigue existiendo porque lo usa
 * `three-column-layout` (super-admin), pero la plataforma ya no lo usa.
 */
export function PlatformShell({ children }: { children: ReactNode }) {
  const { isHolding, viewingBusiness } = useHoldingSession();
  const pathname = usePathname();
  // Vista holding sin negocio activo: sin items de navegación (como el
  // sidebar, que directamente no se muestra en ese estado)
  const showItems = !isHolding || Boolean(viewingBusiness);
  const fullBleed = isFullBleedPath(pathname);
  const { title, subtitle, back } = getPageMeta(pathname);

  return (
    <TooltipProvider>
      <PlatformDocumentTitle />
      <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-background">
        <PlatformNotchNav showItems={showItems} />
        <HoldingViewingBanner />
        {/*
          El título de página va fuera del contenedor de scroll para que quede
          fijo mientras el contenido corre por debajo. El padding horizontal
          replica el de `.page-content` para que el h1 alinee con el contenido.
        */}
        {!fullBleed && (
          <div className="shrink-0 border-b border-border/60 px-[var(--space-page-x)] pb-3 pt-5 lg:px-[var(--space-page-x-lg)]">
            {/*
              ⭐ La vuelta sale del mismo mapa que el título, así que una
              pantalla nueva la tiene sin que nadie se acuerde de ponerla. Las
              de primer nivel no muestran nada: una flecha que no lleva a
              ningún lado es peor que ninguna.
            */}
            {back && (
              <Link
                href={back.href}
                className="mb-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {back.label}
              </Link>
            )}
            <h1 className="text-lg font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        <div className="main-container-scroll flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
