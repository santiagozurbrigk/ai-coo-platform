# Phase 1 — Backend, auth e integraciones

**Estado:** En curso — auth Supabase integrado (mayo 2026)  
**Prerequisito:** Prototipo visual validado — ver [`PHASE_0.md`](./PHASE_0.md)

## Objetivo

Sustituir mocks y guards simulados por **persistencia real**, **multi-tenant** e **integraciones de negocio**, manteniendo la UI actual de `apps/web`.

## Orden de implementación recomendado

| # | Bloque | Entregable |
|---|--------|------------|
| 1 | **Auth + org** | Supabase Auth, tabla `organizations`, sesión, guards reales (reemplazar `OnboardingGuard` mock) |
| 2 | **Esquema DB** | `users`, `clients`, `deals`, `payments`, `installments`, `expenses`, `content_assets`, `integrations` + RLS por `org_id` |
| 3 | **Server layer** | Server Actions / API routes; providers → fetch + mutaciones |
| 4 | **Integraciones** | ManyChat (inbox) → Calendly (closing) → Instagram/Make (marketing) → Stripe/Wise/MP (finanzas) |
| 5 | **Motor IA** | RAG según [`AI_ENGINE_SPEC.md`](./AI_ENGINE_SPEC.md) |
| 6 | **Super Admin** | Orgs, usage IA, costos con datos reales |

## Progreso

- [x] Proyecto Supabase + `apps/web/.env.local`
- [x] Migración SQL `organizations` + `profiles` (`supabase/migrations/`)
- [x] Cliente Supabase (browser, server, admin, middleware)
- [x] Login / registro real en `/login` + callback `/auth/callback`
- [x] Bootstrap org + perfil (`founder`) al primer acceso
- [x] Middleware protege rutas de plataforma
- [x] Cerrar sesión en Configuración
- [x] Tabla `clients` + RLS (`supabase/migrations/20260521100000_clients.sql`)
- [x] Server actions: list / create / update
- [x] `PlatformDataProvider` sincroniza con Supabase
- [x] Closing → crear cliente persistido
- [x] **Oleada A:** `closing_calls` en DB + FK en `clients`
- [x] Listado/calendario Closing desde Supabase; estados persisten

- [x] **Oleada B:** `onboarding_responses` + guard/login desde DB
- [x] **Oleada C:** `conversations` en DB + Sales Inbox + tags persistidos
- [x] Closing actualiza tag de conversación vinculada (`closeado`, `no-closeado`, etc.)
- [x] **Oleada D:** métricas de Ventas y Finanzas derivadas de `clients` + `closing_calls` + `conversations`

## Oleada E (Calendly) — Progreso

1. `closing_calls` ahora puede recibir metadata de Calendly (`calendly_event_id`, `calendly_url`).
2. Server action: `syncCalendlyEventsAction` (upsert idempotente) y variante admin para sync incremental.
3. OAuth + webhooks de Calendly:
   - `GET /api/integrations/calendly/oauth/start` inicia el flujo OAuth (con PKCE)
   - `GET /api/integrations/calendly/oauth/callback` intercambia tokens y registra webhook
   - `POST /api/integrations/calendly/webhook` verifica firma y sincroniza `closing_calls`
4. Sync manual vía API si no hay plan Standard; UI con avisos + botón «Sincronizar ahora».
5. Integraciones: estado `connected` y conteo de llamadas desde Supabase (`listIntegrationsAction`).

## Oleada E — Calendly (completado en repo)

- OAuth + sync manual (planes sin Standard) + webhooks si hay Standard
- Avisos en Integraciones y Closing para sync manual
- Estado **connected** real en tarjeta Calendly (`listIntegrationsAction` + DB)
- Refresh de `closing_calls` en Closing tras sincronizar

## Oleada F (ManyChat) — Progreso

1. Tabla `manychat_integrations` (API key + webhook token por org).
2. Conectar con API key (`connectManyChatAction`) + validación `getInfo`.
3. Webhook `POST /api/integrations/manychat/webhook/[token]` (External Request).
4. Importación manual por subscriber ID; inbox actualiza conversaciones en Supabase.
5. Estado real en tarjeta Integraciones; sin seed mock si ManyChat está conectado.

## Oleada G (Gastos) — Progreso

1. Tablas `fixed_expenses`, `subscriptions`, `team_compensation`, `payment_platforms` + RLS.
2. Server Actions CRUD en `app/finance/actions.ts`; seed inicial desde mocks si vacío.
3. `FinanceDataProvider` lee/escribe en Supabase; métricas de Finanzas usan gastos reales.
4. Integraciones no implementadas muestran `not_connected` (sin mock “conectado” falso).

Migración: `supabase/migrations/20260521800000_finance_expenses.sql`

## Oleada H (Panel + polish Gastos) — Progreso

1. **Dashboard** (`/dashboard`): KPIs derivados de clientes, conversaciones, closing y finanzas; gráfico de ingresos últimos 7 días.
2. **Gastos:** gráfico de distribución con datos reales; editar gastos fijos, suscripciones y compensación de equipo.
3. **Comisiones:** estimación mensual desde `closing_calls` cerradas (match por `closedByName`).

## Próximo entregable

1. **Instagram/Make** (marketing) — bloqueado por verificación Meta en ManyChat/IG.
2. Super Admin con datos reales (baja prioridad).

## Referencias

| Documento | Uso |
|-----------|-----|
| [`PROJECT_CONSTITUTION.md`](./PROJECT_CONSTITUTION.md) | Principios y fases |
| [`SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md) | Arquitectura objetivo |
| [`AI_ENGINE_SPEC.md`](./AI_ENGINE_SPEC.md) | Motor IA |
| [`ESTADO_PLATAFORMA.md`](./ESTADO_PLATAFORMA.md) | Estado producto + deuda técnica |

## Fuera de alcance inicial Phase 1

- Facturación calculada con reglas completas de negocio (puede ser iteración 1.1)  
- Comisiones por closer automatizadas  
- Export PDF / notificaciones push  
