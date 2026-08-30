/**
 * Estilo de navegación de la plataforma — experimento reversible.
 *
 * `NEXT_PUBLIC_NAV_STYLE=notch` activa la barra superior de islas (notch nav)
 * en lugar del sidebar. Cualquier otro valor —o la ausencia de la variable—
 * mantiene el sidebar clásico, que sigue intacto en el código.
 *
 * Para volver atrás: borrar la variable en Vercel y redeployar. No hay que
 * revertir código.
 *
 * Es NEXT_PUBLIC_* porque la decisión se toma en componentes cliente y el
 * valor se inyecta en build — cambiarla requiere redeploy, no alcanza con
 * editar la env en caliente.
 */
export type NavStyle = "sidebar" | "notch";

export const NAV_STYLE: NavStyle =
  process.env.NEXT_PUBLIC_NAV_STYLE === "notch" ? "notch" : "sidebar";
