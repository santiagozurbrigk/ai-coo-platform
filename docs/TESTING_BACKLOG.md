# TESTING_BACKLOG.md — Tests pendientes del monorepo OTC

> **Para un agente tester de Claude Code, o cualquier dev que venga a sumar cobertura.**
>
> Este documento lista lo que **falta** testear, con prioridad, ubicación exacta y qué
> verificar en cada caso. No es una lista de deseos: cada ítem apunta a lógica que ya
> existe en el repo y que hoy no tiene red.
>
> **Última actualización:** 2026-08-29 · **Cobertura actual:** 199 tests, sólo `lib/funnels/`

---

## 0. Antes de escribir un solo test

### Cómo se corren

```bash
pnpm test                       # todo el monorepo, vía turbo
cd apps/web && pnpm test        # sólo la app web
cd apps/web && pnpm test:watch  # modo watch mientras desarrollás
```

CI corre `pnpm typecheck`, `pnpm lint` y `pnpm test` en cada push y PR
(`.github/workflows/ci.yml`).

### Convenciones de este repo

| Regla | Detalle |
|---|---|
| **Ubicación** | `lib/<dominio>/__tests__/<archivo>.test.ts`, junto al código que cubren |
| **Entorno** | `node`. Estos tests cubren **lógica pura**, no componentes React |
| **Imports** | Explícitos: `import { describe, it, expect } from "vitest"` — `globals` está en `false` |
| **Alias** | `@/` apunta a `apps/web/`. Dentro de un módulo, preferir imports relativos |
| **Idioma** | Nombres de test en español (es-AR), como el resto del repo |
| **Scope de Vitest** | `vitest.config.ts` sólo incluye `lib/**`. Un test fuera de `lib/` no se ejecuta |

### Las tres reglas que hacen que un test valga algo

1. **Un test que no puede fallar no sirve.** Después de escribirlo, rompé a propósito el
   código que cubre y confirmá que falla. Si pasa igual, el test es decorativo. Este
   repo ya tiene precedente: los tests de conformidad de embudos se validaron mutando
   un rango, un denominador y un texto, y verificando que cada mutación la detectara el
   test correcto.
2. **Los fixtures no importan del código que testean.** Si el fixture y el código
   comparten la fuente, un error se propaga a los dos lados y el test pasa igual. Ver
   `lib/funnels/__tests__/document-fixture.ts` como referencia.
3. **Cubrir los casos negativos.** Un validador que nunca falla no protege nada. Por
   cada happy path, al menos un caso donde la cosa debería romperse.

### Qué NO testear

- Componentes React y flujos de UI → van a Playwright (`apps/web/e2e/`), no a Vitest.
- Server Actions que sólo hacen `select` y devuelven filas: testear el mapper, no el
  wrapper.
- Wrappers de SDKs externos (Anthropic, Supabase, Stripe). Testear **nuestra** lógica
  alrededor, con el SDK mockeado.
- Constantes y catálogos sin lógica. La excepción es cuando existe una fuente externa
  contra la cual verificar conformidad, como el documento de embudos.

---

## 1. Prioridad ALTA — plata, datos de clientes o decisiones de negocio

Lo que rompe silenciosamente y cuesta caro.

### [T-1] `lib/metrics/derive-finance-summary.ts` y `derive-monthly-series.ts`

**Por qué:** alimentan el módulo de Finanzas y el Panel General. Un error de signo o un
mes mal agrupado le muestra al founder un número de facturación equivocado.

**Qué verificar:**
- Agregación por mes con el patrón UTC-midnight (hay antecedente de bug: ver `BUG-3` en
  `PENDIENTES.md`, corregido en `enrich-team-compensation.ts` y `cta-actions.ts`).
- Meses sin datos: ¿producen `0` o hueco en la serie? Definir cuál es correcto y fijarlo.
- `deriveCloserBreakdown` con cero llamadas, con un solo closer, y con llamadas sin
  `closed_by_name`.
- Montos negativos (reembolsos) y `total_amount` en `null`.

### [T-2] `lib/metrics/revenue-period.ts` y `revenue-events.ts`

