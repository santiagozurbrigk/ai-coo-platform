# ADR-003 — Server Actions como capa de mutación; Route Handlers sólo para lo que llega de afuera

- **Estado:** Aceptada con deuda
- **Fecha:** 2026-05-27 — Fase 1, commit `857ad5b5` (primeras actions de clientes/closing) y `ef2ec8dc`
  2026-05-28 "gastos y plataformas de pago en Supabase (Oleada G)" con "CRUD vía Server Actions"
  (`docs/archivo/PHASE_1_HANDOFF_PROMPT.md`). Hoy es regla del `CLAUDE.md` § 7.

## Contexto

La spec del MVP listaba las dos cosas: "Backend: Next.js, Server Actions, API Routes"
(`docs/archivo/SYSTEM_ARCHITECTURE.md`) y el plan de Fase 1 dejaba abierto "Server layer: Server Actions / API
routes; providers → fetch + mutaciones" (`docs/archivo/PHASE_1.md`). La app es Next.js 15 App Router con React 19,
un solo frontend propio y ningún cliente externo que consuma una API.

## Decisión

- **Toda lectura y escritura que dispara la UI propia es una Server Action** (`*Action`, en
  `app/<dominio>/actions.ts` o `*-actions.ts`), que arranca con `requireOrganizationId()` y usa `createClient()`
  (RLS del usuario). No hay una API REST propia de negocio.
- **Route Handlers (`app/api/**/route.ts`) sólo para lo que no puede ser una action**: webhooks de proveedores,
  callbacks de OAuth, crons de Vercel, workers de QStash, el agente por SSE (`/api/agent/send`) y algún endpoint
  suelto (UTM, waitlist, invitaciones).

Hoy: 98 archivos con `"use server"` en `apps/web/app` y `apps/web/lib`, contra 84 `route.ts` (44 en
`api/integrations`, 13 crons, 9 workers de cola, 6 webhooks, 3 de Discord, 2 del agente y 7 sueltos). Las carpetas
`apps/web/api/` y `apps/web/server/` que dejó la Fase 0 están vacías (`docs/arquitectura/vision-general.md`).

## Alternativas consideradas

- **API Routes para las mutaciones** (spec original): quedó en la spec, **el motivo de no usarla no quedó
  escrito**. Lo que se infiere del código: con un solo cliente (la propia app) las actions evitan escribir y
  mantener la capa HTTP, el tipado viaja de punta a punta y la sesión de Supabase se lee de las cookies sin
  pasarla a mano.

## Consecuencias

**Positivas**
- Poco código de transporte; las pantallas llaman funciones tipadas.
- Un único patrón de org efectiva (`requireOrganizationId()`) en todas las mutaciones.

**Negativas / deuda**
- **Cada export de un archivo `"use server"` es un endpoint POST público** que cualquiera con sesión puede
  invocar sabiendo su id. Esconder un botón no protege nada: los permisos por módulo no están en las actions
  (`[PERMISOS-SERVER-ACTIONS]` y sus partes por área; ver ADR-005). Helpers que no eran actions quedaron expuestos
  por estar en esos archivos (`[AUD-SALUD-6]`); hay actions exportadas sin llamador (`[SALES-ACTIONS-SIN-USO]`).
- El middleware tuvo que aprender a no redirigir un POST de action a `/login` (devolvería HTML y el cliente
  rompe): commit `228dad0e` 2026-05-28 "evitar respuesta HTML inesperada en mutaciones" y
  `docs/arquitectura/auth-organizaciones-y-permisos.md` § Reglas.
- Flujos de varios pasos quedan orquestados desde el navegador encadenando actions, sin transacción:
  `[CLOSING-CIERRE-ATOMICO]` (cerrar una venta son cinco escrituras). La ficha de cliente dispara ~15 actions
  (`[FICHA-LENTA]`).
- Hay dos caminos al agente (SSE y `sendAgentMessageAction`) con lógica duplicada (`[AGENTE-CAMINO-LEGACY]`).

## Evidencia

- `CLAUDE.md` § 7 "Server-first… Mutaciones con Server Actions".
- `docs/arquitectura/vision-general.md` (estructura de `app/`, tabla de convenciones).
- `apps/web/lib/server/action-result.ts`, `apps/web/lib/supabase/middleware.ts` (header `next-action`).
- `docs/archivo/SYSTEM_ARCHITECTURE.md`, `docs/archivo/PHASE_1.md`, `docs/archivo/PHASE_1_HANDOFF_PROMPT.md`.
- Conteos: `grep -rl '^"use server"' apps/web/app apps/web/lib` y `find apps/web/app/api -name route.ts` (commit
  `038caca`).
