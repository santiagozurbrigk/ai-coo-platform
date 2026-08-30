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

> **2026-08-30 — el bloqueo no es total.** `vturb.gitbook.io` y
> `marketplace.gohighlevel.com` sí son alcanzables. Se bajó la documentación completa
> de las dos y quedó commiteada en **[`docs/external-apis/`](./external-apis/)**, con
> el proceso reproducible (`docs/external-apis/tools/regenerar.sh`). Eso cierra las
> secciones §3 (GHL) y §4 (VTurb) de este archivo. Los otros siete dominios siguen sin
> probarse desde entonces: **antes de construir contra cualquiera de ellos, probar la
> URL — puede que también esté disponible.**

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

| Proveedor | Unidad | Estado del código | Qué falta verificar |
|---|---|---|---|
| **Whop** | I-2 | Construido | Eventos, payloads, firma |
| **Fanbasis** | I-2 | Construido | Eventos, payloads, **esquema de firma** |
| **GHL opportunities** | I-4 | Sin empezar | ✅ **Documentación capturada** — ver [`external-apis/gohighlevel/RESUMEN-OTC.md`](./external-apis/gohighlevel/RESUMEN-OTC.md) |
| **VTurb** | I-6 | Sin empezar | ✅ **Documentación capturada** — ver [`external-apis/vturb/RESUMEN-OTC.md`](./external-apis/vturb/RESUMEN-OTC.md) |
| **WebinarJam / Zoom** | I-5 | Sin empezar | Todo |
| **Hyros** | I-8 | Sin empezar | Endpoints, atribución, rate limits |

---

## 1. Whop — unidad I-2

**Documentación:** https://docs.whop.com/ · https://api-docs.hyros.com/ (bloqueadas)  
**Archivos a corregir:** `apps/web/lib/payments/normalize.ts`, `apps/web/lib/payments/verify-signature.ts`, `apps/web/app/api/webhooks/whop/route.ts`

### Qué se asumió

| Asunción | Confianza | Cómo se verifica |
|---|---|---|
| Firma con [Standard Webhooks](https://www.standardwebhooks.com/): cabeceras `webhook-id`, `webhook-timestamp`, `webhook-signature`, HMAC-SHA256 base64 de `{id}.{timestamp}.{body}` | **Alta** — es una spec pública y la documentación de Whop declara usarla | Un webhook real que pase la verificación |
| El secreto puede venir con prefijo `whsec_` y base64 | Media | Idem |
| Los eventos de cobro matchean `/payment.*(succe\|complet\|paid)/i` | **Baja** | Ver `event_type` en `payment_webhook_events` |
| Los eventos de orden matchean `/membership.*(went_valid\|created\|activat)/i` | **Baja** | Idem |
| El payload viene anidado bajo `data` u `object` | Media | Ver el payload crudo |
| Nombres de campo: `amount`, `currency`, `user_id`, `email`, `membership_id`, `created_at` | **Baja** | Ver el payload crudo |
| Los montos podrían venir en centavos (claves `*_cents`) | Media | Comparar un cobro real contra el dashboard de Whop |

### Qué necesito de la documentación

1. Lista completa de tipos de evento de webhook.
2. Payload exacto de: cobro exitoso, reembolso, y creación/activación de membresía.
3. Confirmación del esquema de firma y del formato del secreto.
4. Si los montos vienen en centavos o en unidades, y en qué campo.
5. Endpoints REST para hacer *backfill* histórico (hoy sólo se reciben webhooks, así que no hay historia previa a la conexión).

---

## 2. Fanbasis — unidad I-2

**Documentación:** https://apidocs.fan/ (bloqueada)  
**Archivos a corregir:** los mismos que Whop.

### Qué se asumió

| Asunción | Confianza | Cómo se verifica |
|---|---|---|
| Firma HMAC-SHA256 sobre el cuerpo crudo, en hex o base64 | **Baja** | Un webhook real |
| La cabecera de firma es una de `x-fanbasis-signature`, `x-signature`, `x-webhook-signature`, `signature` | **Baja** | Ver las cabeceras de un webhook real |
| Mismos nombres de campo y tipos de evento que Whop | **Muy baja** | Ver el payload crudo |

### Qué necesito de la documentación

1. **El esquema de firma y el nombre exacto de la cabecera.** Es lo más importante: sin esto la ruta rechaza todo.
2. Lista de eventos de webhook y sus payloads.
3. Endpoints REST de transacciones y suscripciones, para backfill.
4. Cómo modela el plan de pagos: hace falta el **valor contratado total**, no sólo cada cuota.

---

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

## 5. WebinarJam / Zoom (unidad I-5)

**Documentación:** https://help.webinarjam.com/ · https://developers.zoom.us/docs/api/ (bloqueadas)

### Qué necesito

1. **Cuál de los dos usan los clientes** — puede que ni haga falta la otra.
2. Endpoints de registrantes y asistentes por webinar.
3. Si se distingue **asistencia en vivo de replay**: el documento dice explícitamente "Showed up (live + replay)".
4. Si hay dato de **hasta qué minuto se quedó cada asistente** — es lo único con lo que se puede calcular el stick rate (M15).
5. Si se registran los **clicks al CTA** durante el webinar (M16).
6. Autenticación y rate limits.

---

## 6. Hyros (unidad I-8)

**Documentación:** https://api-docs.hyros.com/ · https://docs.hyros.com/ · https://hyros.docs.apiary.io/ (bloqueadas)

**Lo que se sabe por búsqueda:** REST API con auth por API key. Endpoints de
leads (con journeys), sales, orders y subscriptions.

### Qué necesito

1. URL base y autenticación.
2. Endpoint de leads con filtro por fecha, y qué trae el **journey** de un lead.
3. Cómo se pide el **revenue atribuido por fuente** (M05) — que es el punto de toda la integración.
4. Qué identifica una "fuente": ¿campaña, anuncio, keyword?
5. Si los opt-ins de landing se pueden leer desde acá (M08 y M09 dependen de esto — ver §8 del mapa de fuentes).
6. Rate limits y si hay webhooks además de la API REST.

---

## Regla permanente para Claude Code

> **Antes que nada: probá la URL.** El bloqueo de red no es parejo — el 2026-08-30 se
> comprobó que `vturb.gitbook.io` y `marketplace.gohighlevel.com` sí responden. Si la
> documentación es alcanzable, **bajala a [`docs/external-apis/`](./external-apis/)**
> con `docs/external-apis/tools/regenerar.sh` como modelo, en vez de construir a
> ciegas. Una copia commiteada le sirve a todas las sesiones que vengan después.
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

*Creado 2026-08-29. Actualizado 2026-08-30: §3 (GHL) y §4 (VTurb) resueltas con la
documentación capturada en `docs/external-apis/`. Actualizar con cada integración
construida a ciegas; borrar la sección cuando la documentación se haya verificado y el
mapeo corregido.*
