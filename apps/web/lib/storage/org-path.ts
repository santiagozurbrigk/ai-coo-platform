/**
 * Rutas de Storage que llegan del navegador.
 *
 * El flujo de subida es en dos pasos: el servidor arma la ruta
 * (`${organizationId}/...`) y firma la subida, y después el cliente "finaliza"
 * mandando esa ruta de vuelta. Como las lecturas, firmas y borrados posteriores
 * van con service role, una ruta ajena aceptada en el paso 2 daba acceso a
 * archivos de otra org. Toda ruta que vuelve del cliente pasa por acá.
 */
export function isOrgStoragePath(path: unknown, organizationId: string): path is string {
  if (typeof path !== "string" || !organizationId) return false;
  if (!path.startsWith(`${organizationId}/`)) return false;
  // Sin segmentos que suban de carpeta ni vacíos: `org/../otra-org/x`.
  return path
    .slice(organizationId.length + 1)
    .split("/")
    .every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
}

export function assertOrgStoragePath(path: unknown, organizationId: string): string {
  if (!isOrgStoragePath(path, organizationId)) {
    throw new Error("Ruta de almacenamiento inválida");
  }
  return path;
}
