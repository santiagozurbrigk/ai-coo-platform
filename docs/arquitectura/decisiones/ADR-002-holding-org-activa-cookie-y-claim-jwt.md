# ADR-002 — Holding: negocio activo con cookie para la app y claim del JWT para RLS

- **Estado:** Aceptada con deuda
- **Fecha:** 2026-06-16 (holding con switcher, commit `a096e95b`) y 2026-06-18 (claim en el JWT, commit
  `84de503c` "resolve holding/RLS mismatch via JWT custom claim with backward compatibility"). Anterior a
  `CHANGES.md`; lo documenta `docs/archivo/OPERATIONAL_NOTES.md` § "RLS — Resolución de organización para
  holdings (JWT claim)".

## Contexto

ADR-001 ata cada usuario a **una** organización. Una cuenta holding (`organizations.account_type = 'holding'`)
administra varios negocios (`holding_businesses`) y necesita "entrar" a uno y operar como si fuera su founder.
La primera versión (2026-06-16) guardaba el negocio activo en una cookie, pero `get_my_organization_id()` seguía
leyendo `profiles.organization_id`. Según `OPERATIONAL_NOTES.md`, eso "rompía (silenciosamente en lecturas, con
error en escrituras) cualquier módulo con RLS estándar mientras un holding navegaba un negocio de su portfolio".

## Decisión

Dos mecanismos que se escriben y se borran juntos:

1. **Para la base:** un *Custom Access Token Hook* de Supabase (`custom_access_token_hook`) mete el claim
   `active_business_org_id` en el JWT cuando hay una fila válida en `holding_active_sessions` (verificada contra
   `holding_businesses`). `get_my_organization_id()` prioriza ese claim y cae a `profiles.organization_id` si no
   está. Al entrar o salir de un negocio se llama `auth.refreshSession()` para que el claim cambie ya.
2. **Para la app:** la cookie httpOnly `limitless_active_org` (24 h) + header `x-active-org-id`; en cada request
   `resolveEffectiveOrganizationId()` los **re-verifica** contra `holding_businesses` activo. `requireOrganizationId()`
   devuelve esa org efectiva.

`enterBusinessAction` exige founder del holding o `is_holding_admin` (agregado en la auditoría de 2026-09-22).

## Alternativas consideradas

- **Leer con `createAdminClient()` (service role) cuando se mira un negocio desde el holding.** Se usó como
  parche entre el 2026-06-17 y el 2026-06-23 (commits `d0042aaa`, `0e622116`, `616809b8`) y se **retiró** en
  `1a39691c` "remove admin client workaround now that JWT claim fix is stable". Saltear RLS en la app era el
  costo; `OPERATIONAL_NOTES.md` lo lista como "Deuda técnica resuelta".
- **Sólo cookie**, sin tocar RLS: fue la primera versión y es el problema que motivó el claim.
- Otras (p. ej. un perfil por negocio): no quedó registrado.

## Consecuencias

**Positivas**
- Dentro de un negocio, todos los módulos funcionan con RLS normal y `createClient()`; no hay código especial por
  módulo.
- La cookie no da acceso por sí sola: se re-verifica contra `holding_businesses` en cada request.

**Negativas / deuda**
- **El hook no se activa con la migración**: hay que habilitarlo a mano en Supabase → Authentication → Hooks. Si
  falta, la app muestra el negocio (cookie) pero RLS filtra por la org del holding.
- Dos fuentes de verdad (cookie y claim) que tienen que coincidir.
- Las policies de portfolio (`20260630100000_holding_portfolio_rls.sql`) no miran el rol: cualquier miembro de la
  org holding lee clientes, llamadas y conversaciones de todo el portfolio (`[HOLDING-PORTFOLIO-ROL]`,
  `[AUD-SEG-3]`).
- UI y servidor leen add-ons de orgs distintas en modo holding (`[ADDONS-HOLDING]`); Closing mezcla turnos de
  varios negocios (`[CLOSING-HOLDING-MEZCLA]`); acciones que leen `profile.organization_id` ignoran el negocio
  activo (`[AUD-SALUD-ORG-HOLDING]`, `[MKT-HOLDING-ORG]`).
- Sin tests de `lib/holding/*` (`[TESTS-AUTH]`); sólo el e2e `apps/web/e2e/holding.spec.ts`.

## Evidencia

- `supabase/migrations/20260618100000_holding.sql`, `20260620100000_holding_jwt_claim_hook.sql`,
  `20260630100000_holding_portfolio_rls.sql`.
- `apps/web/lib/holding/{resolve-org,switch-org,constants,session}.ts`, `apps/web/app/(platform)/holding/actions.ts`.
- Commits `a096e95b`, `84de503c`, `1a39691c` (2026-06-16 a 2026-06-23).
- `docs/archivo/OPERATIONAL_NOTES.md` § RLS holdings; `docs/arquitectura/auth-organizaciones-y-permisos.md`
  § "Holding: qué org ve cada request".
- `docs/historial/CHANGES-2026-07-a-08.md` 2026-08-26 "FIX-HOLDING-TEAM-ROLES".
