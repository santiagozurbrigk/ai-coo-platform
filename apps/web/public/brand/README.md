# Assets de marca — Limitless

Next.js sirve estos archivos desde la raíz del sitio. Las rutas se consumen
desde `apps/web/lib/brand.ts` (`brandAssets`) — no hardcodear rutas en JSX.

## Archivos esperados

| Archivo | Uso | Recomendado |
|---------|-----|-------------|
| `logo.png` | Sidebar, landing, login, menú móvil (logo completo) | PNG con fondo transparente |
| `logo-icon.png` | Isotipo — sidebar colapsada, favicon compacto | Cuadrado, 64×64 px o más |
| `favicon.ico` | Pestaña del navegador (en `public/`, no acá) | 32×32 o multi-size |

## Rutas en la app

- Logo completo: `/brand/logo.png` → `brandAssets.logo`
- Isotipo: `/brand/logo-icon.png` → `brandAssets.logoIcon`
- Favicon: `/favicon.ico` → `brandAssets.favicon`

## Pendiente de reemplazo

Los archivos actuales son de la identidad anterior (OTC):

- `logo.png` — 1.3 MB, conviene optimizar al reemplazar
- `ISOTIPO OTC BLANCO.png` / `ISOTIPO OTC NEGRO.png` — sin usar en código
- `apps/web/app/icon.svg` — favicon SVG dibujado a mano, con el violeta legado

Al cargar los assets de Limitless: reemplazar `logo.png`, agregar
`logo-icon.png` y apuntar `brandAssets.logoIcon` a él en `lib/brand.ts`
(hoy apunta a `logo.png` como fallback).
