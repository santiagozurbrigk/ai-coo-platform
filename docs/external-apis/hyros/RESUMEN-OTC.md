# Hyros para OTC — lo que hace falta para la unidad I-8

Responde, una por una, las preguntas que
[`docs/API_DOCS_PENDIENTES.md` §6](../../API_DOCS_PENDIENTES.md) dejó abiertas.

**Capturado el 2026-08-30.** La referencia sale del spec OpenAPI 3.1 **v1.40** que
Hyros publica en `api-docs.hyros.com/ai-context/`, no del documento viejo de Apiary
(v1.37), que igual se conserva por su prosa.

---

## Lo esencial

| | |
|---|---|
| Base URL | `https://api.hyros.com` — los endpoints cuelgan de `/api/v1.0/` |
| Auth | header **`API-Key: <key>`** |
| Versión del spec | `1.40` |
| Rate limits | **30 req/segundo** y **1000 req/minuto**, con headers `X-RateLimit-Limit` (`30;w=1, 1000;w=60`), `X-RateLimit-Remaining`, `X-RateLimit-Reset` y `Retry-After` |
| Agencias | header opcional `Accessible-Account-Id` para operar sobre una cuenta cliente conectada. Sin él, se opera sobre la cuenta del caller. El rate limit siempre se cuenta contra el caller |
| Paginación | `pageSize` (1-250) + `pageId`, tomado del `nextPageId` de la respuesta anterior. Un cursor inválido o vencido devuelve `400` |

> ⚠️ **Las escrituras son asíncronas.** Un `200` en un `POST`/`PUT`/`DELETE` significa
> *recibido y validado*, no *aplicado*. Las creaciones se ven en ~10 segundos; las
> actualizaciones y borrados tardan ~5 minutos, y más con carga. Los `GET` sí son
> síncronos. Si OTC escribe y relee para confirmar, va a leer datos viejos.

> ⚠️ **La validación de parámetros no es pareja.** Sólo un puñado de endpoints
> (`/products`, `/carts`, `/custom-costs`, `/sources/{tag}`, `/tags/count`,
> `/attribution/roas`, `/requests/{id}`) rechaza parámetros desconocidos con `400`.
> **En todos los demás un parámetro mal escrito se ignora en silencio y la request
> devuelve `200` con datos distintos a los que se pidieron.** La doc da el ejemplo:
> `GET /api/v1.0/leads?email=...` no filtra nada — el parámetro es `emails` — y
> devuelve la lista completa de leads. OTC tiene que validar su propio input.

---

## 1. Leads con filtro por fecha, y qué trae el journey

### `GET /api/v1.0/leads` — [ver](./ENDPOINTS-rest-api.md#get-api-v1-0-leads)

Filtros: `ids`, `emails`, `phones`, `tags`, `stage`, `fromDate`/`toDate` (fecha de
alta), y **`updatedFromDate`/`updatedToDate`** — este último es el que sirve para un
sync incremental: *"úsalo para traer sólo los leads que cambiaron desde tu última
consulta"*.

Devuelve por lead: `id`, `email`, `creationDate`, `lastUpdatedDate`, `tags[]`, `ips[]`,
`phoneNumbers[]`, `firstName`, `lastName`, y su stage.

> ⚠️ **Trampa de formato de fecha.** `creationDate` viene en ISO 8601 en `/leads`,
> pero cuando el lead viene **embebido** dentro de `/sales`, `/calls` o
> `/subscriptions` viene en el formato legacy `EEE MMM dd HH:mm:ss zzz yyyy`. Hay que
> parsear los dos.

### `GET /api/v1.0/leads/journey` — [ver](./ENDPOINTS-rest-api.md#get-api-v1-0-leads-journey)

Toma `ids` y/o `emails` (máximo 50 por llamada). Cada journey trae las **ventas,
llamadas, carritos, suscripciones y leads vinculados**. Con `includeEvents=true`
agrega un array `journey` **cronológico** de eventos: ventas, llamadas, emails,
clicks, page views.

Eso es **M07** (`journey_touchpoints`) directo. El límite de 50 por request es la
restricción práctica: para poblar journeys de muchos leads hay que lotear.