**Por qué:** definen qué cuenta como ingreso de un período. Es la base de ROAS, CAC y
cash collected.

**Qué verificar:** límites de período inclusivos/exclusivos, pagos en el borde exacto del
mes, cuotas repartidas entre meses, y qué pasa con un pago sin fecha.

### [T-3] `lib/clients/parse-client-import.ts` y `lib/clients/excel-parser.ts`

**Por qué:** ya causaron cuatro bugs documentados en `CHANGES.md` (fila de título
fusionada, filas vacías, hoja equivocada, discrepancia de hoja entre preview y parser).
Es el código con peor historial del repo y sigue sin tests.

**Qué verificar:**
- Fila de título fusionada antes de los encabezados reales.
- Filas 100% vacías → se ignoran en silencio; filas parcialmente vacías → generan error.
- `pickBestSheet` con varias hojas: la heurística de scoring y el bonus por densidad de
  columnas CRM.
- `sheetName` explícito tiene prioridad sobre la heurística.
- Fixtures: construir los workbooks en memoria con `xlsx`, no commitear `.xlsx` binarios.

### [T-4] `lib/clients/payment-utils.ts`

**Por qué:** calcula montos e índices de cuota. Un off-by-one acá le cobra de más o de
menos a un cliente real.

**Qué verificar:** `getPaidAmountFromClosePayload`, `installmentNumberForClosePayload` y
`getPaymentDateFromClosePayload` con pago único, cuotas, y payload incompleto.

### [T-5] `lib/utm/attribute-booking.ts` y el resto de `lib/utm/`

**Por qué:** decide a qué campaña se le atribuye una venta. Atribución mal calculada
mueve presupuesto de publicidad hacia el lado equivocado.

**Qué verificar:** matcheo de lead por email vs identificador, ventana de atribución,
conflicto entre dos links UTM candidatos, y lead sin UTM.

---

## 2. Prioridad ALTA — módulo de Embudos (lo que la Fase 1 dejó sin cubrir)

La lógica pura ya está cubierta (199 tests). Falta el IO y las capas de arriba.

### [T-6] `lib/funnels/resolve.ts` — resolución contra Supabase

**Por qué:** es la única parte del motor de embudos sin tests, y es donde vive la regla
más importante del módulo: `null` nunca se convierte en `0`.

**Cómo:** mockear el `SupabaseClient` con un stub encadenable
(`.from().select().eq().gte().lt()`) que devuelva `{ data, error, count }` controlados.
No hace falta base de datos.

**Qué verificar:**
- Un step **sin binding** resuelve a `null`, no a `0`.
- Un step con binding cuya **query devuelve error** resuelve a `null`, no a `0`.
- Un step cuya query devuelve `count: 0` resuelve a `0` — un cero real es un dato.
- `conversations_replied` cuenta sólo hilos con más de un mensaje.
- `conversations_booked` cuenta `status === "booked"` **o** tag `agendado`/`closeado`,
  sin duplicar una conversación que cumpla las dos.
- `closing_calls_attended` excluye `no_show`.
- `resolveOrgMeasures` deja `spend`, `reach` e `impressions` en `null` (no hay fuente
  todavía) y suma correctamente `cash_collected`.
- `resolveFunnel` con una `template_id` que no existe en código → debe lanzar, no
  devolver un embudo vacío.
- **Fuentes de GHL (agregado 2026-08-30 con I-4):**
  - `ghl_stage_entered` **sin `stageId` en la config** → `null` con
    `nullReason: "missing_config"`, y **la consulta no se ejecuta**. Si se ejecutara sin
    filtro contaría todas las etapas.
  - Período que empieza antes de `stage_history_since` → `null` con
    `nullReason: "outside_history"`, sin consultar.
  - `stage_history_since` en `null` (nunca llegó un webhook) → `null` para las tres
    fuentes `ghl_*`.
  - Las fuentes `ghl_*` cuentan **oportunidades distintas**: dos transiciones de la
    misma oportunidad a la misma etapa dentro del período suman 1, no 2.
  - `getGHLStageHistorySince` se llama **una sola vez** por `resolveFunnel`, y **cero
    veces** si el embudo no usa fuentes `ghl_*`.

