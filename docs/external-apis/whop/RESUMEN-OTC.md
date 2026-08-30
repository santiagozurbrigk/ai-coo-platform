# Whop para OTC — verificación del mapeo de la unidad I-2

Responde, una por una, las preguntas que
[`docs/API_DOCS_PENDIENTES.md` §1](../../API_DOCS_PENDIENTES.md) dejó abiertas sobre
Whop, y marca qué hay que **corregir en el código ya escrito**.

**Capturado el 2026-08-30** de `docs.whop.com`.

---

## Lo esencial

| | |
|---|---|
| Base URL | `https://api.whop.com/api/v1` · sandbox `https://sandbox-api.whop.com/api/v1` |
| Auth | `Authorization: Bearer <API_KEY>` — key de cuenta, de app, o token OAuth de usuario |
| Versionado | header `Api-Version-Date` (p. ej. `2026-08-25`). Sin pin, la respuesta queda anclada a la versión inicial de la integración |
| Idempotencia | header `Idempotency-Key` en los `POST` |
| Dos superficies | la **versionada** (`/api-reference/beta`, [`ENDPOINTS-api-v1-native.md`](./ENDPOINTS-api-v1-native.md), 246 operaciones) y la **legacy** ([`ENDPOINTS-api-v1-stable.md`](./ENDPOINTS-api-v1-stable.md), 202). Para lo de pagos alcanza la legacy, que es la que tiene `Payment` y `Refund` completos |

---

## 1. Tipos de evento de webhook — lista completa

Están todos en [`developer/guides/webhooks.md`](./developer/guides/webhooks.md), con link
al schema de cada payload. Los que le importan a la capa de pagos de OTC:

| Grupo | Eventos |
|---|---|
| **Pagos** | `payment.succeeded`, `payment.failed`, `payment.created`, `payment.pending`, `payment.authorized`, `payment.canceled` |
| **Reembolsos** | `refund.created`, `refund.updated` |
| **Membresías** | `membership.activated`, `membership.deactivated`, `membership.cancel_at_period_end_changed`, `membership.trial_ending_soon` |
| **Facturas** | `invoice.created`, `invoice.paid`, `invoice.past_due`, `invoice.voided`, `invoice.marked_uncollectible` |
| **Disputas** | `dispute.created`, `dispute.updated`, `dispute_alert.created` |
| **Resolution center** | `resolution_center_case.created`, `.decided`, `.updated` |

Hay además eventos de accounts, cards, payouts, plans, products, shipments,
transfers, entries, members y verificaciones — la tabla completa está en la guía.

> ⚠️ **El patrón que asumió OTC no matchea.** `normalize.ts` detecta cobros con
> `/payment.*(succe|complet|paid)/i` y órdenes con
> `/membership.*(went_valid|created|activat)/i`. Con los nombres reales:
> `payment.succeeded` matchea, pero **`membership.created` no existe** — el evento de
> alta es `membership.activated` (sí matchea `activat`) y `member.created` (que es otra
> cosa: la fila de miembro, no la membresía). Conviene reemplazar los regex por la
> lista literal de eventos.

---

## 2. Envelope y payloads

Todo evento llega como un `POST` con este envelope:

```json
{
  "id": "msg_bQPHmO2eBnHYtWWuxAN9K3Xd",
  "type": "payment.succeeded",
  "api_version": "v1",
  "api_version_date": "2026-08-14",
  "timestamp": "2026-08-10T17:03:24.291Z",
  "account_id": "biz_XXXXXXXX",
  "data": { "id": "pay_XXXXXXXX", "...": "el objeto completo" }
}
```

- **El objeto va bajo `data`** — no bajo `object`. OTC acepta las dos, así que anda,
  pero se puede simplificar.
- **`account_id` sólo desde el pin `2026-08-14`.** Los webhooks anclados antes, y los
  que no tienen pin, reciben ese campo como **`company_id`**.
