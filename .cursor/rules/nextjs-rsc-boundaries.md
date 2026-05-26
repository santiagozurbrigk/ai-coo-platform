# Next.js App Router — límites RSC (obligatorio)

Aplica en **toda** tarea que toque `apps/web/components` o `apps/web/app`.

## Causa del error recurrente

`TypeError: __webpack_modules__[moduleId] is not a function` aparece cuando Webpack mezcla módulos de servidor y cliente en el mismo **barrel** (`index.ts`) o cuando una **página/layout de servidor** importa un barrel que también reexporta componentes `"use client"`.

## Reglas

1. **`components/shared/index.ts`** — solo exports sin `"use client"`. Nunca añadir `ModuleSubnav`, hooks, `framer-motion`, etc.
2. **`components/shared/client.ts`** — único barrel para exports `"use client"` de shared.
3. **Componentes `"use client"`** — importar shared con ruta de archivo (`@/components/shared/panel`) o `@/components/shared/client`, **nunca** `@/components/shared` (index).
4. **`app/**/page.tsx` y `layout.tsx` (servidor)** — importar el componente por archivo (`.../marketing-dashboard`), **no** desde `@/components/<módulo>` si ese `index.ts` reexporta clientes.
5. Tras refactors grandes de módulos: borrar `apps/web/.next` y reiniciar `pnpm dev`.

Documentación: `apps/web/components/shared/README.md`

ESLint bloquea violaciones (`no-restricted-imports`).

## Pestañas por hash en la misma ruta

No uses `<Link href="/equipo#roles">` a mano para cambiar pestañas en la misma página: Next.js no dispara `hashchange`. Usa `ModuleSubnav`, `HashTabLink` o `pushHashTab` (`lib/hooks/use-hash-tab.ts`).
