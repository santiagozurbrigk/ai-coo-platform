# PENDIENTES.md — Backlog de trabajo pendiente en OTC

> **Para Claude Code y cualquier asistente IA:**  
> Leer este archivo junto con `CHANGES.md` al inicio de cada sesión.  
> Actualizar este archivo cuando se completa un ítem o se agregan nuevos pendientes.  
> Al completar un ítem: moverlo a la sección `## ✅ Completados` con fecha.

---

## 🔴 Urgente — Hacer antes de usar con clientes reales

### [ADDON-EMBUDOS] Activar el add-on `embudos` en la org

**Qué es:** la migración ya está aplicada, pero el módulo no aparece en el sidebar hasta que la org tenga `embudos` en `enabled_add_ons`.

**Acción:** activarlo desde super-admin para la org que vaya a usarlo.

---

### [EMBUDOS-FUENTES] Plan de integraciones del módulo de Embudos

**Qué es:** el mapa completo de las 34 medidas atómicas que pide el documento fuente, con su estado en OTC y el orden de construcción, está en **[`docs/FUNNELS_SOURCE_MAP.md`](./docs/FUNNELS_SOURCE_MAP.md)**. Leerlo antes de arrancar cualquier integración de embudos.

**Estado actual:** 2 de 34 medidas disponibles (M17 y M18, calidad de aplicación). 20 parciales, 11 faltantes, 1 sin dueño en el documento.

**Orden acordado — de afuera hacia adentro, no de a un embudo:**
- **Ola 1 (extremos, sirve a los 3 embudos):** ✅ **Completa.** ~~I-1 métricas de ads~~ · ~~I-2 pagos con Whop y Fanbasis~~ 🔨 *(falta conectar una cuenta real y verificar el mapeo)* · ~~I-3 asistencia y cierres + detección de fuente vacía~~
- **Ola 2 (medios, por costo):** ~~I-4 GHL opportunities~~ 🔨 *(construido 2026-08-30; falta recibir el primer webhook real — ver `[EMBUDOS-GHL-ENTREGA]`)* · ~~I-6 VTurb~~ 🔨 *(construido 2026-08-30; falta conectar una cuenta real)* · I-5 webinar — 📗 documentación capturada. Hallazgos que cambian el diseño: GHL **no** tiene historial de cambios de etapa (hay que construirlo desde webhooks); VTurb **sí** da la curva de retención y ya modela el segundo del CTA; WebinarJam resuelve el stick rate del lado del servidor pero **no expone clicks al CTA**, y su API key **requiere aprobación previa** — pedirla ya.
- **Ola 3:** I-9 retención · I-8 Hyros · I-10 triggers de Zernio — 📗 Hyros capturado. Confirma que **`I-7` no hace falta** (M08 y M09 salen de `/leads` y del reporte de atribución) y que `fields=cost` cubre M01, así que tampoco hace falta cruzar la API de cada plataforma de ads.