- Los eventos `.updated` de account, product, plan y shipment traen además
  `previous_attributes` con los valores viejos de lo que cambió.
- `api_version` debe ser `v1`. Los formatos legacy `v2` y `v5` **no usan firmas
  Standard Webhooks** — no usarlos.

### Campos del objeto `Payment` (los que importan)

`id`, `status` (`draft`/`open`/`paid`/`void`), `substatus`, `currency`,
`settlement_amount`, `settlement_currency`, `subtotal`, `total`, `usd_total`,
`tax_amount`, `amount_after_fees`, `refunded_amount`, `refunded_at`, `paid_at`,
`created_at`, `updated_at`, `billing_reason`, `member`, `membership`, `user`,
`plan`, `product`, `promo_code`, `metadata`, `checkout_configuration_id`,
`payment_method_type`, `card_brand`, `card_last4`, `disputes`, `refunds`, `fees`.

### Campos del objeto `Refund`

`id`, `amount`, `currency`, `status`, `created_at`, `payment`, `provider`,
`provider_created_at`, `reference_type`, `reference_value`, `reference_status`.

### Campos del objeto `Membership`

`status` (`active`/`trialing`/`past_due`/…), `plan_id`, `product_id`, `user_id`,
`member`, `created_at`.

---

## 3. Firma — **la asunción era correcta, con un detalle**

Whop usa [Standard Webhooks](https://www.standardwebhooks.com/), como se asumió:

- Headers: `webhook-id`, `webhook-timestamp`, `webhook-signature`. Los cuatro
  (con `content-type`) están **congelados por contrato** y no cambian con ninguna
  versión de API.
- Formato del header: `v1,<firma en base64>`.
- Se firma `{webhook-id}.{webhook-timestamp}.{raw body}` con **HMAC-SHA256**.
- Rechazar si `webhook-timestamp` está a más de **5 minutos** del reloj actual.
- Comparación en tiempo constante.

> ⚠️ **El prefijo del secreto no es `whsec_`, es `ws_`.** La doc es explícita:
> *"pass it to the helper exactly as Whop gave it to you — a `ws_` string. Don't strip
> the prefix, and don't base64-encode it"*, y *"The key is your `ws_...` secret"*.
> `verify-signature.ts` sólo decodifica desde base64 cuando el secreto empieza con
> `whsec_`; como Whop nunca manda ese prefijo, cae en la rama correcta —
> **usa el string `ws_...` tal cual como clave HMAC**. Anda, pero la rama `whsec_`
> sobra para Whop y conviene documentar por qué está.
>
> El secreto se muestra **una sola vez** al crear el webhook (`webhook_secret` en la
> respuesta de `POST /webhooks`, o la columna Secret del dashboard).

---

## 4. Montos — **acá sí hay que corregir el código**

> ⚠️ **Whop NO manda centavos.** El spec es explícito en `Refund.amount`:
> *"The refunded amount as a decimal in the specified currency, such as **10.43 for
> $10.43 USD**"*. Todos los montos de `Payment` (`settlement_amount`, `subtotal`,
> `total`, `usd_total`, `refunded_amount`, `tax_amount`) son `number` decimales en la
> moneda de `currency`.

Dos consecuencias para `lib/payments/normalize.ts`:

1. **La heurística de `_cents` no aplica a Whop.** No existe ninguna clave
   `*_cents` en sus payloads, así que la división por 100 no se dispara — bien. Pero
   conviene dejar la regla explícita por proveedor en vez de por sufijo, porque
   **Commas sí manda centavos** (ver su `RESUMEN-OTC.md`). Los dos proveedores de la
   unidad I-2 usan convenciones opuestas.

