/**
 * Cookie que recuerda qué negocio del portfolio está mirando una cuenta holding.
 *
 * Cambió de nombre con el rebranding a Limitless. La anterior se sigue leyendo
 * como respaldo para que nadie que ya estaba dentro de un negocio quede
 * devuelto a la vista del holding al desplegar. Se puede borrar el respaldo
 * cuando haya pasado la ventana de 24 h de vigencia de la cookie vieja.
 */
export const ACTIVE_ORG_COOKIE = "limitless_active_org";

/** @deprecated Nombre previo al rebranding. Sólo para lectura. */
export const LEGACY_ACTIVE_ORG_COOKIE = "otc_active_org";

type CookieReader = {
  get(name: string): { value?: string } | undefined;
};

/** Lee el negocio activo aceptando el nombre nuevo y el legado. */
export function readActiveOrgCookie(store: CookieReader): string | undefined {
  return (
    store.get(ACTIVE_ORG_COOKIE)?.value ??
    store.get(LEGACY_ACTIVE_ORG_COOKIE)?.value
  );
}