**Verificación:** nada se prueba contra cuentas reales hasta terminar todas las olas — ver [`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md).

**Documentación de las APIs:** ✅ **los seis proveedores están capturados** en [`docs/external-apis/`](./docs/external-apis/) — GoHighLevel, VTurb, Whop, Commas (ex Fanbasis), Hyros y WebinarJam. Cada uno tiene un `RESUMEN-OTC.md` que responde las preguntas que estaban abiertas en `docs/API_DOCS_PENDIENTES.md`. Se refresca con `docs/external-apis/tools/regenerar.sh`. **Leer el resumen del proveedor antes de construir o corregir su unidad.**

**Decisiones cerradas:** VSL en VTurb (tiene API pública) · todos los clientes pagan Hyros · landings en Vercel, así que los opt-ins salen de Hyros e I-7 desaparece · clientes repartidos en partes iguales entre los tres embudos. **No queda ninguna pregunta abierta en el plan.**

---

### [EMBUDOS-PAGOS-CORREGIR] Corregir el mapeo de Whop contra su spec real

**Qué es:** con la documentación de Whop ya capturada, quedaron a la vista tres errores concretos en `apps/web/lib/payments/normalize.ts`, que se escribió a ciegas:

1. **El campo de monto no existe.** `KEYS.amount` busca `settled_amount`; el campo real es **`settlement_amount`**. `total` y `subtotal` sí existen pero son *"to show to the creator (excluding buyer fees)"* — no es lo que se cobró.
2. **Whop manda decimales, no centavos** (*"10.43 for $10.43 USD"*), mientras que **Commas sí manda `amount_cents`**. La regla tiene que ser por proveedor, no una heurística de sufijo `_cents`.
3. **`membership.created` no existe.** El evento de alta es `membership.activated`. Conviene reemplazar los regex de detección de evento por la lista literal, que ahora se conoce entera.

**Además:** la deduplicación de Whop va por `webhook-id` (entrega *at least once*, 12 reintentos en ~71 h, sin orden garantizado), y el prefijo del secreto de firma es `ws_`, no `whsec_`.

**Dónde está el detalle:** [`docs/external-apis/whop/RESUMEN-OTC.md`](./docs/external-apis/whop/RESUMEN-OTC.md) y [`docs/external-apis/commas/RESUMEN-OTC.md`](./docs/external-apis/commas/RESUMEN-OTC.md).

---

### [EMBUDOS-GHL-ENTREGA] Cerrar cómo llegan los webhooks de oportunidades de GHL

**Qué es:** I-4 está construido, pero la pregunta que decide si funciona sigue abierta. Los webhooks de plataforma de GHL **se configuran dentro de una app del Marketplace**, que OTC no tiene aprobada (`[FEAT-GHL-OAUTH]`). El endpoint acepta por eso dos vías: la firma Ed25519 de la plataforma, y un **secreto compartido por organización** para eventos entregados desde una acción "Webhook" de un Workflow de la sub-cuenta.

**Lo que hay que verificar, y es lo único que importa:** que un Workflow de GHL pueda mandar **`pipelineStageId`** en el cuerpo del webhook. Si no pudiera, esa vía sólo serviría para altas (M21) y M22, M23 y M25 quedarían atadas a la aprobación del Marketplace.

**Cómo probarlo:** los pasos están en [`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md) §5.2. Generar el secreto desde Integraciones, armar el Workflow apuntando a la URL, mover una oportunidad de etapa y **mirar el payload crudo** en `ghl_webhook_events`.

**Consecuencia si sale mal:** hay que priorizar `[FEAT-GHL-OAUTH]`, que es lento porque depende de la aprobación de GHL.

---

### [EMBUDOS-GHL-BACKFILL] Poblar la última etapa conocida de las oportunidades preexistentes

**Qué es:** el historial de etapas arranca con el primer webhook y **no se puede reconstruir hacia atrás** — GHL no lo expone. Lo que sí se puede es traer el **estado actual** de las oportunidades que ya existen, para que la primera transición que llegue se derive contra una etapa conocida en vez de registrarse como alta.

`searchGHLOpportunities` ya está construido en `lib/ghl/client.ts` y no se usa todavía.

**Ojo:** poblar el estado inicial **no** debe generar filas en `ghl_stage_transitions` — sería inventar transiciones que nadie observó. Sólo escribe `ghl_opportunities`.

---

### [EMBUDOS-VTURB-PITCH] Configurar el pitch time de los VSL en VTurb

**Qué es:** VTurb permite marcar en qué segundo del video está la oferta (`pitch_time`). Con eso configurado, la medida **"llegaron al CTA"** del embudo VSL sale directo y sin cálculos.

**Sin eso, esa medida no se puede mostrar.** VTurb devuelve `pitch_time = 0` para los videos que no lo tienen, y su contador pasa a incluir a todo el que abrió el video — un número que parece la métrica correcta y no lo es. OTC lo detecta y muestra "sin datos" en vez de ese número.

**Acción:** entrar a cada player en VTurb y configurarle el pitch time. El panel de Integraciones dice cuántos videos están sin configurar.

---

### [WEBINARJAM-API-KEY] Pedir la API key de WebinarJam