2. **Ninguna de las claves que busca OTC existe en el `Payment` de Whop.**
   `KEYS.amount` es `["amount", "amount_cents", "final_amount", "total",
   "total_amount", "subtotal", "settled_amount", "value"]`. De esas, en el payload real
   sólo aparecen **`total`** y **`subtotal`**, y ninguna de las dos es lo que se quiere:
   la doc dice que `total` y `subtotal` son *"to show to the creator (excluding buyer
   fees)"*. El monto que efectivamente se le cobró al cliente es
   **`settlement_amount`** — *"The total amount charged to the customer for this
   payment, including taxes and after any discounts"*. `settled_amount` (que sí está en
   la lista) **no existe**; el campo se llama `settlement_amount`.

   Hay que agregar `settlement_amount` al principio de `KEYS.amount` y decidir
   explícitamente qué representa cada medida:
   - **M27 `revenue`** → `total` / `usd_total` (lo que ve el creador)
   - **M28 `cash_collected`** → `settlement_amount` (lo que pagó el cliente)
   - **M30 `refunds`** → `Refund.amount`, o `Payment.refunded_amount`

   Además `usd_total` da el total ya convertido a USD, que evita tener que resolver
   tipos de cambio del lado de OTC.

---

## 5. Backfill histórico — **sí se puede**

Era la duda de fondo: hoy OTC sólo recibe webhooks, así que no tiene historia previa a
la conexión. La API legacy expone los listados:

| Endpoint | Para qué |
|---|---|
| `GET /payments` | Todos los pagos — [ver](./ENDPOINTS-api-v1-stable.md#get-payments) |
| `GET /payments/{id}` · `GET /payments/{id}/fees` | Detalle y desglose de fees |
| `GET /refunds` · `GET /refunds/{id}` | Reembolsos |
| `GET /memberships` · `GET /memberships/{id}` | Membresías |
| `GET /members` · `GET /members/{id}` | Miembros |
| `GET /invoices` · `GET /invoices/{id}` | Facturas |

Con eso, al conectar una cuenta se puede traer la historia completa en vez de arrancar
en cero. **Es la diferencia principal con GHL**, donde el historial de etapas no existe.

---

## 6. Entrega, reintentos y duplicados

Datos operativos que conviene respetar en el handler:

- **Responder 2xx en menos de 5 segundos.** Timeout, error o redirect cuentan como
  fallo (Whop no sigue redirects).
- **Entrega *at least once*.** El mismo evento puede llegar más de una vez, con el
  mismo `webhook-id`. **Guardar el `webhook-id` y descartar duplicados** — OTC ya
  persiste el crudo en `payment_webhook_events`, así que la deduplicación va ahí.
- **Reintentos ~3 días**: 12 reintentos (30 s, 2 min, 8 min, 30 min, 1 h, 3 h, 6 h y
  después cada 12 h), ~71 horas en total.
- **El orden no está garantizado.** Un evento nuevo puede llegar antes que uno viejo.
- **Whop desactiva endpoints que fallan.** 24 h de fallos → email de aviso; 72 h y 10+
  entregas fallidas → webhook desactivado. Al reactivarlo **no reenvía lo que pasó
  mientras estuvo apagado**: hay que leerlo de la API.
- Las entregas quedan guardadas 30 días: `GET /webhooks/{id}/deliveries`.
- La URL tiene que ser pública — Whop rechaza `localhost` y redes privadas.

---

## Qué queda por verificar contra una cuenta real

Va al [`PLAN_VERIFICACION.md`](../../PLAN_VERIFICACION.md):

1. **Que la firma valide** con el secreto `ws_...` usado como clave literal.
2. **Que `settlement_amount` sea el monto cobrado** y coincida con el dashboard de Whop
   para un cobro concreto.
3. **Si el webhook llega con `account_id` o `company_id`**, que depende del pin con el
   que se cree la suscripción. Conviene crearla con `Api-Version-Date` explícito.
4. **Qué eventos dispara realmente un plan de cuotas**, para poder derivar M29
   (`contracted_value`) — el `Payment` trae `financing_installments_count` cuando el
   pago es financiado, pero no está claro si eso cubre los planes de pago manuales.
