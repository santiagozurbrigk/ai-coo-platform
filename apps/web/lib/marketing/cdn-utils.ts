/**
 * Utilidades puras para detección de URLs de CDN efímeras de Instagram.
 * Sin dependencias de servidor — importable en Client Components y Server Components.
 */

/**
 * Detecta si una URL es efímera del CDN de Instagram (expiran en ~1-2hs).
 * Usado para evitar guardar en DB o renderizar URLs que van a expirar.
 */
export function isInstagramCdnUrl(url: string): boolean {
  return (
    url.includes("scontent") ||
    url.includes("cdninstagram.com") ||
    url.includes("fbcdn.net")
  );
}

/**
 * Devuelve la URL de thumbnail solo si es segura de mostrar (no es CDN efímero).
 * Usar esta función en lugar de acceder a `thumbnail_url` directamente en componentes.
 *
 * Retorna null si la URL es efímera (ya expiró o expirará pronto) → el componente
 * debe mostrar un fallback icon en su lugar.
 */
export function safeThumbnailUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (isInstagramCdnUrl(url)) return null;
  return url;
}
