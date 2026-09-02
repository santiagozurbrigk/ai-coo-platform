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

> **2026-09-01 — Fathom bajada.** Faltaba el séptimo proveedor: Fathom no estaba
> ni en `docs/external-apis/` ni listado acá, pese a ser la fuente de todas las
> llamadas. `developers.fathom.ai` responde `200` y publica su documentación en
> markdown vía `llms.txt`. Los 39 archivos están en
> **[`docs/external-apis/fathom/`](./external-apis/fathom/)**, con las URLs en
> `docs/external-apis/tools/fathom-urls.txt`.
>
> Leerla corrigió un supuesto del plan del módulo de llamadas: `GET /meetings`
> devuelve **`calendar_invitees[]` con email, dominio e `is_external`**, y un
> campo **`meeting_type`** configurable por organización. OTC descarta los dos.
> El detalle está en
> [`fathom/RESUMEN-OTC.md`](./external-apis/fathom/RESUMEN-OTC.md).

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
| **Fathom** | Llamadas | Construido, en rediseño | ✅ [resumen](./external-apis/fathom/RESUMEN-OTC.md) | ⛔ Tipos de reunión **descartados** (Fathom no etiqueta). 🔴 Falta verificar que la key vea las llamadas del closer — ver §7 |

---

## 1. Whop y Commas — unidad I-2 · ✅ CORREGIDO 2026-08-30

Detalle completo en [`whop/RESUMEN-OTC.md`](./external-apis/whop/RESUMEN-OTC.md) y
[`commas/RESUMEN-OTC.md`](./external-apis/commas/RESUMEN-OTC.md).

**Fanbasis se llama Commas.** El rebranding cambió la marca y la documentación, no
los hosts: el API se sigue sirviendo desde `www.fanbasis.com`, así que el id de
proveedor en la base de datos (`fanbasis`) no cambia.

### Lo que estaba mal y se corrigió

| Bug | Qué pasaba | Corrección |
|---|---|---|
| **Monto de Whop** | `KEYS.amount` no incluía `settlement_amount`. De las claves que buscaba, en el payload real sólo existen `total` y `subtotal`, que la doc define como *"para mostrarle al creador, sin los fees del comprador"* — **no es lo que se le cobró al cliente** | `settlement_amount` primero, con test que fija que no tome `total` ni `subtotal` |
| **Centavos por sufijo** | La conversión se infería del sufijo `_cents`. Whop manda **decimales** y Commas **centavos**: convenciones opuestas | La unidad se declara **por proveedor** en `PROVIDER_CONFIG` |
| **Eventos por regex** | `membership.created` no existe en Whop; el alta es `membership.activated` | Listas literales de eventos por proveedor |
| **Identidad del comprador** | Se buscaba sólo en la raíz | Se busca en `buyer` (Commas) y `user`/`member` (Whop) |
| **Valor contratado** | Se tomaba el monto del evento como si fuera el total | En Commas es `amount_cents × auto_expire_after_x_periods`; si la suscripción es indefinida **no hay total contratado** y queda `unmapped` |

### Firmas — confirmadas

- **Whop**: Standard Webhooks. `{webhook-id}.{webhook-timestamp}.{raw body}`,
  HMAC-SHA256 base64, header `v1,<firma>`, tolerancia 5 min. **La clave es el
  secreto `ws_...` literal** — no se le quita el prefijo ni se decodifica.
- **Commas**: HMAC-SHA256 **hex** sobre el cuerpo crudo, header
  `x-webhook-signature`, secreto `whsk_...` sin transformar. **Sin timestamp**, así
  que no hay protección de replay del proveedor.

### Diferencia operativa que importa

| | Whop | Commas |
|---|---|---|
| Entrega | at **least** once, reintenta ~3 días | at **most** once, **nunca reintenta** |
| Consecuencia | deduplicar por `webhook-id` | **nunca devolver error en un evento procesable**: se pierde para siempre |

Whop además **desactiva endpoints que fallan** (72 h y 10+ fallos), y al reactivarlos
no reenvía lo perdido.

### Backfill — los dos lo permiten

