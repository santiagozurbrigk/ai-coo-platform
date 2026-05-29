# Phase 1 — Backend, auth e integraciones (activa)

**Fase 0:** ✅ Cerrada y aprobada (mayo 2026)  
**Referencia:** `docs/PHASE_1.md` · `docs/ESTADO_PLATAFORMA.md` · `docs/PHASE_0.md`

## Reglas para el agente

- **Fase 0 terminada:** no añadir mocks de producto salvo fixtures para desarrollo Phase 1.
- **Prioridad:** auth multi-tenant → DB + RLS → Server Actions → integraciones (ManyChat, Calendly, Instagram, pagos).
- **Mantener UI** de `apps/web`; sustituir providers mock de forma incremental.
- **Español** en copy de producto.
- **Rutas:** `apps/web/routes/paths.ts` + `navigation.ts`.

## Módulos plataforma (UI existente — sin cambios de navegación)

| Módulo | Ruta base |
|--------|-----------|
| Panel General | `/dashboard` |
| Finanzas / Gastos | `/finance`, `/finance/expenses` |
| Marketing | `/marketing` (+ content, sales-connection) |
| Ventas | `/sales/inbox`, `/metrics`, `/closing` |
| Operaciones | `/operations/overview`, `sops`, `team-inputs` |
| Clientes | `/clients` |
| KB | `/business-context/documents` |
| Integraciones | `/integrations` |
| Equipo | `/team` |

## Phase 1 — hecho en repo

- Supabase: `lib/supabase/*`, `middleware.ts`, `/auth/callback`
- Login/registro real en `/login` (Super Admin sigue mock en `/superadmin/login`)
- Bootstrap `organizations` + `profiles` al primer acceso

## Siguiente entregable

Oleada H: Dashboard KPIs reales + polish Gastos (editar, comisiones desde closing). Siguiente: Meta/Instagram o Super Admin.

## Dev

```bash
npx pnpm@9.15.0 --filter @ai-coo/web dev
```

- http://localhost:3000/dashboard
- http://localhost:3000/demo
