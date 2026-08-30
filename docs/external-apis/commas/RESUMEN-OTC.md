# Commas (ex Fanbasis) para OTC — verificación del mapeo de la unidad I-2

Responde, una por una, las preguntas que
[`docs/API_DOCS_PENDIENTES.md` §2](../../API_DOCS_PENDIENTES.md) dejó abiertas sobre
Fanbasis, y marca qué hay que **corregir en el código ya escrito**.

**Capturado el 2026-08-30** de `commasdocs.com`.

> **Fanbasis se llama Commas.** El dominio de documentación viejo (`apidocs.fan`) no es
> la fuente vigente. Pero el **API sigue sirviéndose desde `fanbasis.com`**: el
> rebranding cambió la marca y la documentación, no los hosts.

---

## Lo esencial

| | |
|---|---|
| Base URL producción | `https://www.fanbasis.com` — **con `www`** |
| Base URL sandbox | `https://qa.dev-fan-basis.com` |
| Prefijo | `/public-api/` para casi todo. **Excepción:** la API de prorrateo de suscripciones vive en `/api/seller/v1/` |
| Auth | header **`x-api-key: <API_KEY>`**. No hay OAuth ni usuario/contraseña |
| Idempotencia | header `Idempotency-Key` (visto en el endpoint de refund) |
| Rate limits | headers `X-RateLimit-Limit` / `-Remaining` / `-Reset` en los grupos **checkout-sessions** y **customers**. Los umbrales concretos varían por cuenta — hay que pedirlos a soporte. El `429` trae `Retry-After` |

> ⚠️ **Nunca pegarle al dominio apex.** `https://fanbasis.com` responde un `301` que
> **descarta el body de los `POST`**. Siempre `www`.

> ⚠️ **El `429` usa otro envelope.** Devuelve `{"success": false, …}` en vez del
> `{"status": "error", …}` del resto. No armar el manejo de errores sólo sobre `status`.

---

## 1. Firma de webhooks — **resuelta, y la asunción de OTC acierta**

Era la pregunta más importante: sin esto la ruta rechaza todo.

| | |
|---|---|
| Cabecera | **`x-webhook-signature`** |
| Algoritmo | **HMAC-SHA256** sobre el **body crudo** |
| Codificación | **hex** (no base64) |
| Clave | el webhook secret, **tal cual**, sin prefijo ni decodificación |
| Comparación | tiempo constante; rechazar con `401` |

```js
const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
```

No hay timestamp en la firma, así que **no hay protección de replay del lado del
proveedor** — la deduplicación por id de evento del lado de OTC es la única defensa.

> ✅ `verify-signature.ts` ya probaba `x-webhook-signature` entre los nombres
> candidatos, así que la cabecera es la correcta. Lo que hay que confirmar es el resto:
> **hex, sobre el body crudo, con el secreto sin transformar**, y que **no** se aplique
> el esquema `{id}.{timestamp}.{body}` de Whop, que acá no corresponde.

---

## 2. Eventos de webhook

| Grupo | Eventos |
|---|---|
| **Pagos** | `payment.succeeded`, `payment.failed`, `payment.canceled`, `payment.expired` |
| **Reembolsos** | `refund.created` |
| **Productos** | `product.purchased` |
| **Suscripciones** | `subscription.created`, `subscription.renewed`, `subscription.canceled`, `subscription.completed`, `subscription.past_due`, `subscription.recovered` |
| **Disputas** | `dispute.created`, `dispute.updated` |

El detalle de cada payload está en
[`webhook-events-reference.md`](./webhook-events-reference.md); la mecánica de entrega,
firma y reintentos en [`webhooks.md`](./webhooks.md).

Los eventos de suscripción traen campos de cobranza que son directamente útiles para
las métricas de recupero: `attempt_number`, `max_attempts`, `total_retry_attempts`,
`next_retry_date`, `days_in_past_due`, `first_failed_at`, `failure_reason`,
`recovered_amount`, `recovered_at`, `recovery_source`, `cancellation_reason`,
`completion_reason`, `is_free_trial`, `auto_renew_count`.

Gestión de suscripciones al webhook por API:
`GET`/`POST /public-api/webhook-subscriptions`,
`POST /public-api/webhook-subscriptions/:id/test`,
`DELETE /public-api/webhook-subscriptions/:id`.

---

## 3. Montos — **centavos, al revés que Whop**