**Qué es:** la API de WebinarJam/EverWebinar **requiere aprobación previa** — no alcanza con tener cuenta. Es el camino crítico de la unidad I-5.

**Acción:** seguir [el artículo de solicitud](./docs/external-apis/webinarjam/15370143-apply-for-an-api-key-for-webinarjam-or-everwebinar.md) para la cuenta del cliente que vaya a usarse, y confirmar si usa WebinarJam, EverWebinar o los dos.

---

### [EMBUDOS-PAGOS-VERIFICAR] Verificar el mapeo de webhooks de Whop y Commas contra eventos reales

**Qué es:** la capa de pagos (I-2) está construida y su mapeo se escribió a ciegas. **Desde el 2026-08-30 la documentación de los dos proveedores está capturada** en [`docs/external-apis/whop/`](./docs/external-apis/whop/) y [`docs/external-apis/commas/`](./docs/external-apis/commas/), así que buena parte de lo que había que "verificar" ya se puede **corregir leyendo** — ver `[EMBUDOS-PAGOS-CORREGIR]` más arriba.

Lo que queda para este ítem es lo que ninguna documentación resuelve: **ver un payload real de cada proveedor** y confirmar que el mapeo corregido lo lee bien. La firma de los dos ya está documentada (Whop: Standard Webhooks con secreto `ws_`; Commas: `x-webhook-signature`, HMAC-SHA256 hex sobre el body crudo), pero ninguna de las dos se probó contra un evento real.

**Por qué no bloquea:** cada webhook se persiste crudo en `payment_webhook_events` antes de interpretarse. Un evento que no se sabe leer queda en estado `unmapped` con su motivo y se puede reprocesar; nunca se inventa un número.

**Cuándo:** decisión de Santiago (2026-08-30) — **no se conecta nada hasta que esté todo construido**, y ahí se hace una sola pasada de prueba de punta a punta.

**Los pasos exactos están en [`docs/PLAN_VERIFICACION.md`](./docs/PLAN_VERIFICACION.md) §3**, junto con el resto de las verificaciones pendientes de todas las unidades.

**La UI de conexión ya está hecha** (2026-08-30): `/integrations` → sección "Pagos".

---

### [EMBUDOS-GHL-PIPELINE] Sync de oportunidades/pipelines de GHL

**Qué es:** la sección 05 del documento fuente le asigna al **GHL pipeline** los "Stage counts, set/close, follow-up" — o sea, los conteos por etapa del embudo DM. La integración GHL de OTC consume `/calendars` y `/contacts`, pero no `/opportunities` ni `/pipelines`.

**Efecto:** el embudo DM no se puede medir según el estándar hasta que exista. Contra lo que se asumió en la Fase 1, el DM **no** era construible end-to-end.

**Acción:** extender `lib/ghl/` con sync de oportunidades y sus etapas, y agregar las fuentes correspondientes a `lib/funnels/sources.ts`.

---

~~### [DB-PLANES] Aplicar migración de tabla plans en Supabase~~ ✅ Completado 2026-08-26

---

## 🟡 Trial Reels — Feature en producción, mejoras pendientes



### [TRIAL-4] Assets reales de LUT y música en el worker (Fly.io)

**Qué es:** `apps/reel-worker/luts/` solo tiene `.gitkeep`. Las variantes V3 (música) y V5 (color) usan fallbacks de baja calidad.  
**Efecto actual:**
- V5 (color): usa `eq` filter en lugar del LUT cálido → colorimetría plana
- V3 (música): sale en silencio si no hay `background-music.mp3`

**Acción:** Conseguir/crear un `warm.cube` (LUT cálido) y un `background-music.mp3` libre de derechos, ponerlos en `apps/reel-worker/luts/` y hacer redeploy en Fly.io.  
**Quién puede hacerlo:** Santiago (conseguir los assets) + Claude (commit + redeploy)

---

## 🟠 Bugs conocidos — Verificar en producción

### [BUG-1] Stories de Instagram — verificar en producción tras fix

