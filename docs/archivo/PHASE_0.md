# Phase 0 — Prototipo visual

**Estado:** ✅ **CERRADA** — aprobada por founder (mayo 2026)  
**Tag git sugerido:** `phase-0-demo-ready`  
**Idioma UI:** Español  
**Backend:** Ninguno (mock data + React Context) — sustituido en Phase 1

**Documento maestro del estado actual:** [`ESTADO_PLATAFORMA.md`](./ESTADO_PLATAFORMA.md)

## Objetivo

Un founder puede navegar el producto y entender en minutos qué hace, por qué importa y cómo fluye la operación — sin base de datos ni integraciones reales.

## Entregables por sub-fase

| Fase | Entregable |
|------|------------|
| 0.1 | Monorepo, rutas, módulos, redirects |
| 0.2 | Design system `@ai-coo/ui`, `/design-system` |
| 0.3 | Layout 3 columnas (sidebar, main, contexto) |
| 0.4 | Navegación, breadcrumbs, founder / Super Admin |
| 0.5 | Pantallas con mocks |
| 0.6 | Español + pulido visual |
| 0.7 | Toasts, Ctrl+K, flujos cruzados |
| 0.8 | `/demo`, checklist, 404 |
| 0.9 | Onboarding wizard + bienvenida cinematográfica |
| 0.10 | Ventas (inbox, métricas, closing), clientes, operaciones |
| 0.11 | **Finanzas** + **Gastos** |
| 0.12 | **Marketing** (módulo dedicado, ex–Marketing Insights) |
| 0.13 | Rediseño visual **VisionOS** (glass + púrpura `#7C3AED`) |
| 0.14 | Sparklines en metric cards, calendario Closing, pulido tokens gráficos |

## Cómo ejecutar

```bash
pnpm install
npx pnpm@9.15.0 --filter @ai-coo/web dev
```

| URL | Uso |
|-----|-----|
| http://localhost:3000 | Inicio |
| http://localhost:3000/login | Entrada cliente |
| http://localhost:3000/onboarding | Wizard primer acceso |
| http://localhost:3000/dashboard | **Panel General** |
| http://localhost:3000/demo | Recorrido guiado |
| http://localhost:3000/superadmin/login | Super Admin |

## Navegación principal

```
Panel General
Finanzas → Gastos
Marketing → Overview · Contenido · Conexión con Ventas
Ventas → Bandeja · Métricas · Closing
Operaciones → Overview · SOPs · Team Inputs
Clientes
Base de conocimiento
Integraciones
Equipo
Configuración (pie del sidebar)
```

## Rutas clave

| Módulo | Ruta |
|--------|------|
| Panel General | `/dashboard` |
| Finanzas | `/finance` |
| Gastos | `/finance/expenses` |
| Marketing | `/marketing` |
| Contenido | `/marketing/content` |
| Detalle publicación | `/marketing/content/[id]` |
| Conexión con ventas | `/marketing/sales-connection` |
| Bandeja | `/sales/inbox` |
| Métricas ventas | `/sales/metrics` |
| Closing | `/sales/closing` |
| Clientes | `/clients` |
| Cliente | `/clients/[id]` |
| Operaciones | `/operations/overview` |
| Team Inputs | `/operations/team-inputs` |
| Integraciones | `/integrations` |

**Legacy:** `/sales/marketing-insights/*` redirige a `/marketing/*`.

## Checklist de validación — completado

- [x] Recorrido `/demo` (~15 min con módulos nuevos)
- [x] Panel General: métricas (con sparklines), riesgos, CTAs
- [x] Finanzas: plataformas, métricas, gráficos (tokens unificados)
- [x] Gastos: 3 secciones + resumen
- [x] Marketing: overview, contenido, detalle, conexión ventas
- [x] Ventas: bandeja + etiquetas + journey inline
- [x] Métricas: rendimiento por closer
- [x] Closing: calendario + modal pago → cliente creado
- [x] Integraciones: Instagram (mock) + conectar
- [x] Ctrl+K y breadcrumbs en módulos nuevos
- [x] Super Admin: orgs, cerebro IA
- [x] UI VisionOS consistente (glass, púrpura)
- [x] Aprobación founder para Phase 1

## Qué NO incluye Phase 0

- Supabase / PostgreSQL / RLS
- Autenticación real
- Claude / RAG / colas en producción
- OAuth real (Instagram, ManyChat, Calendly…)
- API routes de negocio

## Siguiente paso: Phase 1 (en curso)

Ver [`PHASE_1.md`](./PHASE_1.md), `PROJECT_CONSTITUTION.md`, `SYSTEM_ARCHITECTURE.md` y `AI_ENGINE_SPEC.md`.

Fase 0 cerrada — desarrollo activo en backend, auth e integraciones.
