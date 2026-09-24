# Componentes compartidos (`shared`)

## Regla RSC (obligatoria)

| Archivo | Uso |
|--------|-----|
| `index.ts` | Solo exports **sin** `"use client"`. ESLint prohíbe importarlo (`@/components/shared`) en todo `apps/web`: usá el import directo por archivo. |
| `client.ts` | Solo exports con `"use client"` (`ModuleSubnav`, `HashTabLink`, `ToastViewport`). |
| `@/components/shared/<archivo>` | Forma **recomendada** en componentes `"use client"`. |

**Nunca** exportes un componente `"use client"` desde `index.ts`. Rompe el manifest de React Server Components y provoca:

`TypeError: __webpack_modules__[moduleId] is not a function`

**Nunca** importes desde el barrel `@/components/marketing-insights` (ni otros módulos con clientes) en `app/**/page.tsx` o `layout.tsx` de servidor. Importa el archivo del componente directamente.

ESLint (`no-restricted-imports` en `apps/web/eslint.config.mjs`) bloquea el barrel `@/components/shared` en todo `apps/web` y el de `@/components/marketing-insights` en `app/**`. Lo demás (qué se exporta desde cada barrel) no lo chequea.

## Pestañas por hash (`#tab`)

En App Router, `<Link href="/ruta#tab">` en la **misma** ruta no dispara `hashchange`. Usar:

- `ModuleSubnav` (ya lo gestiona), o
- `HashTabLink` desde `@/components/shared/client`, o
- `pushHashTab(href)` en un `onClick` con `preventDefault`.