Whop: `GET /payments`, `/refunds`, `/memberships`.
Commas: `GET /public-api/checkout-sessions/transactions`, `/subscribers`, `/customers`.

Queda sin construir: la API key ya se guarda en la UI de conexión pero todavía no se usa.

## 3. GHL — oportunidades y pipelines (unidad I-4)

✅ **VERIFICADO 2026-08-30** contra `docs/external-apis/gohighlevel/`.

### Lo confirmado

| Dato | Valor |
|---|---|
| Base URL | `https://services.leadconnectorhq.com` |
| Auth | `Authorization: Bearer <token>` — el Private Integration Token que OTC ya usa |
| Header obligatorio | `Version: 2021-07-28` (los endpoints de opportunities documentan `Version: v3`) |
| Scopes | `opportunities.readonly`, `opportunities.write` |

**Endpoints:**

| Método | Path | Para qué |
|---|---|---|
| `GET` | `/opportunities/pipelines?locationId=` | Pipelines de la location y sus etapas |
| `GET` | `/opportunities/search` | Oportunidades, con filtros `pipelineId`, `pipelineStageId`, `status`, `date`, `endDate`, `contactId`; paginación por `page` + `limit` (máx 100) o cursor `startAfter` / `startAfterId` |
| `POST` | `/opportunities/search` | Búsqueda avanzada. Devuelve `stageAggregations` — **totales por etapa** cuando hay filtro de pipeline |

### ⭐ La respuesta a la pregunta que decidía el diseño

**No existe ningún endpoint de historial de cambios de etapa.** El REST sólo da el
estado **actual** de cada oportunidad y su `dateAdded`.

**Pero existe el webhook `OpportunityStageUpdate`**, que dispara en cada cambio de
etapa con este payload:

```json
{
  "type": "OpportunityStageUpdate",
  "locationId": "...", "id": "...", "contactId": "...",
  "assignedTo": "...", "monetaryValue": 40, "name": "...",
  "pipelineId": "...", "pipelineStageId": "...",
  "source": "...", "status": "open",
  "dateAdded": "2021-11-26T12:41:02.193Z"
}
```

Hay además `OpportunityCreate`, `OpportunityStatusUpdate`, `OpportunityMonetaryValueUpdate`,
`OpportunityUpdate` y `OpportunityDelete`.

**Consecuencia para I-4:** el documento fuente pide conteos por etapa **en un
período**, así que OTC tiene que **persistir los eventos de cambio de etapa** en
una tabla propia y armar la serie desde ahí. Con sólo el REST, una oportunidad que
pasó por Lead → Engaged → Intent dentro del período se contaría una sola vez, en la
etapa donde quedó.

**Ojo con un detalle del payload:** `dateAdded` es la fecha de creación de la
oportunidad, **no** el momento del cambio de etapa. El momento del cambio es la
hora de recepción del webhook, así que hay que guardarla.

**Limitación asumida:** la historia de etapas arranca el día que se conecten los
webhooks. Hacia atrás sólo se puede reconstruir el estado actual.

### 🔴 Lo que quedó SIN documentación al construir I-4 (2026-08-30)

Tres huecos. El primero es el que puede cambiar código; los otros dos son
nombres de campo que el primer response real resuelve.

**a) El payload del webhook entregado por un Workflow de GHL.**

El problema de fondo: **los webhooks de plataforma se configuran dentro de una app
del Marketplace**, que OTC todavía no tiene aprobada (`[FEAT-GHL-OAUTH]`). La vía
que funciona hoy sin esa app es que el cliente agregue una acción "Webhook" en un
Workflow de su sub-cuenta apuntando a OTC.

Esa vía **no está documentada**: el payload lo arma quien configura el workflow, y
la guía de webhooks del Marketplace no la cubre. Lo que se asumió:

- El evento trae `type` con uno de los nombres de la familia `Opportunity*`.
- El id de la oportunidad puede venir como `opportunityId` o `id`, en la raíz o
  anidado bajo `data`, `opportunity` o `customData`. **`opportunityId` gana sobre
  `id`** porque en un workflow `id` puede ser el contacto.
- Esos eventos **no llevan firma de plataforma**, así que se autentican con un
  secreto compartido por organización en la URL.