**Contexto:** Fix deployado en `claude/architecture-review-improvements-fdj4ae`. Ahora usa el endpoint correcto `GET /v1/accounts/{accountId}/instagram/stories` + fallbacks. Las historias se fuerzan a `postType='story'` antes del dedup y entran primero en `allPosts`.  
**Para verificar:** Con una historia activa en Instagram → sync manual desde `/marketing/content` → el log `[syncZernioContent] stories sync` debe mostrar `fromDedicatedEndpoint > 0` → ir al tab "Historias" en la UI.  
**Si sigue sin aparecer:** Revisar que el registro en DB tenga `type='story'` (puede ser que exista como `type='post'` de syncs anteriores; el próximo sync lo corrige vía UPDATE).  
**Archivos clave:** `app/marketing/content/sync-actions.ts`, `lib/zernio/client.ts`

---


## 🟣 Nuevos Features — Implementar cuando Santiago lo indique

### [UI-21ST] Cuatro componentes de 21st.dev relevados — decidir cuáles entran

**Qué es:** el relevamiento completo (instalación, dependencias, código de uso, prompts y checklist) está en **[`docs/COMPONENTES_21ST.md`](./docs/COMPONENTES_21ST.md)**. Leerlo antes de correr cualquier `21st add`.

**Decisiones abiertas:**
- **Dropdown Range Date Picker** (`ruixen.ui`) — el de mayor valor: filtro de rango de fechas para `/marketing/anuncios`, `/finance/*`, `/executive-reports` y `/sales/closing`. **Bloqueado por dos cosas:** no declara licencia, y hay que verificar que exponga `value`/`onChange` (si el rango se queda adentro del componente, no sirve para filtrar).
- **Adaptive Notch Navigation Bar** (`arunachalam`) — técnicamente el más limpio (cero dependencias de registry), pero es navegación horizontal y `CLAUDE.md` dice que la navegación es solo sidebar. Decisión de producto: ¿va en `(landing)` / `(founder)`, o no va?
- **Tabs variante `button`** (`sean0205`/ReUI) — **no instalar.** Portar la variante a `packages/ui/src/primitives/tabs.tsx` con `cva`, dejando `default` igual que hoy.
- **Statistics Card 1** (`sean0205`/ReUI) — **no instalar.** Ya tenemos `MetricCard`, `MetricStat` y `MetricBand`. Lo único que aporta es el menú `⋯` por tarjeta; portarlo a `MetricCard` como prop `actions`.

**Prerrequisito para cualquiera de los dos primeros:** sesión de 21st.dev (`npx @21st-dev/cli@latest login`). Sin credenciales el registry devuelve 403.

---

### [FEAT-EMBUDOS] Módulo de Embudos — motor genérico + plantillas por tipo de funnel

**Qué es:** Módulo de medición que permite al usuario intercambiar entre "vistas" de embudos (Webinar, VSL book-a-call, DM, y los que vengan), cada uno con su estructura, sobre un spine universal de 7 etapas. Análisis completo y decisiones cerradas en **[`docs/FUNNELS_ARCHITECTURE.md`](./docs/FUNNELS_ARCHITECTURE.md)** — leer antes de implementar.

**Principio no negociable:** un tipo de embudo es un dato, no un módulo. Agregar un embudo nuevo = agregar un archivo de plantilla en TS. Si hace falta escribir un componente, la arquitectura falló.

**Fases:**
1. ~~**Fase 0** — Normalizar el documento a schema~~ ✅ **Completada 2026-08-29.** `lib/funnels/` con spine, tipos, las 3 plantillas, KPIs universales, health bands, instrumentación y validador. Typecheck + lint limpios, validador con 0 problemas. **Pendiente: revisión de Santiago del schema antes de arrancar la Fase 1.**
2. ~~**Fase 1** — Instancias + resolver + página genérica~~ ✅ **Completada 2026-08-29.** Migración, catálogo de fuentes, capa pura de cálculo, resolver contra Supabase, Server Actions, índice y detalle genérico. **Pendiente: aplicar la migración `20260829120000_funnels_phase1.sql` en Supabase y activar el add-on `embudos` en la org.**
3. **Fase 2** — Parcial. ✅ Configuración de fuentes por step (2026-08-29). ⏸️ Health bands y `diagnoseFunnel()` **en pausa por pedido de Santiago** hasta nuevo aviso.
4. **Fase 3** — Switcher + segunda y tercera instancia. **Bloqueada por el track de integraciones.**
5. **Fase 4** — KPIs universales + `/funnels/comparar` con agrupación por price point.
6. **Fase 5** — Snapshots periódicos + pulso diario.

