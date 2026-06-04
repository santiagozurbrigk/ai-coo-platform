# Fixes pendientes — auditoría mayo 2026

Auditoría previa al módulo Producto. **No implementados** — solo registro por prioridad.

## CRÍTICOS (rompen funcionalidad)

- **Detalle de cliente → 404 con Supabase:** `apps/web/app/(platform)/clients/[id]/page.tsx` llama `notFound()` antes de que termine `clientsLoading`; con lista vacía inicial el deep link falla.
- **Sidebar desktop en móvil:** `layouts/three-column-layout.tsx` muestra el sidebar fijo sin `hidden md:flex`, comprimiendo el contenido junto al drawer móvil.

## VISUALES (rompen diseño)

- **Doble título (topbar + PageHeader):** muchas páginas repiten el título que ya muestra `app-topbar.tsx` vía `page-meta.ts`.
- **Orden de menú inconsistente:** `sidebar-modules.ts` vs `routes/navigation.ts` (command palette / breadcrumbs) no coinciden en orden ni hijos de Finanzas.
- **Topbar genérico «AI COO»:** rutas dinámicas sin entrada en `page-meta.ts` (`/clients/[id]`, formularios, rutas del agente).
- **Bandeja ventas sin panel análisis en tablet:** `sales-inbox-layout.tsx` oculta el panel hasta `lg`.
- **Punto verde siempre activo en perfil del sidebar:** `sidebar-profile-area.tsx` sin estado real.
- **Campana de notificaciones decorativa:** `app-topbar.tsx` muestra badge sin funcionalidad.
- **Fondo base vs spec:** docs citan `#080810`, `globals.css` usa `#0d0d12`.
- **Super Admin:** etiquetas en inglés mezcladas con UI en español.

## MENORES (mejoras o inconsistencias)

- **Context panel no montado** en `platform-shell.tsx` (componente existe, no integrado).
- **`nav-group.tsx` sin uso** (código legacy tras sidebar de dos niveles).
- **Footer sidebar «Fase 0 · Prototipo»** desactualizado respecto a Phase 1.
- **Instagram / integraciones:** flujos mock y toast «prototipo» en `integration-card.tsx`.
- **Team Inputs:** pestaña formulario y audio marcadas como pendientes/mock.
- **`platformNavigation` desincronizado** del sidebar real (solo breadcrumbs y command palette).
