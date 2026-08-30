# API_DOCS_PENDIENTES.md — Documentaciones que hay que verificar

> **Para Santiago:** esta es la lista de todo lo que se implementó **sin poder leer
> la documentación oficial de la API**. Al terminar las olas de integración, pasame
> estas documentaciones y se corrige todo junto.
>
> **Para Claude Code:** ver la regla al final. Cada vez que implementes contra una
> API cuya documentación no puedas leer, **agregá una entrada acá**.

---

## Por qué existe este archivo

Ningún dominio de documentación de API era alcanzable desde el entorno de
desarrollo remoto: la política de red los bloqueaba a todos. Verificado el
2026-08-29 contra `docs.whop.com`, `apidocs.fan`, `vturb.gitbook.io`,
`api-docs.hyros.com`, `docs.hyros.com`, `highlevel.stoplight.io`,
`marketplace.gohighlevel.com`, `developers.zoom.us` y `help.webinarjam.com` —
**los nueve bloqueados**.

> **2026-08-30 — el bloqueo ya no existe.** Se volvieron a probar todos los dominios y
> **los seis proveedores son alcanzables**. La documentación completa de los seis está
> commiteada en **[`docs/external-apis/`](./external-apis/)**, con el proceso
> reproducible (`docs/external-apis/tools/regenerar.sh`). Eso cierra **todas** las
> secciones de este archivo.
>
> Dos aclaraciones sobre los dominios que figuraban como bloqueados:
> - **`apidocs.fan` ya no es la documentación de Fanbasis.** Fanbasis se llama
>   **Commas** y su doc vive en `commasdocs.com`. El API sigue en `www.fanbasis.com`.
> - **`api-docs.hyros.com` y `hyros.docs.apiary.io` responden los dos**, con contenido
>   distinto: el primero publica los specs OpenAPI vigentes (v1.40), el segundo el
>   documento de Apiary viejo (v1.37).
>
> **Antes de dar por bloqueado cualquier dominio, probarlo.**

Eso no impide construir, pero cambia **cómo** hay que construir. El patrón que se
sigue en todas estas integraciones:

1. **Persistir el payload crudo antes de interpretarlo.** El primer evento real de
   cada proveedor pasa a ser la fuente de verdad.
2. **Nunca inventar un valor.** Lo que no se entiende queda marcado como no
   mapeado, con su motivo. Un cobro cuyo monto no se lee **no es un cobro de cero**.
3. **Aislar el mapeo en un solo archivo** por proveedor, con la advertencia en el
   encabezado, para que corregirlo sea puntual y no una arqueología.
4. **Dejar la entrada acá** con qué falta exactamente.

---

## Estado

Toda la documentación está capturada. Lo que queda es **corregir el mapeo de pagos**,
que se escribió a ciegas, y verificar contra cuentas reales.

| Proveedor | Unidad | Estado del código | Documentación | Qué falta |
|---|---|---|---|---|
| **Whop** | I-2 | Construido a ciegas | ✅ [resumen](./external-apis/whop/RESUMEN-OTC.md) | 🔧 **Corregir el campo de monto** — ver §1 |
| **Commas** (ex Fanbasis) | I-2 | Construido a ciegas | ✅ [resumen](./external-apis/commas/RESUMEN-OTC.md) | 🔧 Confirmar firma y payloads — ver §2 |
| **GHL opportunities** | I-4 | Sin empezar | ✅ [resumen](./external-apis/gohighlevel/RESUMEN-OTC.md) | Construir, sabiendo que **no hay historial de etapas** |
| **VTurb** | I-6 | Sin empezar | ✅ [resumen](./external-apis/vturb/RESUMEN-OTC.md) | Construir |
| **WebinarJam / EverWebinar** | I-5 | Sin empezar | ✅ [resumen](./external-apis/webinarjam/RESUMEN-OTC.md) | **Pedir la API key** (requiere aprobación) y construir |
| **Hyros** | I-8 | Sin empezar | ✅ [resumen](./external-apis/hyros/RESUMEN-OTC.md) | Construir |

---

## 1. Whop — unidad I-2 — ✅ **documentación capturada**, queda corregir el código

**Documentación:** https://docs.whop.com — **capturada el 2026-08-30** en
[`docs/external-apis/whop/`](./external-apis/whop/): 897 páginas y los **3 specs
OpenAPI oficiales** que Whop publica.