### [T-6b] `lib/ghl/ingest-opportunity-event.ts` — ingesta de webhooks (agregado 2026-08-30)

**Por qué:** es donde el historial propio se escribe. Un error acá no se nota hasta que
los conteos del embudo DM ya están mal, y no se puede reconstruir hacia atrás.

**Cómo:** mockear `createAdminClient()`. La lógica pura ya está cubierta
(`stage-transition.test.ts`, `opportunity-event.test.ts`); esto cubre la orquestación.

**Qué verificar:**
- **El evento crudo se guarda ANTES de interpretarse**, incluso si el mapeo falla.
- Un evento que no se puede interpretar queda `unmapped` con su motivo, no `error`.
- Un evento con `webhookId` repetido devuelve `duplicate` y **no** escribe transición.
- Una transición duplicada (código `23505` al insertar) **no** aborta el upsert de la
  oportunidad ni marca el evento como error.
- `stage_history_since` se escribe **una sola vez** y nunca se mueve hacia adelante: el
  `update` lleva `.is("stage_history_since", null)`.
- Un `OpportunityDelete` marca `status = 'deleted'` y **no** inserta transición.
- `resolveOrganizationByLocation` devuelve `null` para un `locationId` desconocido, y la
  ruta responde `404` sin guardar nada.

### [T-7] `app/funnels/actions.ts` — Server Actions

**Qué verificar:**
- `createFunnelInstanceAction` rechaza un `templateId` desconocido y un nombre vacío.
- Aplica los bindings por defecto de la plantilla al crear.
- Si falla el insert de bindings, la instancia igual se crea (no queda a medias).
- `listFunnelInstancesAction` filtra las instancias cuya plantilla ya no existe en
  código.
- Todas usan `requireOrganizationId()` — un test que recorra los exports y verifique que
  ninguna consulta pase sin filtro de org.

### [T-8] Cobertura de UI del módulo (Playwright)

Ver sección 4.

---

## 3. Prioridad MEDIA — lógica de dominio con reglas propias

### [T-9] `lib/sales/lead-journey.ts` (537 líneas, sin tests)

Reconstruye el recorrido de un lead cruzando conversaciones, llamadas y clientes.
**Verificar:** deduplicación cuando el mismo lead aparece por dos canales, ordenamiento
del timeline, y lead sin ninguna llamada.

### [T-10] `lib/sales/upsert-inbound-conversation.ts`

**Verificar:** idempotencia — el mismo mensaje entrante dos veces no debe crear dos
conversaciones. Es la garantía que sostiene el inbox.

### [T-11] `lib/zernio/resolve-analytics.ts`

**Por qué:** `CLAUDE.md` lo declara la única forma válida de parsear analytics de Zernio,
y maneja tres formatos distintos. Es corto y de alto uso.

**Verificar:** formato vacío/inválido → ceros; formato plano; formato anidado por
plataforma (`{ instagram: {...} }` y `{ platforms: { instagram: {...} } }`) → suma
across platforms; campos faltantes.

### [T-12] `lib/marketing/overview-metrics.ts`

**Verificar:** `trendPct` con período previo en cero (¿100% o 0%?), ventanas de días
`isInDaysRange` en los bordes, y engagement rate con alcance cero.

### [T-13] `lib/metrics/derive-dashboard-data.ts` (434 líneas)

**Verificar:** MRR, clientes nuevos del mes y las tarjetas del Panel General con org
vacía. Hay antecedente de bug (`MRR=0 y Nuevos clientes=0`, corregido 2026-08-09).

### [T-14] `lib/agent/compact-conversation.ts`

**Por qué:** `CLAUDE.md` dice explícitamente que la compaction **no debe modificar la
DB**, sólo el payload enviado a Claude. Eso es un invariante testeable.

**Verificar:** por debajo del umbral no compacta; por encima conserva los últimos 6
mensajes; el historial de entrada no se muta (comparar por identidad y por contenido).

### [T-15] `lib/metrics/frequent-objections.ts`