Confianza: **baja**. Hay que fijarlo con el primer payload real. Mientras tanto el
evento crudo se persiste en `ghl_webhook_events` antes de interpretarse, y lo que
no se entiende queda `unmapped` con su motivo — nunca se inventa un id ni una
etapa.

**Qué falta saber:** si un Workflow de GHL puede mandar `pipelineStageId` en el
cuerpo, o si hay que armarlo con custom values. Si no pudiera, la vía de workflow
sólo serviría para altas y la unidad quedaría atada a la app del Marketplace.

**b) La forma del objeto `pipeline` y de sus etapas.** La doc dice literalmente
`pipelines: object[]`, sin expandir. Se asumió `id` (o `_id`), `name`, `stages[]`
y dentro de cada etapa `id` (o `_id`), `name`, `position`. El orden del array es
el respaldo de `position`. Se guarda `raw` completo.

**c) La forma del objeto `opportunity` de las respuestas REST.** Igual: la doc
devuelve `opportunity: object`. Se asumieron los campos que el payload de los
webhooks sí documenta. Puede traer más.

## 4. VTurb (unidad I-6)

✅ **VERIFICADO 2026-08-30** contra `docs/external-apis/vturb/openapi.json`.

### Lo confirmado

| Dato | Valor |
|---|---|
| Base URL | `https://analytics.vturb.net` |
| Auth | Header `X-Api-Token` |
| Identificador de video | `player_id` — `GET /players/list` devuelve `id`, `name`, `duration` y `pitch_time` |
| Cuota | `GET /quota/usage` da el uso vivo de la cuota de API |

**Endpoint principal:** `POST /sessions/stats` con `player_id`, `start_date`,
`end_date`, `video_duration` opcional, `timezone` y `pitch_time`.

### ⭐ La respuesta a la pregunta que decidía el diseño

**La retención viene de las dos formas, y además VTurb tiene un concepto nativo de
"llegó al pitch".** M12 no sólo es derivable: sale directo.

Mapeo a las medidas del documento:

| Medida | Campo de VTurb |
|---|---|
| M08 `landing_visitors` | `total_viewed` / `total_viewed_device_uniq` |
| M10 `vsl_plays` | `total_started` (y `play_rate` ya calculado) |
| M11 `vsl_avg_watch_pct` | `engagement_rate`, o `average_watched_time` de `/times/user_engagement` |
| **M12 `vsl_reached_cta`** | **`total_over_pitch` y `over_pitch_rate`** |
| Extra | `total_clicked` (clicks al CTA), `total_finished`, `total_conversions` |

Y `POST /times/user_engagement` devuelve `grouped_timed`: un array de
`{ timed: segundo, total_users }` — **la curva de retención por segundo**. Sirve si
alguna vez hace falta el CTA en un segundo distinto al `pitch_time` configurado.

**Consecuencia para I-6:** la unidad baja de tamaño otra vez. No hay que derivar
nada de una curva ni inventar un umbral: el `pitch_time` lo configura el cliente en
VTurb y la API devuelve el conteo hecho.

**Endpoints extra que pueden servir después:** `/traffic_origin/stats` (métricas por
UTM), `/comparison_groups/stats` (tests A/B de VSL), `/conversions/stats_by_day`.

### 🔴 Lo que quedó SIN documentación al construir I-6 (2026-08-30)

**a) Ningún campo de `Stats` tiene descripción en el spec.** `total_viewed`,
`total_started`, `total_over_pitch` y los sufijos `_device_uniq` / `_session_uniq`
aparecen listados con su tipo y nada más. Lo que se asumió:

| Campo | Se leyó como | Confianza |
|---|---|---|
| `total_viewed` | M08 — visitantes de la página con el video | Media |
| `total_started` | M10 — le dieron play | Alta (el nombre es inequívoco) |
| `total_over_pitch` | M12 — llegaron al segundo del CTA | Alta, **pero sólo con `pitch_time > 0`** |
| `engagement_rate` de `/times/user_engagement` | M11 — % promedio visto | Alta (la fórmula sí está documentada) |