**Riesgo principal:** el resolver nunca debe devolver `0` por ausencia de datos. Si lo hace, el diagnóstico marca huecos de instrumentación como roturas de negocio y el founder pierde confianza en el módulo. `ResolvedMetric.value` es `number | null` y la UI distingue etapa salteada / sin datos / bajo el piso.

**Deuda a resolver en el camino:** tabla propia `funnel_period_snapshots` (`metrics_snapshots` no sirve — su UNIQUE colisiona con varias instancias por org); `resolveSourceValue` necesita ventana temporal; no existe timezone de reporte por org.

**Testing:** ✅ Vitest incorporado al monorepo (2026-08-29) y CI corriendo `pnpm test` en cada push. El backlog completo de tests pendientes del repo está en [`docs/TESTING_BACKLOG.md`](./docs/TESTING_BACKLOG.md) — 24 ítems priorizados, pensados para que los tome un agente tester. 153 tests de conformidad verifican las plantillas contra el documento fuente. Cuando llegue una versión nueva del documento, actualizar `lib/funnels/__tests__/document-fixture.ts` primero y dejar que los tests señalen qué plantillas quedaron atrás.

---

### [FEAT-EMBUDOS-INTEGRACIONES] Track de integraciones bloqueante para Embudos

**Qué es:** Santiago definió que las etapas de Webinar y VSL se llenan **sí o sí con integración** (sin input manual como salida) y que la atribución sigue tal cual asume el documento fuente. Eso convierte estas integraciones en prerrequisito de la Fase 3 de `[FEAT-EMBUDOS]`, no en mejora futura.

| Integración | Alimenta | Bloquea |
|---|---|---|
| **Hyros** | Atribución real, ROAS by-source, EPL, journeys | Etiquetado `[Hyros]`, KPIs universales |
| **WebinarJam / Zoom** | Show-up rate, stick rate, CTA clicks | Embudo Webinar entero (etapa Engaged) |
| **Hosting de VSL con analytics** | Play rate, avg watch % | Embudo VSL (etapa Engaged) |
| Scoring de calificación | Qualified rate de aplicaciones | Etapa Intent del VSL |

**Decisión abierta:** qué proveedor de hosting de video se soporta para el VSL (Wistia, Vimeo, YouTube, player propio). Cada uno tiene un modelo de analytics distinto — hay que resolverlo antes de escribir el binding de la etapa Engaged.

**Nota:** Whop / Fanbasis del documento quedan cubiertos por los equivalentes que OTC ya tiene (Stripe + Mercado Pago). No bloquean.

---

### [FEAT-GHL-OAUTH] GHL OAuth / Marketplace App — migrar de Private Integration Token a OAuth

**Qué es:** Cuando OTC sea aprobado como app en el GHL Marketplace, reemplazar el flujo de Private Integration Token por OAuth estándar ("Connect with GHL"). El proceso de aprobación de GHL es lento.
**Estado actual:** Integración funcional con Private Integration Token. El usuario pega el token + Location ID manualmente.
**Pendiente:**
1. Registrar OTC como app en GHL Marketplace (proceso manual de Santiago)
2. Agregar `GHL_CLIENT_ID` y `GHL_CLIENT_SECRET` a env vars
3. Implementar `/api/integrations/ghl/oauth/start` → `/api/integrations/ghl/oauth/callback`
4. Reemplazar StepCredentials en `ghl-connect-dialog.tsx` por botón "Conectar con GHL"
5. Actualizar `ghl_integrations` para guardar `access_token` + `refresh_token` en lugar de `api_key_encrypted`

