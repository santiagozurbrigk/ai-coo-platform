# ADR-001 — Multi-tenant por `organization_id` con RLS sobre Supabase

- **Estado:** Aceptada con deuda
- **Fecha:** 2026-05-27 — commit `857ad5b5` "feat(phase-1): persistencia Supabase, métricas y Calendly OAuth"
  (primera migración: `20260521000000_phase1_orgs_profiles.sql`). Anterior a `CHANGES.md`, que arranca en julio.

## Contexto

La spec del MVP (`docs/archivo/SYSTEM_ARCHITECTURE.md`, "TECH STACK" y "SECURITY") pedía PostgreSQL en Supabase,
auth con **Clerk**, una tabla `USERS` con `organization_id` y "Organization isolation. Server-side authorization".
La Fase 0 era un prototipo visual sin backend (`docs/archivo/PROJECT_CONSTITUTION.md`, "WHAT SHOULD NOT BE BUILT
YET"). En la Fase 1 había que elegir cómo aislar los datos de cada cliente (cada founder es una organización).

## Decisión

1. **Supabase para todo lo de plataforma: Auth, Postgres, Storage.** Clerk no se usó:
   `docs/archivo/PHASE_1_HANDOFF_PROMPT.md` registra "Arquitectura original mencionaba Clerk; **se eligió Supabase
   Auth** en Phase 1".
2. **Una sola base compartida; cada tabla de negocio lleva `organization_id`.** Un usuario pertenece a una
   organización (`profiles.organization_id`, `profiles.id = auth.users.id`).
3. **El aislamiento lo hace la base con RLS**, no la aplicación: la función `get_my_organization_id()`
   (`SECURITY DEFINER`, lee `profiles` del `auth.uid()`) y el patrón
   `USING (organization_id = get_my_organization_id()) WITH CHECK (...)`.
4. La aplicación usa `createClient()` (sesión del usuario, respeta RLS) y reserva `createAdminClient()` (service
   role, saltea RLS) para bootstrap, secretos y jobs. Toda action resuelve la org con `requireOrganizationId()`.

## Alternativas consideradas

- **Clerk** como proveedor de auth (spec original). Descartado en Fase 1; **el motivo no quedó escrito**. Lo que se
  infiere del código: con Supabase Auth, `auth.uid()` está disponible dentro de las policies, que es lo que hace
  posible el punto 3 sin sincronizar usuarios entre dos sistemas.
- Base por cliente o schema por cliente: **no quedó registrado** que se evaluara.

## Consecuencias

**Positivas**
- Un solo lugar para cortar el acceso entre organizaciones: aunque una query se olvide el filtro, RLS lo aplica.
  Hoy las 147 tablas de `public` en producción tienen RLS habilitado (`docs/arquitectura/base-de-datos.md`).
- El modelo se pudo extender a holdings cambiando sólo `get_my_organization_id()` (ver ADR-002).
- Las tablas con secretos se cierran quitando la policy de lectura: sólo el service role las lee
  (`20260606100000_security_hardening_rls.sql`).

**Negativas / deuda**
- **Toda la seguridad entre organizaciones depende de que cada tabla, vista, RPC y grant esté bien.** La auditoría
  del 2026-09-22 encontró RPCs `SECURITY DEFINER` ejecutables por `authenticated` sin filtro por org, una vista
  sin filtro, un usuario que podía cambiarse `organization_id`/`role` por PostgREST y UPDATE total sobre
  `organizations` en producción (entradas de `CHANGES.md` 2026-09-22 "Auditoría de backend…" y "Migraciones de
  la auditoría aplicadas…"; migraciones `20260922100000_profiles_columnas_protegidas.sql`,
  `20260922110000_rpcs_y_policies_entre_organizaciones.sql`). Siguen abiertos `[DB-ORGS-SELECT-COLUMNAS]` y la
  deriva repo↔producción documentada en `docs/historial/DB_DIFF_PRODUCCION_2026-09-22.md`.
- **RLS separa por organización, no por rol.** Ninguna policy mira el rol del usuario (ver ADR-005,
  `[PERMISOS-SERVER-ACTIONS]`).
- Los jobs y webhooks que usan `createAdminClient()` no tienen red de RLS: cada uno tiene que filtrar por org a
  mano (p. ej. `[FIN-MP-WEBHOOK]`, `[ZERNIO-KEY-GLOBAL]`).
- Leer `profile.organization_id` directo en vez de `requireOrganizationId()` ignora el negocio activo del holding
  (`[AUD-SALUD-ORG-HOLDING]`, `[MKT-HOLDING-ORG]`).

## Evidencia

- `supabase/migrations/20260521000000_phase1_orgs_profiles.sql` (función y primeras policies),
  `20260521200000_fix_rls_recursion.sql`, `20260606100000_security_hardening_rls.sql`.
- `apps/web/lib/auth/bootstrap.ts` (`requireOrganizationId`, `ensureUserBootstrap`),
  `apps/web/lib/supabase/{server,admin}.ts`.
- `docs/archivo/SYSTEM_ARCHITECTURE.md`, `docs/archivo/PHASE_1_HANDOFF_PROMPT.md` ("Deuda / decisiones tomadas").
- `docs/arquitectura/auth-organizaciones-y-permisos.md` § RLS; `docs/arquitectura/base-de-datos.md`.
- `CHANGES.md` 2026-09-22 (auditoría de backend y aplicación de sus migraciones).
