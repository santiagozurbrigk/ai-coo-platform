# GoHighLevel para OTC — lo que hace falta para la unidad I-4

Este documento responde, una por una, las preguntas que
[`docs/API_DOCS_PENDIENTES.md` §3](../../API_DOCS_PENDIENTES.md) dejó abiertas sobre
oportunidades y pipelines. Todo lo que dice sale de la copia local que está en esta
misma carpeta; cada afirmación linkea a la página de la que sale.

**Capturado el 2026-08-30 de la versión *current* (v3) de la documentación.**

---

## Lo esencial

| | |
|---|---|
| Base URL | `https://services.leadconnectorhq.com` |
| Auth | `Authorization: Bearer <token>` — Access Token OAuth de **Sub-Account**, o Private Integration Token de Sub-Account ([ref](./ghl/opportunities/opportunities-api-v-3.md)) |
| Header de versión | `Version: v3` — **obligatorio en todas las llamadas** |
| Scopes | `opportunities.readonly` para leer, `opportunities.write` para escribir ([tabla completa](./Authorization/Scopes.md)) |
| Rate limit | 100 req / 10 s (burst) y 200.000 req / día, **por app y por sub-account** ([ref](./other/rate-limits.md)) |

La integración GHL que ya existe en OTC (`apps/web/lib/ghl/client.ts`) resuelve la
autenticación con Private Integration Token, así que I-4 es agregar endpoints, no
resolver auth.

---

## 1. Pipelines y etapas

**[`GET /opportunities/pipelines?locationId=<id>`](./ghl/opportunities/get-pipelines.md)**

Devuelve `{ pipelines: object[] }` — la lista de pipelines de la sub-account, con
sus etapas.

> ⚠️ **La doc oficial no expande el objeto `pipeline`.** Dice literalmente
> `pipelines: object[] — List of pipelines for the location`, sin detallar campos.
> Lo mismo pasa en [`GET /opportunities/pipelines/:pipelineId`](./ghl/opportunities/get-pipeline.md).
> Los nombres de campo de una etapa hay que leerlos del primer response real —
> aplicar la regla 3 de `CLAUDE.md`: persistir el payload crudo antes de mapearlo.

Complementarios: [crear](./ghl/opportunities/create-pipeline.md),
[actualizar](./ghl/opportunities/update-pipeline.md),
[borrar](./ghl/opportunities/delete-pipeline.md) — OTC no los necesita, sólo lee.

---

## 2. Listar oportunidades con filtro por fecha y por etapa

Hay **dos** endpoints de búsqueda y conviene usar el segundo:

### `GET /opportunities/search` — [ver](./ghl/opportunities/search-opportunity.md)

Filtros por query string: `locationId` (requerido), `pipelineId`, `pipelineStageId`,
`status` (`open`/`won`/`lost`/`abandoned`/`all`), `assignedTo`, `contactId`,
`campaignId`, `country`, `q` (texto libre, máx. 75 caracteres),
`date` / `endDate` (rango), `order` (`added_asc`, `added_desc`, `name_asc`, `name_desc`),
`page`, `limit` (máx **100**, default 20) y el cursor `startAfter` (epoch ms) +
`startAfterId`.

Respuesta: `{ opportunities: object[], meta: object, aggregations: object }`.

### `POST /opportunities/search` — [ver](./ghl/opportunities/search-opportunities-advanced.md)

La versión avanzada. Además de filtros combinados acepta `searchAfter` (paginación
profunda) y devuelve un campo que es directamente útil para el embudo DM:

```
{
  "opportunities": [...],
  "total": 100,
  "stageAggregations": [...],   // totales por etapa cuando hay filtro de pipeline
  "aggregations": {...}
}
```

`stageAggregations` da **cuántas oportunidades hay hoy en cada etapa** sin tener que
traer todas las filas — pero ojo con lo que sigue.

---

## 3. Campos de una oportunidad

La doc **no expande** el objeto `opportunity` en ninguna respuesta
([get](./ghl/opportunities/get-opportunity.md) devuelve `opportunity: object` a
secas). Los nombres de campo se conocen por dos vías que sí están completas:

**Del request body de [crear](./ghl/opportunities/create-opportunity.md) /
[actualizar](./ghl/opportunities/update-opportunity.md) / [upsert](./ghl/opportunities/upsert-opportunity.md):**

| Campo | Tipo | Notas |
|---|---|---|
| `pipelineId` | string | requerido |
| `locationId` | string | requerido |
| `name` | string | requerido |
| `pipelineStageId` | string | |
| `status` | string | `open` · `won` · `lost` · `abandoned` · `all` |
| `contactId` | string | requerido al crear |
| `monetaryValue` | number | |
| `forecastExpectedCloseDate` | string | acepta `YYYY-MM-DD`, `MM/DD/YYYY`, ISO 8601, y varios más |
| `forecastProbability` | number | |
| `assignedTo` | string | user id |
| `customFields` | object[] | `{ id, fieldValue }` |

