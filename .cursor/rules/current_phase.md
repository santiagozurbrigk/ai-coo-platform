# Phase 0 — Prototipo visual (demo-ready)

**Estado:** UI completa con mocks. Sin backend.

**Referencia:** `docs/ESTADO_PLATAFORMA.md` · `docs/PHASE_0.md`

## Reglas para el agente

- **Solo UI + mocks** en Fase 0. No Supabase, auth real, API de negocio ni OAuth.
- **No cambiar layout/IA** salvo petición explícita; preferir tokens y `@ai-coo/ui`.
- **Español** en copy de producto.
- **Rutas:** `apps/web/routes/paths.ts` + `navigation.ts`.
- **Estado global:** `PlatformDataProvider`, `FinanceDataProvider`, `MarketingDataProvider`.

## Módulos plataforma (sidebar)

| Módulo | Ruta base |
|--------|-----------|
| Panel General | `/dashboard` |
| Finanzas / Gastos | `/finance`, `/finance/expenses` |
| Marketing | `/marketing` (+ content, sales-connection) |
| Ventas | `/sales/inbox`, `/metrics`, `/closing` |
| Clientes | `/clients` |
| Operaciones | `/operations/overview`, `sops`, `team-inputs` |
| KB | `/business-context/documents` |
| Integraciones | `/integrations` |
| Equipo | `/team` |

## No construir hasta Phase 1

Backend, database, auth, Claude API, integraciones reales, cálculo financiero persistido.

## Dev

```bash
npx pnpm@9.15.0 --filter @ai-coo/web dev
```

- http://localhost:3000/dashboard
- http://localhost:3000/marketing
- http://localhost:3000/finance
- http://localhost:3000/demo

Tras aprobación founder → **Phase 1**.