**Leer antes de tocar el código:**
[`external-apis/whop/RESUMEN-OTC.md`](./external-apis/whop/RESUMEN-OTC.md).

### Las cinco preguntas, respondidas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | Lista de eventos de webhook | ~60 eventos en 25 recursos. Los de pagos: `payment.succeeded/.failed/.created/.pending/.authorized/.canceled`, `refund.created/.updated`, `membership.activated/.deactivated/.trial_ending_soon/.cancel_at_period_end_changed`, `invoice.*`, `dispute.*` |
| 2 | Payload exacto | Envelope `{ id, type, api_version, api_version_date, timestamp, account_id, data }`. El objeto va bajo **`data`**. Con pin anterior a `2026-08-14` el campo de cuenta es `company_id`, no `account_id` |
| 3 | Esquema de firma | **Standard Webhooks**, como se asumió: headers `webhook-id` / `webhook-timestamp` / `webhook-signature` (`v1,<base64>`), HMAC-SHA256 de `{id}.{timestamp}.{body}`, ventana de 5 minutos. **El prefijo del secreto es `ws_`, no `whsec_`, y se usa como clave literal** |
| 4 | Centavos o unidades | **Unidades, decimales.** El spec: *"the refunded amount as a decimal in the specified currency, such as 10.43 for $10.43 USD"* |
| 5 | Backfill histórico | Sí: `GET /payments`, `/refunds`, `/memberships`, `/members`, `/invoices` |

### 🔧 Lo que hay que corregir en `lib/payments/normalize.ts`