**Del payload de los webhooks** ([OpportunityCreate](./webhook/OpportunityCreate.md),
[OpportunityUpdate](./webhook/OpportunityUpdate.md)), que sí trae el objeto plano:

```
type, locationId, id, assignedTo, contactId, monetaryValue,
name, pipelineId, pipelineStageId, source, status, dateAdded
```

Notar que `dateAdded` está pero **no hay `updatedAt` ni fecha de cambio de etapa**.

---

## 4. Historial de cambios de etapa — **no existe**

Esta era la pregunta clave del plan, y la respuesta es que **la API v3 no expone
historial de etapas**. Se verificó de tres formas:

- No hay ningún endpoint de historial, auditoría o timeline bajo `/opportunities`
  ([los 16 endpoints del recurso](./INDEX.md#opportunities-16-endpoints)).
- Ni `GET /opportunities/search` ni `POST /opportunities/search` aceptan un filtro
  del tipo "cambió de etapa entre X e Y", ni devuelven un campo de última transición.
- El payload de [`OpportunityStageUpdate`](./webhook/OpportunityStageUpdate.md) trae
  la etapa **nueva** (`pipelineStageId`) pero **no la anterior ni el timestamp del
  cambio**.

### Qué significa para el diseño de I-4

`stageAggregations` y el filtro `pipelineStageId` responden *"cuántas oportunidades
están hoy en cada etapa"*. El documento fuente pide otra cosa: *"cuántas pasaron por
cada etapa durante el período"* (M21, M22, M23, M25). **Eso no se puede reconstruir
leyendo la API**, ni siquiera con backfill: la información no existe del lado de GHL.

La única forma de tenerlo es que **OTC construya su propio historial** a partir de
los webhooks, desde el momento en que se suscribe:

| Webhook | Para qué |
|---|---|
| [`OpportunityCreate`](./webhook/OpportunityCreate.md) | Alta — M21 (conversación abierta) |
| [`OpportunityStageUpdate`](./webhook/OpportunityStageUpdate.md) | Transición de etapa — M22, M23, M25 |
| [`OpportunityStatusUpdate`](./webhook/OpportunityStatusUpdate.md) | `open`→`won`/`lost`/`abandoned` |
| [`OpportunityMonetaryValueUpdate`](./webhook/OpportunityMonetaryValueUpdate.md) | Cambios de valor |
| [`OpportunityAssignedToUpdate`](./webhook/OpportunityAssignedToUpdate.md) | Reasignaciones |
| [`OpportunityDelete`](./webhook/OpportunityDelete.md) | Bajas |

Como el webhook no trae la etapa anterior, la transición hay que derivarla contra la
última etapa conocida en la tabla propia. Y hay que asumir **un período ciego**: los
conteos por etapa sólo son válidos desde la fecha de suscripción en adelante, no
hacia atrás. Eso hay que mostrarlo en la UI, no dejarlo implícito — un cero que en
realidad es "no lo sabemos" es exactamente el error que la regla 3 de `CLAUDE.md`
busca evitar.

Guías de webhooks: [integración](./webhook/WebhookIntegrationGuide.md) ·
[dashboard de logs y reintentos](./webhook/WebhookLogsDashboard.md).

---

## 5. Paginación y rate limits

**Paginación.** Dos mecanismos según el endpoint:
- `page` + `limit` (máx. 100) para recorridos cortos.
- Cursor: `startAfter` (epoch ms) + `startAfterId` en el GET, `searchAfter` en el
  POST. Es el que hay que usar para sincronizar volúmenes grandes — el paginado por
  número se degrada y se saltea filas si el dataset cambia mientras se recorre.

**Rate limits** ([ref completa](./other/rate-limits.md)):

| Límite | Cuota | Ventana |
|---|---|---|
| Burst | 100 requests | por 10 segundos |
| Diario | 200.000 requests | por día |

Se cuentan **por app y por recurso** (una sub-account o una agencia), así que sumar
sub-accounts no divide la cuota: cada instalación tiene su propio presupuesto.

Cada respuesta trae headers con la posición actual — conviene leerlos en vez de
contar del lado de OTC:

| Header | Qué es |
|---|---|
| `X-RateLimit-Limit-Daily` | límite diario |
| `X-RateLimit-Daily-Remaining` | requests que quedan en el día |
| `X-RateLimit-Interval-Milliseconds` | ventana del burst |
| `X-RateLimit-Max` | máximo por ventana |
| `X-RateLimit-Remaining` | requests que quedan en la ventana actual |

---

## Qué queda por verificar contra una cuenta real

Estas tres cosas no se pueden cerrar leyendo documentación, porque la documentación
no las dice. Van al [`PLAN_VERIFICACION.md`](../../PLAN_VERIFICACION.md) cuando se
construya I-4:

1. **La forma real del objeto `pipeline`** y de sus etapas (`GET /opportunities/pipelines`).
2. **La forma real del objeto `opportunity`** que devuelve la búsqueda — si coincide
   con el payload del webhook o si trae más campos.
3. **Si `stageAggregations` cuenta oportunidades o suma valor monetario**, y qué
   devuelve exactamente cuando no hay filtro de pipeline.
