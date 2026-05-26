# Phase 0 — Prototipo visual

**Estado:** ✅ Prototipo demo-ready (Fase 0.8+ extensiones)  
**Idioma UI:** Español  
**Backend:** Ninguno (mock data + React Context)

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
Clientes
Operaciones → Overview · SOPs · Team Inputs
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

## Checklist de validación (antes de Phase 1)

- [ ] Recorrido `/demo` (~15 min con módulos nuevos)
- [ ] Panel General: métricas, riesgos, CTAs
- [ ] Finanzas: plataformas, 6 métricas, gráficos
- [ ] Gastos: 3 secciones + resumen
- [ ] Marketing: overview, contenido, detalle, conexión ventas
- [ ] Ventas: bandeja + etiquetas + journey inline
- [ ] Métricas: rendimiento por closer
- [ ] Closing → modal pago → cliente creado
- [ ] Integraciones: Instagram (mock) + conectar
- [ ] Ctrl+K y breadcrumbs en módulos nuevos
- [ ] Super Admin: orgs, cerebro IA
- [ ] UI VisionOS consistente (glass, púrpura)

## Qué NO incluye Phase 0

- Supabase / PostgreSQL / RLS
- Autenticación real
- Claude / RAG / colas en producción
- OAuth real (Instagram, ManyChat, Calendly…)
- API routes de negocio

## Siguiente paso: Phase 1

Ver `PROJECT_CONSTITUTION.md`, `SYSTEM_ARCHITECTURE.md`, `AI_ENGINE_SPEC.md` y `ESTADO_PLATAFORMA.md` (sección Próximos pasos).

Solo iniciar Phase 1 tras **aprobación explícita** del prototipo.
