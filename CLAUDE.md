# CLAUDE.md — Reglas y orientación para trabajar en Limitless

Repo `santiagozurbrigk/limitless-system` · App principal `apps/web` (Next.js 15 + Supabase) ·
Workspace interno `ai-coo-platform`, paquetes `@ai-coo/*` (no cambian con el nombre del repo).

Este archivo tiene **sólo reglas y orientación**. Cómo funciona cada parte del sistema está en
[`docs/`](./docs/README.md), organizado por área. Si algo de acá contradice al código, manda el
código: corregí el doc en el mismo cambio.

---

## 1. Al empezar una sesión

1. Leé [`docs/README.md`](./docs/README.md) (índice, 2 minutos) y el doc del área que vas a tocar
   (`docs/areas/<área>.md`).
2. Leé la sección de tu área en [`PENDIENTES.md`](./PENDIENTES.md).
3. [`CHANGES.md`](./CHANGES.md) es el historial: **no lo leas entero**. Mirá las últimas entradas y
   buscá con grep lo que tenga que ver con lo que vas a tocar.

## 2. Al terminar un bloque de trabajo

Nunca se saltea, aunque el cambio sea de una línea.

| Qué cambió | Qué actualizar |
|---|---|
| Cualquier cosa | Entrada nueva **arriba** en `CHANGES.md` (formato al principio de ese archivo) |
| Cómo funciona un área (tablas, flujos, reglas de negocio, rutas) | El doc del área en `docs/areas/` — tiene que seguir describiendo el código de hoy |
| Qué puede hacer el usuario (se agrega, saca o arregla una funcionalidad) | Su fila en [`docs/FUNCIONAL.md`](./docs/FUNCIONAL.md) (estado y pendientes) y su historia en [`docs/backlog/historias.md`](./docs/backlog/historias.md); después, `python3 docs/backlog/historias_a_jira.py` |
| Algo quedó abierto, o cerraste un pendiente | `PENDIENTES.md`: agregar el ítem en su área con el formato de hallazgo del encabezado (un P0/P1 lleva **Severidad, Riesgo, Impacto y Criterio de aceptación**), o **borrarlo** y nombrar su ID en la entrada de `CHANGES.md`. Después, `python3 docs/backlog/pendientes_a_jira.py --actualizar-indices` |
| Algo que no se pudo probar (falta cuenta, credencial o doc) | Bloque en [`docs/operacion/verificacion-manual.md`](./docs/operacion/verificacion-manual.md) |
| Una variable de entorno, un cron, un webhook, una tabla | `docs/operacion/entorno-y-deploy.md`, `docs/arquitectura/jobs-webhooks-y-colas.md`, `docs/arquitectura/base-de-datos.md` |

`PENDIENTES.md` sólo tiene lo abierto: lo resuelto se borra (el historial queda en `CHANGES.md` y en git).

## 3. APIs externas

1. **Primero fijate si la documentación está bajada** en [`docs/external-apis/`](./docs/external-apis/)
   (GoHighLevel, VTurb, Whop, Commas, Hyros, WebinarJam, Fathom). Leé de ahí, no de memoria. Cada carpeta
   tiene un `RESUMEN-LIMITLESS.md`.
2. Si no está, probá la URL y buscá un spec OpenAPI; bajalo con `docs/external-apis/tools/regenerar.sh`
   como modelo y commitealo.
3. Si implementás sin poder leer la doc oficial: registralo en
   [`docs/integraciones/apis-sin-documentacion.md`](./docs/integraciones/apis-sin-documentacion.md), persistí el
   payload crudo **antes** de interpretarlo, **nunca inventes un valor** (lo que no se entiende queda como no
   mapeado, con motivo; un cobro cuyo monto no se lee no es un cobro de cero) y aislá el mapeo en un archivo
   por proveedor con la advertencia en el header.

## 4. Explicar al terminar

Al cerrar cada bloque de trabajo, explicá **en palabras simples, para alguien que no programa**: qué
estaba mal, qué se hizo (en términos de lo que el usuario ve) y qué falta verificar. Sin nombres de
archivos ni funciones; sí con los números que respaldan lo que se afirma (tests, filas, porcentajes).
El detalle técnico va en `CHANGES.md`.

## 5. Git

- Todo en ramas de feature desde `main` actualizado (`git fetch origin main && git checkout -B <rama> origin/main`).
  Claude Code usa el prefijo `claude/` que asigna el sistema.
- **Nunca pushear a `main`.** Producción se deploya sola desde `main` (Vercel), sólo vía PR con
  **Squash and merge**. Después de un merge la rama queda consumida.
