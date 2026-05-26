# Phase 1 — Backend, auth e integraciones

**Estado:** En preparación (Fase 0 cerrada y aprobada, mayo 2026)  
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

## Primer PR sugerido

1. Proyecto Supabase + variables de entorno documentadas  
2. Login real en `/login`  
3. Una entidad persistida end-to-end (ej. `clients` o `closing_calls`)  
4. Migración gradual: un provider mock → Supabase sin reescribir toda la app

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