> ⚠️ **Commas manda enteros en centavos, en el campo `amount_cents`.** La doc:
> *"Price in cents (e.g., `2999` = $29.99). **Minimum 100** ($1.00)"*. El refund
> también toma `amount_cents`.

Esto es lo **opuesto** a Whop, que manda decimales en la unidad de la moneda. Los dos
proveedores de la unidad I-2 usan convenciones distintas, así que la regla no puede
ser una heurística global.

> ✅ `normalize.ts` divide por 100 las claves que terminan en `_cents`, y `amount_cents`
> está en `KEYS.amount`. Para Commas **funciona**. Lo que conviene es dejar la regla
> explícita por proveedor en vez de depender del sufijo, para que un campo nuevo sin
> sufijo no se cuele como si fuera unidad.

---

## 4. Endpoints REST para backfill

Sí hay, así que se puede traer la historia previa a la conexión:

| Endpoint | Para qué |
|---|---|
| `GET /public-api/transactions/:transactionId` | Detalle de un pago: cliente, producto, **fee de Commas y neto a cobrar** |
| `GET /public-api/checkout-sessions/transactions` | Todas las transacciones |
| `GET /public-api/checkout-sessions/:id/transactions` | Transacciones de una sesión |
| `GET /public-api/products/:productId/transactions` | Transacciones de un producto |
| `GET /public-api/subscribers` | Directorio de suscriptores (filtros `product_id`, `customer_id`, `page`, `per_page` ≤ 100) |
| `GET /public-api/checkout-sessions/:id/subscriptions` | Suscripciones de una sesión |
| `GET /public-api/products/:productId/subscriptions` | Suscripciones de un producto |
| `GET /public-api/customers` | Clientes |
| `GET /public-api/products` | Productos |

Refund: `POST /public-api/checkout-sessions/transactions/{transactionId}/refund` con
`{ "amount_cents": …, "reason": … }`. Acepta el hashid **o** el order ID público
(`ORD-XXXX-XXXX-XXXX`, que es el que viene en los webhooks).

> ⚠️ **Trampa de ids.** Commas mezcla dos tipos: hashids cortos (productos, sesiones,
> transacciones — `NLxj6`, `pX9vQ`) e **enteros planos** (customer, subscription). En
> `GET /public-api/subscribers`, el filtro `customer_id` pide el **entero crudo**, y
> *"el hashid que este endpoint devuelve en `customer.id` no matchea"*. Guardar los dos.

---

## 5. Valor contratado (M29) — **derivable, pero sólo a veces**

Era la cuarta pregunta: hace falta el valor contratado total, no cada cuota.

Commas modela la suscripción con tres campos:

| Campo | Qué es |
|---|---|
| `amount_cents` | el importe de **cada** cobro |
| `subscription.frequency_days` | cada cuántos días se cobra (30 = mensual, 365 = anual) |
| `subscription.auto_expire_after_x_periods` | **cancela automáticamente después de N ciclos**. `null` u omitido = indefinida |

Entonces:

- Si `auto_expire_after_x_periods` está seteado →
  **`contracted_value = amount_cents × auto_expire_after_x_periods`**. Es un plan de
  cuotas con final conocido, y M29 sale exacto.
- Si es `null` → la suscripción es indefinida y **no existe un valor contratado**.
  No hay que estimarlo: queda `unmapped`, no cero.

También hay `subscription.free_trial_days`, que hay que descontar del primer período.

Los tipos de sesión, que definen cómo se cobra:

| `type` | Qué es |
|---|---|
| `subscription` | recurrente cada `frequency_days` |
| `onetime_reusable` | pago único, link compartible con muchos compradores |
| `onetime_non_reusable` | pago único, el link se consume con el primer pago |

---

## Qué queda por verificar contra una cuenta real

Va al [`PLAN_VERIFICACION.md`](../../PLAN_VERIFICACION.md):

1. **Que la firma valide** con HMAC-SHA256 hex sobre el body crudo y el secreto sin
   transformar — es lo único que bloquea toda la ruta.
2. **Los nombres de campo del payload de cada evento.** La doc describe los eventos y
   sus campos de suscripción, pero el payload completo de `payment.succeeded` conviene
   verlo crudo antes de fijar el mapeo.
3. **Si el fee de Commas y el neto vienen en el webhook** o sólo en
   `GET /public-api/transactions/:id`. Cambia si M28 (`cash_collected`) se puede
   calcular en el momento del evento o hace falta una llamada extra.
4. **Los umbrales de rate limit de la cuenta**, que la doc no publica.