---

## 2. Revenue atribuido por fuente (M05) — el corazón de I-8

### `GET /api/v1.0/attribution` — [ver](./ENDPOINTS-rest-api.md#get-api-v1-0-attribution)

Requeridos: `attributionModel`, `startDate`, `endDate`, `level`, `fields`, `ids`.

- **`attributionModel`**: `last_click`, `first_click` o `scientific`. Con `scientific`,
  `scientificDaysRange` (1-30) define la ventana de primera atribución.
- **`level`**: el grano del reporte — `facebook_campaign`, `facebook_adset`,
  `facebook_ad`, `google_campaign`, `google_v2_adgroup`, `google_ad`,
  `google_v2_keyword`, `tiktok_adgroup`, `tiktok_ad`, `snapchat_adsquad`,
  `pinterest_adgroup`, `bing_adgroup`, `linkedin_campaign`, y varios más.
- **`fields`**: lista separada por comas de **más de 70 métricas**. Las que importan:
  `revenue`, `total_revenue`, `recurring_revenue`, `sales`, `unique_sales`, `leads`,
  `new_leads`, `calls`, `qualified_calls`, `unqualified_calls`, `cost`, `profit`,
  `roi`, `roas`, `cac`, `aov`, `refund`, `refund_count`, `clicks`, `new_visits`,
  `impressions`, `ctr`, `cpm`, `cvr`, `cost_per_lead`, `cost_per_sale`,
  `cost_per_call`, y una familia de LTV (`30_days_ltv` … `1_year_ltv`, con sus
  forecasts).
- Otros: `timeGroupingOption` (`source_link` por defecto, o `day`/`week`/`month`/`year`),
  `currency` (`usd` o `user_currency`), `dayOfAttribution` (filtra por fecha de click
  en vez de fecha de venta), `sourceConfiguration` (`only_paid`, `only_organic`,
  `prioritize_paid`…), `lead_stage`.

Variantes: `/attribution/ad-account` (agregado por cuenta publicitaria),
`/attribution/roas`, `/attribution/marginal-cac-curve`.

**M05** (`attributed_revenue_by_source`) = este endpoint con `fields=revenue` (o
`total_revenue`) al `level` que corresponda.
**M06** (`attributed_leads_by_source`) = el mismo con `fields=leads,new_leads`.
**M01** (ad spend) = `fields=cost`, que además hace innecesario cruzar con la API de
cada plataforma.

> Dos restricciones que la doc marca y que rompen la request si se ignoran:
> con `isAdAccountId=true` no se puede usar `timeGroupingOption` de `day`/`week`/
> `month`/`year`; y `status` (`active`/`paused`) sólo funciona con
> `timeGroupingOption=source_link`.

---

## 3. Qué identifica una "fuente"

`GET /api/v1.0/sources` devuelve, por fuente: `name`, `tag`, `organic`,
`disregarded`, y tres objetos anidados:

| Campo | Qué es |
|---|---|
| `adSource` | `adSourceId`, `adAccountId` y `platform` — `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS` |
| `trafficSource` | `id` + `name` |
| `goal` | `id` + `name` — el objetivo declarado de la fuente (p. ej. "opt ins") |
| `category` | categoría de la fuente |

Es decir: una fuente **no** es sólo una campaña. Es una entidad de Hyros que puede ser
un anuncio pagado (con su plataforma y ad account), tráfico orgánico, o una fuente
manual. El `tag` es su identificador estable — y es lo que hay que guardar del lado de
OTC para el etiquetado `[Hyros]`.

Complementos: `GET /api/v1.0/ads` (anuncios), `GET /api/v1.0/ad-accounts`,
`GET /api/v1.0/keywords`, `POST /api/v1.0/sources` (crear una fuente manual),
`GET|POST /api/v1.0/custom-costs` (costos que no vienen de una plataforma).

---

## 4. Opt-ins de landing (M08 y M09) — **sí, por dos vías**

Esta era la pregunta que decide si `I-7` puede desaparecer, como se decidió en el mapa
de fuentes. La respuesta es que sí, con matices:

**M09 `optins`** — dos caminos:
1. `GET /api/v1.0/leads` con `fromDate`/`toDate`: un lead nuevo en el período **es** un
   opt-in. Es la vía de backfill.
2. El webhook **`lead.opted.in`**, que Hyros dispara en el momento
   ([ver](./ENDPOINTS-webhooks.md)). Es la vía de tiempo real.

También está `fields=leads,new_leads` en el reporte de atribución, que da el conteo ya
cortado por fuente.

**M08 `landing_visitors`** — no hay un endpoint de "visitantes de página", pero el
reporte de atribución expone **`clicks`**, **`new_visits`** y `cost_per_new_visit`,
y hay `GET /api/v1.0/leads/clicks` para los clicks de un lead. `new_visits` es lo más
cercano a "visitantes"; `clicks` no lo es (un mismo visitante puede clickear varias
veces). Conviene usar `new_visits` y decir en la UI qué es.

> Esto confirma la decisión del mapa de fuentes: **`I-7` (analytics de landing) no hace
> falta como integración aparte** — M08 y M09 salen de I-8.

---

## 5. Webhooks — 10 eventos, con firma verificable

Referencia completa en [`ENDPOINTS-webhooks.md`](./ENDPOINTS-webhooks.md).

| Evento | Cuándo |
|---|---|
| `sale.attributed` | una venta se atribuye a un lead |
| `sale.refunded` | una venta se reembolsa |
| `lead.opted.in` | un lead hace opt-in |
| `lead.origin.assigned` | un lead se asigna como origen de otro |
| `lead.stage.changed` | cambia el stage de un lead |
| `lead.tag.added` / `lead.tag.removed` | se agregan o quitan tags |
| `call.attributed` | una llamada se atribuye a un lead |
| `subscription.created` | se indexa una suscripción por primera vez |
| `subscription.status.changed` | cambia el estado de una suscripción |

**Firma:** header `X-Hyros-Signature`, con formato
`t=<epoch en segundos>,v1=<firma>`, donde la firma es el HMAC-SHA256 en hex minúscula
de `<t>.<body crudo>` con el `secretKey` de la suscripción. Verificar `t` contra el
reloj actual protege de replay.

> El header viejo `X-Hyros-Hmac-Sha1` **sigue viniendo en cada request** pero está
> deprecado (HMAC-SHA1 sobre el JSON crudo del campo `body`, no sobre el request
> entero). Usar `X-Hyros-Signature`.

Cada evento trae `subscriptionId`, `eventId` (**para deduplicar**), `type`, `timestamp`
y `body`. Gestión por API:
`GET|POST /api/v1.0/webhook-subscriptions`, `DELETE .../{externalId}`.

Si las entregas empiezan a fallar Hyros avisa por email, y **si el problema no se
resuelve deshabilita la suscripción** — hay que reactivarla a mano.

---

## 6. Y además: hay un servidor MCP

Hyros expone un servidor MCP en `https://mcp.hyros.com/mcp`
([`ENDPOINTS-mcp.md`](./ENDPOINTS-mcp.md)). No reemplaza la API REST para la ingesta de
OTC —la doc dice que la referencia de campos y de modelo de atribución sigue siendo la
REST— pero es una vía razonable para que el **agente de negocio** consulte la cuenta
del cliente sin que OTC tenga que replicar cada reporte.

---

## Qué queda por verificar contra una cuenta real

Va al [`PLAN_VERIFICACION.md`](../../PLAN_VERIFICACION.md):

1. **Que la firma `X-Hyros-Signature` valide** con `t.<body>` y HMAC-SHA256 hex.
2. **Los dos formatos de fecha** de `creationDate` (ISO vs legacy), que la doc declara
   pero conviene ver en un payload real antes de fijar el parser.
3. **Qué combinación de `attributionModel` + `level` + `fields`** reproduce lo que el
   cliente ve en su dashboard de Hyros. Es la verificación que decide si M05 es
   confiable: el mismo período tiene que dar el mismo número.
4. **Cuánto tarda de verdad la escritura asíncrona**, si OTC llega a escribir algo.
5. **Si el plan del cliente incluye la API** — la doc no dice qué tier la habilita.
