# Fixes pendientes — auditoría mayo 2026

Estado: **implementados** en commit de fixes de plataforma (mayo 2026).

## CRÍTICOS (rompen funcionalidad)

- [x] **Detalle de cliente → 404 con Supabase:** espera `clientsLoading` antes de `notFound()`.
- [x] **Sidebar desktop en móvil:** `three-column-layout` oculta sidebar con `hidden md:flex`.

## VISUALES (rompen diseño)

- [x] **Doble título (topbar + PageHeader):** `PageHeader` sin título duplicado en páginas con topbar.
- [x] **Orden de menú inconsistente:** `platformNavigation` derivado de `platformSidebarNav`.
- [x] **Topbar genérico «AI COO»:** rutas dinámicas en `page-meta.ts` (clientes, formularios, agente).
- [x] **Bandeja ventas sin panel análisis en tablet:** panel visible desde `md`.
- [x] **Punto verde siempre activo en perfil del sidebar:** indicador eliminado.
- [x] **Campana de notificaciones decorativa:** botón deshabilitado sin badge falso.
- [x] **Fondo base vs spec:** dark `#080810` y `--color-surface-1` alineados.
- [x] **Super Admin:** etiquetas de navegación en español.

## MENORES (mejoras o inconsistencias)

- [x] **Context panel no montado:** `ContextPanelDrawer` en `platform-shell`.
- [x] **`nav-group.tsx` sin uso:** archivo eliminado.
- [x] **Footer sidebar «Fase 0 · Prototipo»:** actualizado a «Fase 1 · Beta».
- [x] **Instagram / integraciones:** copy sin «prototipo Fase 0» en toasts.
- [x] **Team Inputs:** copy de pestañas pendientes actualizado.
- [x] **`platformNavigation` desincronizado:** `buildPlatformNavigation()` desde sidebar.
