# ADR-011 — Notch nav como única navegación de la plataforma (se eliminó el sidebar)

- **Estado:** Aceptada
- **Fecha:** 2026-08-30 — `docs/historial/CHANGES-2026-07-a-08.md` "NAV-NOTCH definitiva: la notch nav reemplaza al
  sidebar" (commit `64ac0a18`, PR #31). Experimento previo detrás de flag el mismo día: "NAV-NOTCH: navegación
  superior de islas (notch nav) detrás de flag" (`fcafaff6`, PR #28).

## Contexto

Desde mayo la plataforma navegaba con un sidebar lateral (dos niveles, colapsable, perfil abajo; commits de
2026-05-31 a 2026-08-05). Santiago quiso "probar este estilo de navegación como innovación de producto, con vuelta
atrás garantizada si no convence": una barra superior de tres islas (logo · módulos · acciones), inspirada en un
componente de 21st.dev relevado en `docs/diseno/componentes-21st.md`.

## Decisión

- **La notch nav es la única navegación de `(platform)`.** Se borraron `app-sidebar`, `sidebar-profile-area`,
  `sidebar-footer`, `sidebar-navigation`, `app-topbar`, `breadcrumbs` y el flag `NEXT_PUBLIC_NAV_STYLE`.
  Motivo escrito: "Decisión de Santiago tras ver la barra funcionando. Cierra `[NAV-3]` de PENDIENTES: no mantener
  dos navegaciones en paralelo" (el `[NAV-3]` de entonces; hoy ese ID nombra otro ítem, la etiqueta "Fase 1 · Beta").
- **Una sola fuente de verdad para módulos, permisos y add-ons:** `lib/navigation/sidebar-modules.ts`
  (`buildPlatformSidebarNav()`); la barra se deriva de ahí. Para sumar un módulo se toca ese config, nunca la barra
  (`CLAUDE.md` § 7). Nada de subnavs horizontales por módulo: los módulos con hijos abren un dropdown.
- Antes de borrar se cerró la paridad: menú de perfil (con cerrar sesión), badge de clientes y "Mi Holding".
- Se conservan los componentes de sidebar que usan el **super admin** y el drawer mobile.

## Alternativas consideradas

- **Mantener las dos navegaciones con un flag** (estado del experimento): descartado para no mantener dos.
- **Flag por usuario en vez de por entorno** (durante el experimento): se eligió por entorno porque "la vuelta atrás
  es una decisión de producto, no per-user", sin estados mixtos ni flash de hidratación.
- **Bajar el componente de 21st.dev tal cual**: no se pudo (código detrás de login) y había que reescribirle clases,
  colores y routing; se reimplementó sobre framer-motion, Lucide y los tokens propios.
- **Revertir**: "ya no hay sidebar como alternativa: revertir es `git revert` del commit".

## Consecuencias

**Positivas**
- Un solo shell (`PlatformShell`) y una sola configuración de menú.
- Más ancho útil para las pantallas full-bleed (agente, bandeja, producto).

**Negativas / deuda**
- Con ~10 entradas raíz, los labels sólo entran en pantallas `xl+`; debajo quedan iconos con `title`.
- Se perdió el acceso visible a la búsqueda (queda ⌘K) y la etiqueta "Fase 1 · Beta".
- `sidebar-modules.ts` conserva un nombre que ya no describe lo que hace (`[NAV-2]`; tests pendientes `[T-20]`).
- Validación con sesión real pendiente (`[NAV-1]`); la paleta ⌘K no filtra por permisos ni add-ons
  (`[NAV-PALETA-PERMISOS]`); un member sin rol no ve ningún ítem (`[PERMISOS-SIN-ROL-NAV]`).
- La navegación es visibilidad, no permiso: esconder un ítem no protege la ruta (ADR-005).

## Evidencia

- `apps/web/components/navigation/notch-nav/{notch-nav,platform-notch-nav,notch-profile-menu}.tsx`,
  `apps/web/components/layout/platform-shell.tsx`, `apps/web/lib/navigation/sidebar-modules.ts`.
- `docs/historial/CHANGES-2026-07-a-08.md` 2026-08-30 (las dos entradas NAV-NOTCH) y 2026-08-31 "Sacar el panel
  contenedor y fijar Embudos en la navegación".
- `docs/diseno/ui-y-navegacion.md`; `CLAUDE.md` § 7.
