# Logo AI COO

Coloca aquí los archivos del logo. Next.js los sirve desde la raíz del sitio.

## Archivos esperados

| Archivo | Uso | Recomendado |
|---------|-----|-------------|
| `logo.png` | Sidebar, landing, menú móvil (logo completo) | PNG, fondo transparente recomendado |
| `logo-icon.png` | Opcional: solo isotipo / favicon compacto | Cuadrado, 32×32 o 64×64 px |
| `favicon.ico` | Pestaña del navegador (en `public/`, no en `brand/`) | 32×32 o multi-size |

Si solo tienes un PNG, guárdalo como `logo.png` y avisa para ajustar la extensión en código.

## Rutas en la app

- Logo completo: `/brand/logo.png`
- Isotipo: `/brand/logo-icon.png` (opcional; si falta, se usa `logo.png`)
- Favicon: `/favicon.ico`