- Commits en español, convencionales: `feat(clientes): ...`, `fix(zernio): ...`.
- No commitear, pushear ni abrir PR sin que el usuario lo pida. Nada de `.env.local` ni secretos.

## 6. Migraciones

Producción: Supabase **OTC** (`nrzlylzbmsuowzhpdnjl`). Un archivo `supabase/migrations/AAAAMMDDHHMMSS_desc.sql`
con versión única; el historial de producción tiene que tener **exactamente** las versiones de los archivos.
`apply_migration` del MCP registra la hora actual, no la del archivo: corregí una de las dos. RLS en la misma
migración. Detalle en [`docs/arquitectura/base-de-datos.md`](./docs/arquitectura/base-de-datos.md).

## 7. Convenciones de código

- **Explorá antes de escribir**: copiá los patrones del dominio, no inventes arquitectura paralela. Diff mínimo.
- **Server-first**: Server Components en `page.tsx`; `"use client"` sólo con estado, efectos o handlers.
  Mutaciones con Server Actions (`*Action`, en `app/<dominio>/actions.ts` o `*-actions.ts`).
- Toda action arranca con `requireOrganizationId()` (resuelve la org efectiva, incluido el switch de holding)
  y usa `createClient()` (respeta RLS). `createAdminClient()` sólo en servidor, para secretos y jobs.
- **Permisos**: el bloqueo por módulo cubre pantallas; si una action es sensible, validala también
  (ver `docs/arquitectura/auth-organizaciones-y-permisos.md`).
- Reutilizá: `resolvePostAnalytics`, `zernioFetchJson`, `extractProfileId` (Zernio), `wrap-untrusted-content`
  (texto de terceros hacia la IA), `assertCronAuthorized` (crons).
- Rutas en `apps/web/routes/paths.ts` (única fuente). La navegación es la **notch nav** y se arma desde
  `lib/navigation/sidebar-modules.ts`: para sumar un módulo se toca ese config, nunca la barra. Nada de
  subnavs horizontales por módulo.
- UI: `@ai-coo/ui` + Tailwind, iconos `lucide-react`, **sin emojis en JSX**, acento de marca por token
  (`bg-primary`, `lib/brand.ts`), nunca el hex. Copy en español (es-AR). Ver `docs/diseno/`.
- Comentarios y ads de Zernio se leen en vivo (las pantallas no leen de DB; el webhook de Zernio sólo guarda
  una copia de los comentarios entrantes en `zernio_comments`).
- Tests: Vitest en `lib/<dominio>/__tests__/` (lógica pura); Playwright en `apps/web/e2e/`.

## 8. Antes de dar algo por terminado

```bash
cd apps/web && node node_modules/typescript/bin/tsc --noEmit   # typecheck
pnpm lint                                                        # next lint (script de apps/web)
pnpm test                                                        # vitest run (script de apps/web)
```

- [ ] Typecheck, lint y tests pasan (y la lógica nueva de `lib/` tiene tests)
- [ ] Server Actions con `requireOrganizationId()`
- [ ] Rutas nuevas en `paths.ts` + `sidebar-modules.ts` si son navegables
- [ ] Sin secretos en código ni logs
- [ ] `CHANGES.md`, `PENDIENTES.md`, el doc del área y `docs/FUNCIONAL.md` actualizados

## Mapa rápido

| Necesito… | Leer |
|---|---|
| Entender el sistema entero | [`docs/arquitectura/vision-general.md`](./docs/arquitectura/vision-general.md) |
| Auth, orgs, holding, roles, permisos | [`docs/arquitectura/auth-organizaciones-y-permisos.md`](./docs/arquitectura/auth-organizaciones-y-permisos.md) |
| Schema, RLS, migraciones | [`docs/arquitectura/base-de-datos.md`](./docs/arquitectura/base-de-datos.md) |
| Crons, webhooks, colas | [`docs/arquitectura/jobs-webhooks-y-colas.md`](./docs/arquitectura/jobs-webhooks-y-colas.md) |
| Un módulo del producto | `docs/areas/` (índice en [`docs/README.md`](./docs/README.md)) |
| Qué integraciones hay | [`docs/integraciones/README.md`](./docs/integraciones/README.md) |
| Variables de entorno, deploy | [`docs/operacion/entorno-y-deploy.md`](./docs/operacion/entorno-y-deploy.md) |
| Qué está abierto | [`PENDIENTES.md`](./PENDIENTES.md) |