1. **El campo de monto no existe.** `KEYS.amount` busca `settled_amount`, que no
   existe; el campo real es **`settlement_amount`** (*"the total amount charged to the
   customer, including taxes and after any discounts"*). `total` y `subtotal` sí
   existen pero son *"to show to the creator (excluding buyer fees)"* — otra cosa.
   Hay que agregar `settlement_amount` y decidir explícitamente qué medida usa cuál.
2. **`membership.created` no existe.** El evento de alta es `membership.activated`.
   Conviene reemplazar los regex de detección por la lista literal de eventos.
3. **La deduplicación va por `webhook-id`.** Whop entrega *at least once* y reintenta
   12 veces durante ~71 horas, con el mismo id. El orden no está garantizado.

---

## 2. Commas (ex Fanbasis) — unidad I-2 — ✅ **documentación capturada**

> **Fanbasis se llama Commas.** `apidocs.fan` no es la documentación vigente:
> es **`commasdocs.com`**. El API sigue en `www.fanbasis.com`.

**Documentación:** https://commasdocs.com — **capturada el 2026-08-30** en
[`docs/external-apis/commas/`](./external-apis/commas/).

**Leer antes de tocar el código:**
[`external-apis/commas/RESUMEN-OTC.md`](./external-apis/commas/RESUMEN-OTC.md).

### Las cuatro preguntas, respondidas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | **Esquema de firma y cabecera** | Cabecera **`x-webhook-signature`**. HMAC-SHA256 sobre el **body crudo**, codificado en **hex**, con el secreto **tal cual** (sin prefijo ni base64). Sin timestamp: no hay protección de replay del proveedor |
| 2 | Eventos y payloads | `payment.succeeded/.failed/.canceled/.expired`, `refund.created`, `product.purchased`, `subscription.created/.renewed/.canceled/.completed/.past_due/.recovered`, `dispute.created/.updated` |
| 3 | REST para backfill | Sí: `/public-api/transactions/:id`, `/checkout-sessions/transactions`, `/subscribers`, `/customers`, `/products` y sus variantes por producto y por sesión |
| 4 | **Valor contratado total** | `amount_cents` × `subscription.auto_expire_after_x_periods`. Si ese campo es `null`, la suscripción es indefinida y **no hay valor contratado** — queda `unmapped`, no cero |

### 🔧 Lo que hay que tener en cuenta

- **Commas manda centavos (`amount_cents`), Whop manda unidades decimales.** Los dos
  proveedores de la misma unidad usan convenciones opuestas: la regla tiene que ser
  por proveedor, no una heurística de sufijo.
- **Siempre `https://www.fanbasis.com`**, nunca el apex: el `301` descarta los bodies
  de `POST`.
- **El `429` usa otro envelope** (`{"success": false}` en vez de
  `{"status": "error"}`).
- **Ids mezclados**: hashids cortos para productos/sesiones/transacciones, enteros
  planos para customers/subscriptions. El filtro `customer_id` de `/subscribers` pide
  el entero, y el hashid que ese mismo endpoint devuelve **no matchea**.

---

## 3. GHL — oportunidades y pipelines (unidad I-4) — ✅ **resuelta**

**Documentación:** https://marketplace.gohighlevel.com/docs/ — **capturada el
2026-08-30** en [`docs/external-apis/gohighlevel/`](./external-apis/gohighlevel/)
(948 páginas, 634 endpoints, 77 webhooks).

**Leer antes de arrancar I-4:**
[`external-apis/gohighlevel/RESUMEN-OTC.md`](./external-apis/gohighlevel/RESUMEN-OTC.md).

### Las cinco preguntas, respondidas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | Endpoint de pipelines y etapas | `GET /opportunities/pipelines?locationId=` |
| 2 | Listar oportunidades con filtro por fecha y etapa | `GET /opportunities/search` (filtros simples) y `POST /opportunities/search` (avanzada, con `stageAggregations`) |
| 3 | Nombres de campo de una oportunidad | `id`, `locationId`, `contactId`, `pipelineId`, `pipelineStageId`, `status`, `monetaryValue`, `name`, `assignedTo`, `source`, `dateAdded`, `forecastExpectedCloseDate`, `forecastProbability`, `customFields` |
| 4 | **¿Hay historial de cambios de etapa?** | **No.** No existe endpoint de historial, ni filtro por transición, y el webhook `OpportunityStageUpdate` trae la etapa nueva pero no la anterior ni el timestamp del cambio |
| 5 | Paginación y rate limits | Cursor (`startAfter`/`searchAfter`) o `page`+`limit`≤100 · 100 req/10 s y 200.000/día por app y por sub-account, con headers `X-RateLimit-*` |

### Lo que cambia el diseño de I-4

La respuesta a la pregunta 4 es la que importa: **los conteos por etapa durante un
período (M21, M22, M23, M25) no se pueden leer de la API**, ni con backfill. GHL sólo
sabe en qué etapa está una oportunidad hoy.

La única fuente de transiciones son los webhooks (`OpportunityCreate`,
`OpportunityStageUpdate`, `OpportunityStatusUpdate`, …), en tiempo real y sin
historia previa. Entonces I-4 tiene que **construir su propio historial** en OTC a
partir de esos eventos, derivando la etapa anterior contra la última conocida, y
**mostrar explícitamente el período ciego** anterior a la suscripción. Un cero antes
de esa fecha no es un cero: es "no lo sabemos".

### Lo que queda sin verificar

La doc de GHL **no expande los objetos de respuesta**: `GET /opportunities/:id`
devuelve `opportunity: object` y `GET /opportunities/pipelines` devuelve
`pipelines: object[]`, sin detallar campos. Esto no es una pérdida de la captura, es
así en el original. Persistir el payload crudo del primer response real y mapear
desde ahí. Detalle en el `RESUMEN-OTC.md`.

---

## 4. VTurb (unidad I-6) — ✅ **resuelta**

**Documentación:** https://vturb.gitbook.io/analytics-api — **capturada el
2026-08-30** en [`docs/external-apis/vturb/`](./external-apis/vturb/), incluido un
[`openapi.json`](./external-apis/vturb/openapi.json) con los 28 endpoints,
reconstruido desde los documentos OpenAPI que la propia doc embebe.

**Leer antes de arrancar I-6:**
[`external-apis/vturb/RESUMEN-OTC.md`](./external-apis/vturb/RESUMEN-OTC.md).

### Las cinco preguntas, respondidas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | URL base y autenticación | `https://analytics.vturb.net` · headers `X-Api-Token` y `X-Api-Version: v1` |
| 2 | Endpoints y nombres de métricas | 28 endpoints — ver [`ENDPOINTS.md`](./external-apis/vturb/ENDPOINTS.md) |
| 3 | **¿La retención es promedio o curva?** | **Las dos.** `POST /times/user_engagement` devuelve `average_watched_time`, `engagement_rate` (con fórmula documentada) **y `grouped_timed[]`**, la curva `{ segundo, usuarios }` |
| 4 | Cómo se identifica un video | Por `player_id`. `GET /players/list` los lista con `duration`, `pitch_time` y filtro por nombre |
| 5 | Rate limits | 60/120/300/800 req/min según plan, más tope diario. `GET /quota/usage` devuelve el consumo en vivo y el `resets_at` del `429` |

### Lo que cambia el diseño de I-6 — para mejor

M12 (`vsl_reached_cta`) iba a haber que derivarlo de la curva. Resulta que **VTurb ya
modela el concepto**: `/sessions/stats` devuelve `total_over_pitch`,
`total_under_pitch` y `over_pitch_rate`, y `/players/list` devuelve el `pitch_time`
configurado de cada player. O sea que el segundo del CTA tampoco hay que
configurarlo a mano en OTC.

- **M10** `vsl_plays` → `total_started` (y `play_rate` ya viene calculado)
- **M11** `vsl_avg_watch_pct` → `engagement_rate`
- **M12** `vsl_reached_cta` → `total_over_pitch`, con la curva como verificación cruzada

### Lo que queda sin verificar

1. La discrepancia de versión: la doc de auth dice `v1`, el spec declara `v3`.
2. Los campos del objeto `Stats` **no tienen descripción** en el spec — hay que
   confirmar la semántica de `viewed` vs `started` y de los sufijos `_device_uniq` /
   `_session_uniq` contra el dashboard.
3. Que `total_over_pitch` sea efectivamente "llegó al CTA".
4. `/smart_autoplays/stats_by_player` aparece en las release notes pero no en la
   referencia.

---

## 5. WebinarJam / EverWebinar (unidad I-5) — ✅ **resuelta**

**Documentación:** el centro de ayuda de WebinarJam — **capturada el 2026-08-30** en
[`docs/external-apis/webinarjam/`](./external-apis/webinarjam/) (17 artículos).

**Leer antes de arrancar I-5:**
[`external-apis/webinarjam/RESUMEN-OTC.md`](./external-apis/webinarjam/RESUMEN-OTC.md).

### Las seis preguntas, respondidas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Cuál de los dos usan? | **No hace falta elegir.** Son la misma API con dos prefijos: `/webinarjam/*` y `/everwebinar/*`. Los endpoints y payloads son idénticos. Se construye una vez y el prefijo es configuración |
| 2 | Registrantes y asistentes | `POST /registrants`, con filtros por asistencia, compra, rango de fechas y búsqueda |
| 3 | ¿Vivo vs replay? | **Sí, separado**: `attended_live`/`attended_replay`, `date_*`, `time_*`, `purchased_*`, `revenue_*` |
| 4 | **¿Hasta qué minuto se quedó?** | **Sí.** `time_live`/`time_replay` por registrante, **y** el filtro `attended_live=4` + `attended_live_timestamp=<segundo>` devuelve directamente los que se quedaron más allá de ese segundo. **M15 sale del servidor** |
| 5 | ¿Clicks al CTA? | **No.** M16 no se puede leer. Lo más cercano es `purchased_live`/`revenue_live`, que es conversión, no intención — no presentarlo como si fuera M16 |
| 6 | Auth y rate limits | `api_key` de 64 caracteres **en el body del POST** (no header), TLS obligatorio, máximo **20 llamadas por segundo**. **La key requiere aprobación previa de WebinarJam** |

**Bonus:** `/registrants` devuelve los **UTMs completos** de cada registrante
(`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`), así que el
registro se puede atar a la fuente sin depender de Hyros para ese paso.

**Trampa de modelado:** un `schedule_id` puede referirse a una **serie entera** de
webinars. Para apuntar a una sesión concreta hace falta `webinar_id` + `schedule_id` +
la fecha.

> **Zoom queda descartado de la pregunta**: WebinarJam y EverWebinar comparten API, así
> que si el cliente usa cualquiera de los dos, la integración es la misma. Zoom sólo
> haría falta si algún cliente usa Zoom Webinars, que es un producto distinto.

---

## 6. Hyros (unidad I-8) — ✅ **resuelta**

**Documentación:** **capturada el 2026-08-30** en
[`docs/external-apis/hyros/`](./external-apis/hyros/): los **3 specs OpenAPI 3.1**
vigentes (REST v1.40, webhooks, MCP), el documento viejo de Apiary (v1.37) y las
**482 guías** de docs.hyros.com.

**Leer antes de arrancar I-8:**
[`external-apis/hyros/RESUMEN-OTC.md`](./external-apis/hyros/RESUMEN-OTC.md).

### Las seis preguntas, respondidas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | URL base y auth | `https://api.hyros.com/api/v1.0/` con header **`API-Key`** |
| 2 | Leads y journey | `GET /leads` con `fromDate`/`toDate` y **`updatedFromDate`** para sync incremental. `GET /leads/journey` (máx. 50 por request) trae ventas, llamadas, carritos, suscripciones y leads vinculados; con `includeEvents=true` agrega el array cronológico de eventos → **M07** |
| 3 | **Revenue por fuente (M05)** | `GET /attribution` con `attributionModel` (`last_click`/`first_click`/`scientific`), `level` (campaña, adset, ad, keyword…), `fields` (más de 70 métricas: `revenue`, `sales`, `leads`, `cost`, `roas`, `cac`, LTV…) y rango de fechas. **También da `cost` → M01 sale de acá y no hace falta cruzar cada plataforma** |
| 4 | Qué identifica una fuente | Un objeto `Source` con `tag` (identificador estable), `name`, `organic`, `disregarded`, más `adSource` (id, ad account y plataforma), `trafficSource`, `goal` y `category`. No es sólo una campaña |
| 5 | **Opt-ins de landing (M08, M09)** | **Sí.** M09 = leads nuevos por `GET /leads` con rango de fechas, o el webhook `lead.opted.in`. M08 ≈ `new_visits` del reporte de atribución (no `clicks`). **Confirma que `I-7` no hace falta como integración aparte** |
| 6 | Rate limits y webhooks | 30 req/s y 1000 req/min, con headers `X-RateLimit-*` y `Retry-After`. **Sí hay webhooks**: 10 eventos, firmados con `X-Hyros-Signature` (`t=<epoch>,v1=<hmac-sha256 hex de t.body>`) |

### Dos trampas que la doc marca y conviene no comerse

- **Las escrituras son asíncronas.** Un `200` en `POST`/`PUT`/`DELETE` significa
  *recibido*, no *aplicado*: las creaciones tardan ~10 s y las actualizaciones ~5 min.
  Releer para confirmar devuelve datos viejos.
- **Los parámetros desconocidos se ignoran en silencio** en casi todos los endpoints.
  La propia doc da el ejemplo: `GET /leads?email=...` (el parámetro es `emails`)
  devuelve `200` con **la lista completa sin filtrar**. OTC tiene que validar su
  propio input.

---

## Regla permanente para Claude Code

> **Antes que nada: probá la URL, y fijate si el proveedor publica un spec.** El
> bloqueo de red que motivó este archivo resultó no existir: el 2026-08-30 los seis
> proveedores respondieron. Si la documentación es alcanzable, **bajala a
> [`docs/external-apis/`](./external-apis/)** con
> `docs/external-apis/tools/regenerar.sh` como modelo, en vez de construir a ciegas.
> Una copia commiteada le sirve a todas las sesiones que vengan después.
>
> Y antes de raspar HTML, buscá el spec: **cuatro de los seis proveedores publican
> OpenAPI** (Whop en `/openapi/*`, Hyros en `/ai-context/*.txt`, VTurb embebido en su
> página de Analytics, y GitBook/Mintlify sirven markdown agregando `.md` a la URL).
> Un spec no se interpreta: se lee.
>
> Recién si de verdad no podés leerla, cada vez que implementes contra una API externa
> **cuya documentación oficial no puedas leer**:
>
> 1. Agregá o actualizá su sección en este archivo, con **qué asumiste**, con qué
>    confianza, y **qué necesitás de la documentación**.
> 2. Poné la advertencia en el encabezado del archivo que hace el mapeo.
> 3. Persistí el payload crudo antes de interpretarlo, para que el primer dato real
>    sea la fuente de verdad.
> 4. Nunca inventes un valor: lo que no se entiende queda marcado, no vale cero.
> 5. Registralo también en `CHANGES.md` como deuda.

---

*Creado 2026-08-29. Actualizado 2026-08-30: **las seis secciones resueltas** con la
documentación capturada en `docs/external-apis/`. Lo que queda no es documentación, es
trabajo: corregir el mapeo de pagos (§1 y §2) y construir I-4, I-5, I-6 e I-8.
Actualizar con cada integración construida a ciegas; borrar la sección cuando la
documentación se haya verificado y el mapeo corregido.*