Se prefiere el `engagement_rate` del endpoint de retención sobre el de
`/sessions/stats` porque el primero declara su fórmula
(`average_watched_time / video_duration * 100`) y el segundo no.

**b) `X-Api-Version`: `v1` o `v3`.** La página de autenticación dice `v1`; el spec
declara `info.version: "v3"`. Se manda `v1`. Si la primera llamada real devuelve
401, es esto.

**c) La forma exacta de la respuesta de `/players/list` y `/quota/usage`.** El spec
declara arrays pelados; el cliente acepta también un envelope (`{ players: [] }`,
`{ usage: [] }`) por tolerancia, sin costo.

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

### 🔴 Lo que quedó SIN documentación al construir I-5 (2026-08-30)

Tres formatos que la doc declara con su tipo y sin su significado. El parseo está
aislado en `lib/webinarjam/normalize-registrant.ts` y **lo que no se puede leer
queda en `null`**, nunca en un valor por defecto.

| Campo | Declarado | Qué se asumió |
|---|---|---|
| `signup_date`, `date_live`, `date_replay` | `integer` | Epoch. Se decide segundos vs milisegundos **por magnitud**; un texto de fecha también se acepta |
| `attended_live`, `attended_replay` (respuesta) | `integer` | La doc publica la tabla 0-4 del **parámetro de filtro**, no la del campo de respuesta. Se asume `0` = no, positivo = sí |
| `revenue_live`, `revenue_replay` | `string` | Puede traer símbolo de moneda. **No se usan todavía** — el dinero del embudo sale de Whop/Fanbasis (I-2), no de acá |
| `time_live`, `time_replay` | `string` | Unidad sin declarar. **Se evitó depender de ellos**: M15 se pide filtrada al servidor con `attended_live=4` |

**Y una forma de respuesta sin ejemplo en texto.** El ejemplo de `/registrants` en
la doc es **una captura de pantalla**, así que no se sabe bajo qué clave viene el
array. El cliente acepta `registrants`, `users` y `data`.

⛔ **M16 no tiene camino.** `webinar_cta_clicks` no está expuesto por ninguna vía.
No es una asunción pendiente de verificar: es una medida que la API no da.

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

### 🔴 Lo que quedó SIN documentación al construir I-8 (2026-08-30)

Poco, porque el spec de Hyros es el mejor de los seis. Lo que queda:

**a) Qué plan incluye la API.** La documentación no lo dice. Un `401`/`403` al
conectar puede ser una key mal escrita **o** un plan que no la habilita, y no hay
forma de distinguirlo desde la respuesta.

**b) La forma exacta de las filas del reporte de atribución.** El spec declara
`result: object[]` con "claves libres": las claves dependen de `fields`. Se
asumió que cada campo pedido vuelve con su mismo nombre (`revenue`, `cost`,
`leads`, `new_visits`), que es lo que muestra el ejemplo. Confianza alta, pero es
una asunción.

**c) Si los importes pueden venir como texto.** Se declara `number` en el
ejemplo, pero el parámetro `currency` acepta `user_currency`, así que el
normalizador tolera texto con símbolo. **Con una guarda:** un texto sin dígitos
(`"n/a"`) devuelve `null` y no `0` — sin ella, `Number("")` daría un cero real.

> ⚠️ **La trampa operativa que sí está documentada y hay que respetar:** casi
> todos los endpoints de Hyros **ignoran en silencio los parámetros desconocidos**
> y devuelven `200` con datos distintos a los pedidos. Un `fromDate` mal escrito
> no da error: devuelve la lista completa de leads, que se leería como un pico de
> opt-ins que nunca ocurrió. Por eso el cliente construye los nombres de parámetro
> en un solo lugar y no los arma dinámicamente en ningún lado.

---

## 7. Fathom — sin señal declarativa por llamada (módulo de llamadas) · ⛔ CERRADA 2026-09-02

**Agregado el 2026-09-02** al rediseñar la clasificación de llamadas.
**Cerrada el mismo día** por verificación de Santiago.

La documentación de Fathom **está capturada entera** en
[`docs/external-apis/fathom/`](./external-apis/fathom/) — 39 archivos, con el
spec OpenAPI completo. No faltaba documentación de API. Lo que faltaba era
**documentación de producto**, que Fathom no publica en `developers.fathom.ai`.