**Verificar:** agrupación por categoría, cálculo de tendencia (`up`/`down`/`stable`) y el
fallback entre fuentes (`calls` → `conversations` → `mock` → `empty`).

### [T-16] `lib/validations.ts` (1020 líneas)

Es puro y grande. **Verificar** al menos los esquemas usados en Server Actions con input
de usuario: casos válidos, inválidos y de borde.

---

## 4. Prioridad MEDIA — E2E con Playwright

Hoy sólo existe `e2e/holding.spec.ts`. Requiere `E2E_HOLDING_EMAIL` y
`E2E_HOLDING_PASSWORD` (ver `playwright.config.ts`).

### [T-17] Flujo de embudos

1. Crear un embudo DM desde `/funnels` → redirige al detalle.
2. El detalle muestra las 7 etapas del spine.
3. La etapa **Spend** aparece como "no aplica" (ninguna plantilla la usa).
4. El paso `dm.trigger` aparece como **"Sin fuente"**, no como cero.
5. Cambiar el período (7d / 30d / 90d) preserva la selección en la URL.
6. Una org sin embudos ve el empty state, no una tabla vacía.

### [T-18] Importación de datos

El wizard de `/integrations/import` tiene el historial de bugs más denso del repo y cero
cobertura E2E. Cubrir: subir un Excel multi-hoja → elegir hoja → mapear columnas →
importar → los clientes aparecen en `/clients` (verifica también el `revalidatePath`).

### [T-19] Permisos por rol

Un usuario con `role: viewer` y permisos limitados no ve en el sidebar los módulos que
no le corresponden, y navegar directo por URL a uno de ellos no le muestra datos.

---

## 5. Prioridad BAJA — cuando sobre tiempo

- **[T-20]** `lib/navigation/sidebar-modules.ts` — `buildPlatformRootItems` con distintas
  combinaciones de add-ons; `getParentFromPath` con rutas anidadas.
- **[T-21]** `lib/format.ts` y `lib/locale/` — formateo es-AR de moneda y fechas.
- **[T-22]** `lib/product/mapper.ts` (550 líneas) — mapeo de filas a tipos de dominio.
- **[T-23]** `lib/rate-limit.ts` — consumo del contador distribuido y expiración de ventana.
- **[T-24]** `lib/security/` y `lib/sanitize.ts` — escapado de contenido no confiable
  antes de mandárselo al modelo.

---

## 6. Deuda de infraestructura de testing

| Ítem | Detalle |
|---|---|
| **Sin helper de mock de Supabase** | Cada test que toque IO va a reinventar el stub encadenable. Al escribir el primero ([T-6]), extraerlo a `lib/__tests__/helpers/supabase-mock.ts` y reusarlo. |
| **Sin cobertura medida** | No hay `vitest --coverage` configurado. Sumar `@vitest/coverage-v8` y un umbral cuando la cobertura sea significativa. Antes de eso, un umbral sólo genera ruido. |
| **`packages/*` sin script `test`** | La task de turbo ya está lista; ningún paquete la declara todavía. `packages/ui` sería el primer candidato. |
| **E2E no corre en CI** | `playwright.config.ts` tiene rama de CI pero el workflow no lo invoca: necesita credenciales de una cuenta de test. Decisión pendiente. |

---

## 7. Cómo cerrar un ítem de este backlog

1. Escribir los tests en `lib/<dominio>/__tests__/`.
2. **Mutar el código a propósito** y confirmar que fallan. Si no fallan, no sirven.
3. Restaurar y correr `pnpm test`, `pnpm typecheck` y `pnpm lint`.
4. Tachar el ítem acá con la fecha, o borrarlo si quedó cubierto por completo.
5. Registrar el bloque en `CHANGES.md`, como pide `CLAUDE.md`.

Si al escribir un test encontrás un bug real, **no lo arregles en el mismo commit**:
anotalo en `PENDIENTES.md` y dejá el test marcado con `it.fails` o `it.skip` y un
comentario que explique qué está mal. Separar el hallazgo del arreglo mantiene el
historial legible.

---

*Creado 2026-08-29. Actualizar a medida que se cierran ítems o aparece código nuevo sin cobertura.*
