"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Vuelve a pedir los datos del servidor sin que haya que apretar F5.
 *
 * Las páginas de la plataforma se renderizan en el servidor y reciben los datos
 * como props: `router.refresh()` los vuelve a pedir sin perder el estado del
 * cliente ni la posición del scroll. Después de una mutación propia eso ya se
 * hace solo, pero **no cuando el cambio viene de afuera de la aplicación** —el
 * bot de Discord escribiendo una vinculación, por ejemplo—. Ahí la pantalla se
 * queda vieja y no hay nada que le avise.
 *
 * Dos disparadores, y el primero es el que importa:
 *
 * 1. **Al volver a la pestaña.** El recorrido real es irse a Discord, hacer algo
 *    y volver: refrescar justo ahí resuelve el caso completo y no cuesta nada
 *    mientras la pestaña está en segundo plano.
 * 2. **Cada tanto, sólo con la pestaña visible.** Cubre quedarse mirando la
 *    pantalla esperando que algo aparezca.
 *
 * Con la pestaña oculta no se pide nada: una pestaña olvidada en segundo plano
 * no debería consultar al servidor toda la noche.
 */
export function useAutoRefresh(intervalMs = 15_000, enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const refrescarSiVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    const timer = window.setInterval(refrescarSiVisible, intervalMs);
    document.addEventListener("visibilitychange", refrescarSiVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refrescarSiVisible);
    };
  }, [router, intervalMs, enabled]);
}