### ⛔ La pregunta que decidía el diseño, y su respuesta

**¿Cómo se le asigna un `meeting_type` a una reunión?**

La API sólo explica cómo **leerlos** (`GET /meeting_types`, filtro `meeting_type`
en `GET /meetings`, y el campo `meeting_type` en cada reunión con el nombre
asignado o `null`). **No dice cómo se asignan**, ni si se pueden asignar por
regla, ni qué pasa con una reunión sin evento de calendario.

> **Respuesta (Santiago, 2026-09-02): Fathom no da ninguna posibilidad de
> etiquetar las llamadas.**

**Consecuencia:** `meeting_type` queda **descartado** como señal.
`fathom_meeting_type_map` **no se repone** —la que se dropeó el 2026-09-01 se
queda dropeada— y no hay que volver sobre esto.

**Por qué no rompió nada:** el diseño del módulo asumía el **peor caso** a
propósito, justamente para no depender de una señal que Fathom no garantiza. La
clasificación sale de identificar a la contraparte contra las listas de clientes
y leads **que OTC ya tiene**, y las identidades se siembran desde `clients`
(incluido `nickname`), `sales_leads`, `closing_calls`, los contactos de GHL y los
mails de comprador de los pagos.

**La regla general que deja este caso:** de Fathom se toman **hechos crudos**
—quién grabó, quiénes hablaron, si hubo evento de calendario, qué se dijo—. La
**interpretación** la pone OTC con lo que sabe de su propio negocio. Un proveedor
que no declara nada no es un bloqueo cuando el dato para interpretar ya está en
casa.

### 🔴 El hallazgo operativo que SÍ sigue abierto

Del [FAQ oficial](./external-apis/fathom/faq.md), textual:

> *"API keys are per user, not per org, and there are no org-level keys."*

Una key sólo ve **lo que esa persona grabó o lo que le compartieron**. Consecuencia
para OTC: **si el closer graba en su cuenta y no comparte, esas llamadas no existen
para el sistema** — no se clasifican mal, directamente no llegan.

Dos salidas, las dos de configuración:

1. Darle a un **admin de Fathom** acceso a todas las llamadas compartidas y usar su key.
2. Que **cada miembro conecte su propia key** — **ya está construido** en `app/fathom/member-actions.ts`.

**Verificar antes de construir nada:** ¿la key configurada hoy ve las llamadas del closer?

### Lo que ya está confirmado y no hace falta verificar

| Campo | Confirmado en el spec |
|---|---|
| `recorded_by` (nombre, mail, dominio, equipo) | **Obligatorio.** Viene en todas las reuniones |
| `calendar_invitees[]` | Obligatorio, **pero el array puede venir vacío** sin evento de calendario |
| `meeting_url` | **`null` cuando no hay reunión de calendario asociada** — bandera directa |
| `transcript[].speaker.display_name` | Obligatorio dentro de cada ítem del transcript |
| `speaker.matched_calendar_invitee_email` | Sólo con `include_transcript`, y sólo desde feb-2025 |
| ⭐ `calendar_invitees[].matched_speaker_display_name` | **El vínculo nombre de pantalla ↔ mail.** Sólo con `include_transcript` y sólo para reuniones posteriores a feb-2025 |
| ⭐ `action_items[]` | `description`, `user_generated` (persona vs. IA), `completed`, `assignee` y **`recording_playback_url` con el segundo exacto**. Requiere `include_action_items` |
| ⭐ `highlights[].type` | **La etiqueta del bookmark** con que se marcó ese momento. Requiere `include_highlights` |
| `default_summary` | **Un objeto** `{template_name, markdown_formatted}`, no un string. Requiere `include_summary` |
| `calendar_invitees_domains_type` | ⚠️ **Trampa:** obligatorio y siempre con valor, pero se calcula sobre los invitados del calendario. Sin calendario dice `only_internal` aunque haya externos |
| `crm_matches` | Requiere un CRM conectado **a Fathom**. OTC no lo es → inservible |
| Paginación | 10 por página, sin parámetro para subirlo. Sólo `next_cursor` |

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
