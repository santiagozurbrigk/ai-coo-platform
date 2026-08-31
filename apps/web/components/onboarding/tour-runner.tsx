"use client";

/**
 * Dispara el tour contextual la primera vez que alguien entra a un módulo.
 *
 * Tres reglas que no son obvias:
 *
 * 1. **Los pasos cuyo elemento no está en el DOM se descartan.** Una pantalla
 *    vacía no tiene grilla, y un tour que apunta a algo inexistente muestra un
 *    recuadro flotando en el medio de la nada.
 * 2. **Se espera a que el ancla aparezca** antes de decidir. La página se pinta
 *    en el servidor pero varios módulos montan su contenido en un efecto, así
 *    que mirar el DOM en el primer render diría que no hay nada.
 * 3. **Se marca visto cuando lo terminan o lo cierran**, pero *no* cuando se
 *    desmonta por navegar a otro módulo. La limpieza del efecto también llama
 *    a `destroy()`, y sin distinguir los dos casos alguien que abre la pantalla
 *    y se va a otro lado quemaría el tour sin haberlo leído. Cerrarlo con la X
 *    o con Escape sí cuenta: ahí la decisión fue del usuario.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useOnboarding } from "@/providers/onboarding-provider";
import { usePermissions } from "@/providers/permissions-provider";
import { markTourSeenAction } from "@/app/onboarding/actions";
import { tourForPath, type Tour } from "@/lib/onboarding/tours";

/** Cuánto esperamos a que el módulo termine de montar antes de rendirnos. */
const ANCHOR_TIMEOUT_MS = 4000;
const POLL_MS = 150;

function anchorSelector(anchor: string): string {
  return `[data-tour="${anchor}"]`;
}

function presentSteps(tour: Tour) {
  return tour.steps.filter((step) =>
    document.querySelector(anchorSelector(step.anchor))
  );
}

export function TourRunner() {
  const pathname = usePathname();
  const { hasSeenTour, markTourSeenLocally } = useOnboarding();
  const { isFounder, modules } = usePermissions();
  const activeDriver = useRef<Driver | null>(null);

  useEffect(() => {
    const tour = tourForPath(pathname);
    if (!tour) return;
    if (hasSeenTour(tour.id)) return;

    // Alias local para que el cierre no tenga que re-verificar el undefined.
    const active: Tour = tour;

    // Un tour de un módulo que el usuario no puede ver no se ofrece.
    const allowed = isFounder || (modules[tour.permissionId] ?? "none") !== "none";
    if (!allowed) return;

    let cancelled = false;
    let elapsed = 0;
    /** El desmontaje destruye el tour sin que el usuario haya decidido nada. */
    let destroyedByUnmount = false;

    function finish(tourId: Tour["id"]) {
      markTourSeenLocally(tourId);
      void markTourSeenAction(tourId);
    }

    function start() {
      const steps = presentSteps(active);
      if (steps.length === 0) return;

      const instance = driver({
        showProgress: steps.length > 1,
        overlayColor: "rgba(0, 0, 0, 0.65)",
        nextBtnText: "Siguiente",
        prevBtnText: "Atrás",
        doneBtnText: "Entendido",
        progressText: "{{current}} de {{total}}",
        popoverClass: "otc-tour",
        steps: steps.map((step) => ({
          element: anchorSelector(step.anchor),
          popover: { title: step.title, description: step.description },
        })),
        // Cubre las tres salidas: terminarlo, cerrarlo con la X y el Escape.
        onDestroyed: () => {
          if (destroyedByUnmount) return;
          finish(active.id);
        },
      });

      activeDriver.current = instance;
      instance.drive();
    }

    const timer = setInterval(() => {
      if (cancelled) return;
      elapsed += POLL_MS;

      if (presentSteps(active).length > 0) {
        clearInterval(timer);
        start();
        return;
      }

      if (elapsed >= ANCHOR_TIMEOUT_MS) {
        clearInterval(timer);
        /*
         * Ninguna ancla apareció. No se marca como visto: puede ser una
         * pantalla vacía que mañana sí tenga contenido, y en ese caso el tour
         * todavía tiene algo que mostrar.
         */
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      destroyedByUnmount = true;
      clearInterval(timer);
      activeDriver.current?.destroy();
      activeDriver.current = null;
    };
    // `hasSeenTour` cambia de identidad en cada render del provider; el
    // pathname es lo que decide si hay que volver a evaluar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isFounder, modules]);

  return null;
}