**Decisión tomada:** Private Integration Token ahora; OAuth cuando sea posible.

---

### [FEAT-EXCEL-IMPORT-FASE3-RESTANTE] Importación de pagos y consumo de metrics_snapshots

**Qué es:** Lo que queda de importación de datos:
- Importación de pagos (tab "Pagos") — clientes y llamadas cubiertos, pagos no
- Oportunidades de GHL (pipeline) → closing_calls como stretch goal
- Conectar `metrics_snapshots` a módulos de Finanzas y Métricas de ventas para visualizar los datos importados

**Estado:** ✅ **COMPLETADO (2026-08-25)**. Arquitectura baseline-live implementada en todos los paneles: `finance-data-provider` (financeSummary + monthlySeries), Dashboard, Finance metrics, Intelligence module, Agente de IA (org-context). Column mapper implementado. Deuda menor: si el archivo tiene filas de totales/subtítulos en columna A, aparecen como opciones en el dropdown — sin filtrado por ahora.
**Complejidad:** Media

---

### [FEAT-1] Secuencias de historias

**Qué es:** Feature para planificar y publicar secuencias de historias de Instagram como una unidad cohesiva.  
**Estado DB:** Tablas `story_sequences` y `story_frames` ya creadas en producción (migración 20260811140000). Listas para usar.  
**Pendiente:** Análisis conjunto con Santiago + implementación de UI y acciones.  
**Preguntas a resolver antes de implementar:**
- ¿Zernio soporta publicación de historias? ¿Individual o en lote?
- ¿Qué tipo de contenido va en cada historia (video, imagen, texto)?
- ¿El founder define la secuencia en OTC o en Zernio?
- ¿Hay delay entre historias de la misma secuencia?
- ¿Cómo se integra con el módulo de Marketing/Contenido existente?

---

### [FEAT-2] Análisis de competidores

**Qué es:** Feature para que el founder monitoree cuentas de competidores y extraiga insights de su estrategia de contenido.  
**Estado DB:** Tablas `competitors` y `competitor_posts` ya creadas en producción (migración 20260811150000). Listas para usar.  
**Pendiente:** Análisis conjunto con Santiago + implementación de UI, acciones y análisis IA.  
**Preguntas a resolver antes de implementar:**
- ¿Desde dónde se obtienen los datos? (Zernio, scraping, API de Meta, entrada manual)
- ¿Qué se analiza? (frecuencia, formatos, hooks, CTAs, temas, engagement)
- ¿Dónde vive en el producto? (¿tab en Marketing? ¿módulo separado?)
- ¿La IA genera un reporte periódico o es on-demand?
- ¿Cuántos competidores por org?

---

## 🟢 Deuda técnica — Phase 2 (baja urgencia)

*(TECH-1 y TECH-2 completados — ver tabla abajo)*




### [TECH-4] VSL Player placeholder en landing

**Contexto:** `components/landing/vsl-player.tsx:37` renderiza un placeholder cuando no hay `NEXT_PUBLIC_VSL_URL`. Cuando exista el video de ventas real, setear esa env var en Vercel.  
**Archivos clave:** `components/landing/vsl-player.tsx`

---

### [TECH-5] Badge `children` en React 19 — revisión global

**Contexto:** `packages/ui/src/primitives/badge.tsx` fue corregido, pero hay ~15 archivos pre-existentes con el mismo patrón (`extends React.HTMLAttributes` sin `children?: React.ReactNode`) que Vercel ignora por caché de Turbo. En un rebuild limpio fallarían.  
**Acción:** Hacer un `grep -rn "HTMLAttributes" packages/ui/src/` y agregar `children?: React.ReactNode` a todos los componentes que lo necesiten.

---

## ✅ Completados (referencia histórica)

