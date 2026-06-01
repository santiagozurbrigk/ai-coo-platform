# Logo AI COO

Coloca aquí los archivos del logo. Next.js los sirve desde la raíz del sitio.

## Archivos esperados

| Archivo | Uso | Recomendado |
|---------|-----|-------------|
| `logo.png` | Login, landing (logo completo) | PNG, fondo transparente recomendado |
| `ISOTIPO OTC NEGRO.png` | Sidebar / isotipo en **tema claro** | PNG, fondo transparente |
| `ISOTIPO OTC BLANCO.png` | Sidebar / isotipo en **tema oscuro** | PNG, fondo transparente |
| `logo-icon.png` | Opcional: alias legacy | Cuadrado, 32×32 o 64×64 px |
| `favicon.ico` | Pestaña del navegador (en `public/`, no en `brand/`) | 32×32 o multi-size |

Si solo tienes un PNG, guárdalo como `logo.png` y avisa para ajustar la extensión en código.

## Rutas en la app

- Logo completo: `/brand/logo.png`
- Isotipo claro: `/brand/ISOTIPO%20OTC%20NEGRO.png`
- Isotipo oscuro: `/brand/ISOTIPO%20OTC%20BLANCO.png`
- Favicon: `/favicon.ico`