| Fecha | Ítem | Branch |
|-------|------|--------|
| 2026-08-30 | EMBUDOS-I6: integración VTurb — caché por período (engagement_rate es un promedio y no se puede sumar entre días), M12 sólo cuando el player tiene pitch time, catálogo de videos y selector en el formulario de fuentes. 351 tests en verde | `Claude-New-Features` |
| 2026-08-30 | EMBUDOS-I4: oportunidades de GHL — historial propio de transiciones de etapa (GHL no lo expone), período ciego explícito, webhook con dos vías de autenticación, tres fuentes de embudo con etapa configurable. 331 tests en verde | `Claude-New-Features` |
| 2026-08-30 | DOC-EXTERNAL-APIS-2: Whop (897 páginas + 3 specs OpenAPI), Commas ex Fanbasis (42 secciones), Hyros (482 guías + 3 specs) y WebinarJam (17 artículos) bajados a `docs/external-apis/`, con un `RESUMEN-OTC.md` por proveedor. Cierra las seis secciones de `API_DOCS_PENDIENTES.md` | `Claude-New-Features` |
| 2026-08-30 | DOC-EXTERNAL-APIS: documentación completa de GoHighLevel (948 páginas) y VTurb (28 endpoints + `openapi.json`) bajada a `docs/external-apis/`, con scripts de regeneración y dos `RESUMEN-OTC.md` que cierran §3 y §4 de `API_DOCS_PENDIENTES.md` | `Claude-New-Features` |
| 2026-08-26 | FEAT-GHL-MULTI-CALENDAR: multi-selección de calendarios GHL + filtro en closing panel | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-26 | UI-CLEANUP: Eliminación botón flotante del agente (FloatingChat) + fix layout integrations page (min-w-0) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-PLANES-CUOTAS-CLIENTES: planes con sistemas de cuotas, eliminar clientes, asignar plan, closing con cuotas manuales — migración SQL pendiente de aplicar en Supabase | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-VENTAS-CASH-COLLECTED: panel de métricas de ventas usa gastosTotales del provider (no snapshot) para cash collected | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-BASELINE-GAPS: Baseline fallback en Intelligence module (collect-context.ts) y monthlySeries (finance-data-provider) — cierran los dos últimos vacíos de la arquitectura baseline | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-BASELINE-ARCHITECTURE: Arquitectura baseline escalable — baseline-service.ts, finance-data-provider fallback, Dashboard, Finance metrics, agente IA, data_source column en metrics_snapshots | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-METRICS-DERIVE: Auto-derivación de métricas combinadas al importar — deriveSalesMetrics (close_rate, show_rate, tasa_agendamiento, tasa_fantasma, inasistencias, no_cierres) y deriveFinanceMetrics (margen, pct_margen); mapper de filas reducido a solo métricas primarias (11 ventas, 4 finanzas) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-TRANSPOSED-ROW-MAPPER: Mapeo manual de filas en formato pivot — TransposedRowMapper con dropdowns por campo OTC, auto-sugerencia desde diccionario, rowMapping pasado al parser, texto de confirm corregido (upsert) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-PIVOT: Soporte formato pivot en importación de métricas — auto-detección de meses como columnas, parser transpuesto, banner "Formato tabla detectado", fix preview para archivos con título merged (resuelve __EMPTY) | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-EXCEL-PREVIEW: getExcelPreviewAction ahora usa { header: 1 } y salta filas de título — fix para archivos con celdas merged/título en la primera fila | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FIX-VERCEL-BUILD x4: prefer-const, unused imports/props, SectionDef[] filter inference, keyof Union type — 4 errores de build de Vercel corregidos en serie | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-MULTISHEET: Selector de hoja en wizard de importación Excel — heurística pickBestSheet, SheetSelector UI, re-fetch al cambiar hoja, re-auto-mapeo | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-25 | FEAT-EXCEL-COLUMN-MAPPER: UI de mapeo columna-a-columna para archivos Excel propios — paso "mapper" en wizard, auto-mapeo, vista previa, validación de campos requeridos | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-UTM: Atribución UTM en closing calls — fetch attributionSource del contacto GHL durante sync, columna + panel de detalle en UI | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-PHASE2: Importación datos históricos GHL contacts + Excel clientes/llamadas — wizard 3 pasos, parsers Excel, preview GHL, server actions | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FIX-GHL-TIMESTAMPS: GHL `/calendars/events` requiere Unix ms, no ISO 8601 — fix sync que devolvía 0 citas | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-24 | FEAT-GHL-PHASE1: Integración GoHighLevel Calendar — Private Integration Token, sync horario, UI dialog multi-paso, badges de origen en closing | `claude/ghl-integration-data-loading-9cd72n` |
| 2026-08-23 | BUG-3: Patrón UTC-midnight — isInCurrentMonth (enrich-team-compensation.ts) + periodBounds (cta-actions.ts) | `feat/trial-retry-variation` |
| 2026-08-23 | BUG-2: Gráfico distribución ya incluye content_pieces Zernio (ya estaba implementado) | `main` |
| 2026-08-23 | TRIAL-1: Reintentar variante fallida — botón en variation-card.tsx + retryVariationAction (ya existía implementado) | `main` |
| 2026-08-23 | refactor(agent/marketing): split de action files grandes — agent/actions.ts (1665→1252 líneas) + canvas-actions.ts + workboard-actions.ts; marketing/actions.ts (963→536 líneas) + utm-actions.ts | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | Sentry integration (client/server/edge configs + withSentryConfig en next.config.ts) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | perf(holding): RPC get_holding_dashboard_stats — 28 queries → 2 paralelas | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | fix(holding): dropdown del switcher de negocios scrollable (max-h-[280px]) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | feat(crons): fan-out QStash para sync-metrics, intelligence-snapshot, executive-report, founder-tone | `claude/qstash-fanout-playwright` |
| 2026-08-24 | fix(e2e): clearCookies() en beforeEach para garantizar refresh token virgen (tests 6/7 holding) | `claude/architecture-review-improvements-fdj4ae` |
| 2026-08-23 | feat(testing): Playwright E2E setup + tests holding flow (pendiente ejecutar con cuenta real) | `claude/qstash-fanout-playwright` |
| 2026-08-11 | TECH-1: Fathom deep analysis vía QStash (reemplaza void pattern que se perdía en Vercel) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TECH-2: Retención real YouTube Analytics API (fallback gracioso a estimación) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | SEED: Limpieza de 171 registros ficticios en Supabase prod (org `46cce98c-...`) | directo en DB |
| 2026-08-11 | TECH-3: Mecanismo add-ons por org (DB + permisos + sidebar dinámico + super-admin toggle) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TRIAL-3: Música personalizable por org en Trial Reels | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | TRIAL-2: Botón "Generar con IA" para captions/hashtags por variante | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | BUG-1: Sync de stories de Instagram via Zernio (doble estrategia con fallback) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | Upload real de video a Zernio en Trial Reels (bug crítico) | `feat/trial-reels-video-upload` |
| 2026-08-11 | Email de notificación cuando todos los reels terminan de publicar | `feat/trial-reels-video-upload` |
| 2026-08-11 | Cron de limpieza de Storage (`trial-reels` bucket, 30 días) | `feat/trial-reels-video-upload` |
| 2026-08-11 | Delay real entre publicaciones con QStash (reemplazó setTimeout fake) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-11 | Estado "scheduled" para variantes encoladas en QStash | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-10 | Fix reel-worker crasheaba en Node.js 20 (migrar a Node.js 22) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-10 | Auth triple redundancia worker (X-Worker-Secret + Bearer + query param) | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-09 | Fix MRR=0 y Nuevos clientes=0 en Panel General | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix errores 403 en consola por URLs CDN de Instagram expiradas | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix React #418 (hidratación) en detalle de contenido | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix "Conectá tus redes" en dashboard aunque Zernio estuviera conectado | `claude/marketing-module-console-errors-g2py5w` |
| 2026-08-08 | Fix panel ManyChat roto en página de integraciones | `claude/marketing-module-console-errors-g2py5w` |

---

*Creado: 2026-08-11. Actualizar con cada sesión — mover ítems completados a la tabla de abajo.*
