---
title: "Webhook Events Reference"
source: "https://commasdocs.com/#webhook-events-reference"
seccion: "Webhooks"
ancla: "#webhook-events-reference"
capturado: "2026-08-30"
---

# Webhook Events Reference

Every action in Commas — a payment coming in, a subscription renewing, a dispute being filed — fires a webhook event to your registered endpoint. This reference documents every event type, exactly what fields to expect, and what each field means so you can build reliable integrations with confidence.

⬡ How to read this reference

**Every** event is delivered in the same **envelope format**: a top-level `id`, `type`, `created_at`, and a `data` object holding the actual event data. The `id` is a UUID unique to that delivery — store it and use it for deduplication. Each event below shows its full payload shape and a field-by-field breakdown. Use the `type` field to route events to the right handler in your code.

✦ Quick handler pattern

The simplest webhook handler: (1) verify the signature, (2) read the `type` field, (3) switch to the right handler, (4) return 200. Don't run heavy logic synchronously — push work to a queue and respond fast.

⚠ Test events are shaped differently

The [Test Webhook](#wh-test) endpoint sends **flat** payloads for `payment.succeeded` and the core `subscription.*` events — no envelope. Real deliveries are always enveloped, so don't validate a parser against test events alone. Delivery is also **at-most-once**: a failed delivery is logged and never retried.

EVENT OVERVIEW TABLE

### All 14 Events at a Glance

| Event | Category | When it fires | Format |
| --- | --- | --- | --- |
| `payment.succeeded` | Payment | A payment was successfully charged | Envelope |
| `payment.failed` | Payment | A payment attempt was declined or errored | Envelope |
| `payment.expired` | Payment | A checkout session timed out before payment | Envelope |
| `payment.canceled` | Payment | A payment was canceled before completion | Envelope |
| `product.purchased` | Product | A one-time product purchase was completed | Envelope |
| `subscription.created` | Subscription | A new subscription was started (first payment) | Envelope |
| `subscription.renewed` | Subscription | A subscription successfully billed for another period | Envelope |
| `subscription.completed` | Subscription | A subscription finished all scheduled payments | Envelope |
| `subscription.canceled` | Subscription | A subscription was canceled | Envelope |
| `subscription.past_due` | Subscription | A renewal charge failed; automatic retries are scheduled | Envelope |
| `subscription.recovered` | Subscription | A past-due subscription was recovered by a successful charge | Envelope |
| `dispute.created` | Dispute | A chargeback was filed by the customer's bank | Envelope |
| `dispute.updated` | Dispute | A dispute's status changed (e.g., resolved as won) | Envelope |
| `refund.created` | Refund | A refund was issued to a customer | Envelope |

PAYMENT EVENTS

## Payment Events `payment.succeeded``payment.failed``payment.expired``payment.canceled`

These events track the lifecycle of individual payment attempts. Every checkout — one-time or subscription — produces at least one of these events.

payment.succeeded

payment.succeeded

Fires when a charge is successfully processed

This is the most important event. It tells you a customer paid and money is on its way to you. Use it to grant access, send a receipt, record the transaction, and trigger any post-purchase fulfilment. Both one-time payments and the initial payment of a subscription produce this event.

✦ What to do when this fires

Check `item.type` to distinguish between a subscription first-payment and a one-time charge. For subscriptions, also listen for `subscription.created` which carries additional metadata. Dedupe on the envelope `id` — a UUID unique to each delivery — and store it to prevent granting access twice if the event delivers more than once. `payment_id` is the payment's business identifier, not a dedupe key (it may be null for free-trial subscriptions).

Example Payload

```json
{
  "id": "9b2f5c1e-4a7d-4c9e-b1f3-2d8e6a1c0f45",
  "type": "payment.succeeded",
  "data": {
    "payment_id": "ORD-8F3K-2MQ9-X7LP",
    "amount": 29.00,
    "currency": "USD",
    "status": "succeeded",
    "created_at": "2026-07-13T21:42:47+00:00",
    "quantity": 1,
    "unit_price": 29.00,
    "total_price": 29.00,
    "payment_type": "subscription",
    "payment_method": "card",
    "application_fee_amount": 0,
    "transaction_history_id": "ORD-8F3K-2MQ9-X7LP",
    "buyer": {
      "id": "user_4Kd9mQ2xZ7Lp",
      "name": "Alex Johnson",
      "email": "alex@example.com",
      "phone": "+15550100",
      "address": { "line1": "123 Main St", "city": "Miami", "country": "US" }
    },
    "item": {
      "id": "NLxj6",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "api_metadata": {
      "data": {
        "discord_user_id": "123456789",
        "plan": "monthly"
      }
    },
    "subscription": {
      "id": "qYyEp",
      "status": "active",
      "start_date": "2026-07-13T21:42:47+00:00",
      "end_date": "2026-08-13T21:42:47+00:00",
      "payment_frequency": "monthly",
      "auto_renew_count": 0,
      "initial_fee": null,
      "initial_fee_days": null
    },
    "order_bumps": [
      {
        "id": "aB3xZ",
        "quantity": 1,
        "unit_price": 9.00,
        "total_price": 9.00,
        "item": { "id": "kQ7wR", "title": "Starter Pack", "type": "onetime" }
      }
    ],
    "customFields": [
      { "label": "Discord username", "type": "text", "value": "alex#1234" }
    ],
    "productID": "NLxj6",
    "affiliate_id": null,
    "affiliate_commission_amount": null,
    "affiliate_commission_percentage": null,
    "discount_code": "SUMMER20",
    "discount_amount": 5.80,
    "event_type": "payment.succeeded"
  },
  "created_at": "2026-07-13T21:42:47+00:00"
}
```

#### Field Reference

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Optional |
| `type` | string | Optional |
| `created_at` | string | Optional |
| `data.payment_id` | string | Optional |
| `data.amount` | number | Optional |
| `data.currency` | string | Optional |
| `data.status` | string | Optional |
| `data.payment_type` | string | Optional |
| `data.payment_method` | string | Optional |
| `data.buyer.id` | string | Optional |
| `data.buyer.email` | string | Optional |
| `data.buyer.name` | string | Optional |
| `data.item.id` | string | Optional |
| `data.item.title` | string | Optional |
| `data.item.type` | string | Optional |
| `data.subscription` | object\|null | Optional |
| `data.order_bumps` | array | Optional |
| `data.customFields` | array | Optional |
| `data.discount_code` | string\|null | Optional |
| `data.affiliate_id` | string\|null | Optional |
| `data.api_metadata.data` | object\|null | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "payment.succeeded" },
    "created_at": { "type": "string", "format": "date-time", "description": "ISO 8601 timestamp" },
    "data": {
      "type": "object",
      "required": ["payment_id", "amount", "currency", "status", "created_at", "buyer", "item"],
      "properties": {
        "payment_id": { "type": ["string", "null"], "description": "Public order ID (ORD-XXXX-XXXX-XXXX)" },
        "amount": { "type": "number", "description": "The payment amount in dollars" },
        "currency": { "type": "string", "description": "The payment currency (e.g., USD)" },
        "status": { "type": "string", "const": "succeeded" },
        "payment_type": { "type": "string", "enum": ["subscription", "onetime", "subscription_initial_fee"] },
        "created_at": { "type": "string", "format": "date-time" },
        "buyer": {
          "type": "object",
          "required": ["id", "name", "email"],
          "properties": {
            "id": { "type": "string", "description": "Public user ID (user_ + 12 characters)" },
            "name": { "type": "string" },
            "email": { "type": "string", "format": "email" }
          }
        },
        "item": {
          "type": "object",
          "required": ["id", "title", "type"],
          "properties": {
            "id": { "type": "string", "description": "Public product ID (hashid)" },
            "title": { "type": "string" },
            "type": { "type": "string", "enum": ["subscription", "onetime"] }
          }
        },
        "subscription": { "type": ["object", "null"], "description": "Subscription context for subscription payments" },
        "order_bumps": { "type": "array", "description": "Order bumps purchased alongside the main item" },
        "customFields": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "label": { "type": "string" },
              "type": { "type": "string" },
              "value": {}
            }
          }
        },
        "api_metadata": {
          "type": ["object", "null"],
          "properties": { "data": { "type": "object", "description": "Metadata you passed at checkout-session creation" } }
        }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "5d8a1f3c-2b7e-4a9d-8c1e-6f4b2a9d0c17",
  "type": "payment.succeeded",
  "data": {
    "payment_id": "ORD-2QW8-7NR4-K1MZ",
    "amount": 49.99,
    "currency": "USD",
    "status": "succeeded",
    "created_at": "2026-07-13T21: 42: 47+00: 00",
    "buyer": {
      "id": "user_8Fh2wN5cV1Rt",
      "name": "Jane Cooper",
      "email": "jane@example.com"
    },
    "item": {
      "id": "qYyEp",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "event_type": "payment.succeeded"
  },
  "created_at": "2026-07-13T21: 42: 47+00: 00"
}⎘ Copy
```

payment.failed

payment.failed

Fires when a payment attempt is declined or errors

Sent when a charge attempt fails — expired card, insufficient funds, or a bank decline. Check `failure_reason` to understand why it failed and consider sending the customer a payment-update email. Note: automatic retries _do_ emit this event — **every** failed dunning / revival attempt inside the subscription recovery window fires its own `payment.failed`, alongside `subscription.past_due`. Expect several of these per past-due cycle and rate-limit any customer email you send off the back of it.

Example Payload

```json
{
  "id": "7e2b9d4a-1c8f-4e3b-9a6d-5c1f8e2b7a90",
  "type": "payment.failed",
  "data": {
    "payment_id": "ORD-8F3K-2MQ9-X7LP",
    "customer_id": "user_4Kd9mQ2xZ7Lp",
    "subscription_id": "qYyEp",
    "failure_reason": "card_declined",
    "status_code": "card_declined",
    "payment_method": "card",
    "timestamp": "2026-07-13T21:42:47+00:00",
    "service_id": "NLxj6",
    "event_type": "payment.failed"
  },
  "created_at": "2026-07-13T21:42:47+00:00"
}
```

#### Field Reference

| Field | Type | Notes |
| --- | --- | --- |
| `data.payment_id` | string | Optional |
| `data.customer_id` | string\|null | Optional |
| `data.subscription_id` | string\|null | Optional |
| `data.failure_reason` | string | Optional |
| `data.status_code` | string\|null | Optional |
| `data.payment_method` | string | Optional |
| `data.timestamp` | string | Optional |
| `data.service_id` | string\|null | Optional |
| `data.event_type` | string | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "payment.failed" },
    "created_at": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["payment_id", "failure_reason", "timestamp"],
      "properties": {
        "payment_id": { "type": "string", "description": "The failed attempt's public order ID" },
        "customer_id": { "type": ["string", "null"], "description": "Public customer ID when known" },
        "subscription_id": { "type": ["string", "null"], "description": "The subscription's public ID if related" },
        "failure_reason": { "type": "string", "description": "The reason for the payment failure" },
        "status_code": { "type": ["string", "null"], "description": "Gateway status code (e.g., card_declined)" },
        "payment_method": { "type": "string", "description": "Payment method attempted" },
        "timestamp": { "type": "string", "format": "date-time", "description": "ISO 8601 timestamp" },
        "service_id": { "type": ["string", "null"], "description": "The product's public ID if available" },
        "event_type": { "type": "string", "const": "payment.failed" }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "1f6c3a8e-9d2b-4f7a-b3c8-2e9d6f1a4b52",
  "type": "payment.failed",
  "data": {
    "payment_id": "ORD-5TG2-9KX7-P3QW",
    "customer_id": "user_8Fh2wN5cV1Rt",
    "failure_reason": "Your card was declined",
    "status_code": "card_declined",
    "payment_method": "card",
    "timestamp": "2026-07-13T21: 42: 47+00: 00",
    "event_type": "payment.failed"
  },
  "created_at": "2026-07-13T21: 42: 47+00: 00"
}⎘ Copy
```

payment.expired

payment.expired

Fires when a checkout session times out before payment

A checkout session was created but the customer never completed payment before the session expired. `customer_id` and `subscription_id` are null unless the session belongs to an existing subscriber — in that case both are populated. You can use this event to trigger a re-engagement flow ("You left something behind!") if you have the customer's contact from a prior interaction.

Example Payload

```json
{
  "id": "4a9c2e7f-8b1d-4c6a-9e3f-1d7b5a2c8e40",
  "type": "payment.expired",
  "data": {
    "checkout_session_id": 345424,
    "customer_id": null,
    "subscription_id": null,
    "failure_reason": "Payment session expired",
    "expiration_date": "2026-07-08T14:30:00+00:00",
    "timestamp": "2026-07-08T14:30:05+00:00",
    "service_id": "NLxj6",
    "service_title": "Pro Membership",
    "service_type": "subscription",
    "event_type": "payment.expired"
  },
  "created_at": "2026-07-08T14:30:05+00:00"
}
```

#### Field Reference

| Field | Type | Notes |
| --- | --- | --- |
| `data.checkout_session_id` | integer | Optional |
| `data.customer_id` | string\|null | Optional |
| `data.subscription_id` | string\|null | Optional |
| `data.failure_reason` | string | Optional |
| `data.expiration_date` | string (ISO 8601) | Optional |
| `data.service_id` | string\|null | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "payment.expired" },
    "created_at": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["checkout_session_id", "failure_reason", "expiration_date", "timestamp"],
      "properties": {
        "checkout_session_id": { "type": "integer", "description": "The checkout session ID that expired" },
        "customer_id": { "type": ["string", "null"], "description": "Populated when the session belongs to an existing subscriber" },
        "subscription_id": { "type": ["string", "null"], "description": "Populated when the session belongs to an existing subscriber" },
        "failure_reason": { "type": "string", "description": "Always 'Payment session expired'" },
        "expiration_date": { "type": "string", "format": "date-time", "description": "When the session expired" },
        "timestamp": { "type": "string", "format": "date-time", "description": "When the event was processed" },
        "service_id": { "type": ["string", "null"], "description": "The product's public ID" },
        "service_title": { "type": ["string", "null"], "description": "The product's title" },
        "service_type": { "type": ["string", "null"], "description": "The product type (e.g., subscription, onetime)" },
        "event_type": { "type": "string", "const": "payment.expired" }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "8d3f1b6a-4e9c-4a2d-b7e1-9c5a3f8d2b64",
  "type": "payment.expired",
  "data": {
    "checkout_session_id": 345424,
    "customer_id": "user_8Fh2wN5cV1Rt",
    "subscription_id": "qYyEp",
    "failure_reason": "Payment session expired",
    "expiration_date": "2026-07-13T21: 42: 47+00: 00",
    "timestamp": "2026-07-13T21: 42: 47+00: 00",
    "event_type": "payment.expired"
  },
  "created_at": "2026-07-13T21: 42: 47+00: 00"
}⎘ Copy
```

payment.canceled

payment.canceled

Fires when a payment is explicitly canceled

Sent when a payment is actively canceled — for example the buyer abandoned the flow, or the processor voided the intent. There is **no public API for canceling a payment**, so this event always originates from the buyer or the processor, never from a call you make. Unlike `payment.expired`, a `customer_id` is present here because the customer had begun the checkout flow. The `failure_reason` carries the processor's cancellation reason.

Example Payload

```json
{
  "id": "6b1e8c3d-2f7a-4d9b-8a4c-3e1f9b6d2a75",
  "type": "payment.canceled",
  "data": {
    "payment_id": "ORD-8F3K-2MQ9-X7LP",
    "customer_id": "user_4Kd9mQ2xZ7Lp",
    "failure_reason": "requested_by_customer",
    "timestamp": "2026-07-13T21:42:47+00:00",
    "event_type": "payment.canceled"
  },
  "created_at": "2026-07-13T21:42:47+00:00"
}
```

#### Field Reference

| Field | Type | Notes |
| --- | --- | --- |
| `data.payment_id` | string | Optional |
| `data.customer_id` | string | Optional |
| `data.failure_reason` | string | Optional |
| `data.event_type` | string | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "payment.canceled" },
    "created_at": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["payment_id", "failure_reason", "timestamp"],
      "properties": {
        "payment_id": { "type": "string", "description": "The canceled payment's public order ID" },
        "customer_id": { "type": ["string", "null"], "description": "Public customer ID when known" },
        "subscription_id": { "type": ["string", "null"], "description": "The subscription's public ID if related" },
        "failure_reason": { "type": "string", "description": "The reason for payment cancellation" },
        "timestamp": { "type": "string", "format": "date-time", "description": "ISO 8601 timestamp" },
        "service_id": { "type": ["string", "null"], "description": "The product's public ID if available" },
        "event_type": { "type": "string", "const": "payment.canceled" }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "2c8a5f1d-7b3e-4c6f-9d2a-8e4b1c7f3a96",
  "type": "payment.canceled",
  "data": {
    "payment_id": "ORD-7JW3-4TB8-M2VX",
    "customer_id": "user_8Fh2wN5cV1Rt",
    "failure_reason": "Payment was canceled by user",
    "timestamp": "2026-07-13T21: 42: 47+00: 00",
    "event_type": "payment.canceled"
  },
  "created_at": "2026-07-13T21: 42: 47+00: 00"
}⎘ Copy
```

PRODUCT EVENTS

## Product Events `product.purchased`

Fires for one-time product purchases. Complements `payment.succeeded` with richer product context including upsell and order-bump attribution.

product.purchased

product.purchased

Fires when a one-time product purchase completes

Sent specifically for one-time product purchases — digital goods, course access, lifetime memberships, etc. This event includes `additional_params` which tells you whether the purchase came through an order bump, upsell, or downsell. Use these flags to attribute revenue and understand your sales funnel. This event fires in addition to `payment.succeeded`.

ℹ Bump, upsell, and downsell explained

`bump`: customer added an order bump (add-on shown at checkout). `upsell`: purchase came from a post-checkout upsell page. `downsell`: customer took a lower-priced alternative after declining an upsell.

Example Payload

```json
{
  "id": "9e4b2c7a-1d8f-4b3e-8c6a-5f2d9e1b7c43",
  "type": "product.purchased",
  "data": {
    "payment_id": "ORD-8F3K-2MQ9-X7LP",
    "currency": "USD",
    "status": "succeeded",
    "created_at": "2026-07-13T21:42:47+00:00",
    "product_price": 29.00,
    "buyer": {
      "id": "user_2Wp7kD4nX9Fs",
      "email": "jane@example.com",
      "name": "Jane Smith"
    },
    "item": {
      "id": "kQ7wR",
      "title": "Lifetime Access Pack",
      "type": "onetime"
    },
    "additional_params": {
      "bump": false,
      "upsell": true,
      "downsell": false
    },
    "event_type": "product.purchased"
  },
  "created_at": "2026-07-13T21:42:47+00:00"
}
```

#### Field Reference

| Field | Type | Notes |
| --- | --- | --- |
| `data.payment_id` | string | Optional |
| `data.product_price` | number | Optional |
| `data.buyer` | object | Optional |
| `data.buyer.id` | string | Optional |
| `data.item` | object | Optional |
| `data.item.id` | string | Optional |
| `data.additional_params.bump` | boolean | Optional |
| `data.additional_params.upsell` | boolean | Optional |
| `data.additional_params.downsell` | boolean | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "product.purchased" },
    "created_at": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["payment_id", "currency", "status", "created_at", "product_price", "buyer", "item"],
      "properties": {
        "payment_id": { "type": "string", "description": "Public order ID (ORD-XXXX-XXXX-XXXX)" },
        "currency": { "type": "string", "description": "The payment currency (e.g., USD)" },
        "status": { "type": "string", "const": "succeeded" },
        "created_at": { "type": "string", "format": "date-time" },
        "product_price": { "type": "number", "description": "The price of the purchased product, in dollars" },
        "buyer": {
          "type": "object",
          "required": ["id", "name", "email"],
          "properties": {
            "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" }
          }
        },
        "item": {
          "type": "object",
          "required": ["id", "title", "type"],
          "properties": {
            "id": { "type": "string" }, "title": { "type": "string" }, "type": { "type": "string" }
          }
        },
        "api_metadata": { "type": ["object", "null"], "properties": { "data": { "type": "object" } } },
        "additional_params": { "type": ["object", "null"], "description": "Additional purchase parameters (upsell, downsell, bump)" },
        "event_type": { "type": "string", "const": "product.purchased" }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "3a7d1e9c-5b2f-4e8a-9c4d-1f6b8a3e5d20",
  "type": "product.purchased",
  "data": {
    "payment_id": "ORD-4HN6-8SC2-Q9RY",
    "currency": "USD",
    "status": "succeeded",
    "created_at": "2026-07-13T21: 42: 47+00: 00",
    "product_price": 29.99,
    "buyer": {
      "id": "user_8Fh2wN5cV1Rt",
      "name": "Jane Cooper",
      "email": "jane@example.com"
    },
    "item": {
      "id": "vB2tK",
      "title": "Digital Marketing Course",
      "type": "onetime"
    },
    "event_type": "product.purchased"
  },
  "created_at": "2026-07-13T21: 42: 47+00: 00"
}⎘ Copy
```

SUBSCRIPTION EVENTS

## Subscription Events `subscription.created``subscription.renewed``subscription.completed``subscription.canceled``subscription.past_due``subscription.recovered`

These six events cover the complete subscription lifecycle. Together they let you keep your own access system perfectly in sync with Commas's billing state.

subscription.created

subscription.created

Fires when a new subscription is started (first payment)

The customer just started a subscription — this is their first successful charge. The payload includes a `subscription` object with the subscription's ID, status, billing frequency, and start date. Use this to create an account, assign a role or plan tier, and set an access-expiry date in your database.

ℹ Free trial handling

When `subscription.is_free_trial` is `true`, no money was collected yet. This event still fires so you can grant access immediately. The first real charge will produce a `subscription.renewed` event when the trial ends.

Example Payload

```json
{
  "id": "b4e8c2a6-3f1d-4a7b-9e5c-8d2f6b1a4c93",
  "type": "subscription.created",
  "data": {
    "payment_id": "ORD-8F3K-2MQ9-X7LP",
    "amount": 29.00,
    "currency": "USD",
    "status": "succeeded",
    "payment_method": "card",
    "buyer": {
      "id": "user_4Kd9mQ2xZ7Lp",
      "email": "alex@example.com",
      "name": "Alex Johnson"
    },
    "item": {
      "id": "NLxj6",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "qYyEp",
      "status": "active",
      "start_date": "2026-07-13T10:00:00+00:00",
      "end_date": "2026-08-13T10:00:00+00:00",
      "is_free_trial": false,
      "payment_frequency": "monthly"
    },
    "api_metadata": {
      "data": {
        "discord_user_id": "123456789"
      }
    },
    "event_type": "subscription.created"
  },
  "created_at": "2026-07-13T10:00:00+00:00"
}
```

#### Subscription Object Fields

| Field | Type | Notes |
| --- | --- | --- |
| `subscription.id` | string | Optional |
| `subscription.status` | string | Optional |
| `subscription.start_date` | string (ISO 8601) | Optional |
| `subscription.is_free_trial` | boolean | Optional |
| `subscription.payment_frequency` | string | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "subscription.created" },
    "created_at": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["payment_id", "amount", "currency", "status", "buyer", "item", "subscription"],
      "properties": {
        "payment_id": { "type": "string", "description": "Public order ID (ORD-XXXX-XXXX-XXXX)" },
        "amount": { "type": "number", "description": "Amount charged, in dollars" },
        "currency": { "type": "string" },
        "status": { "type": "string", "const": "succeeded" },
        "buyer": {
          "type": "object", "required": ["id", "name", "email"],
          "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" } }
        },
        "item": {
          "type": "object", "required": ["id", "title", "type"],
          "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "type": { "type": "string" } }
        },
        "subscription": {
          "type": "object", "required": ["id", "status", "start_date"],
          "properties": {
            "id": { "type": "string", "description": "The subscription's public ID (hashid)" },
            "status": { "type": "string", "description": "The subscription status (e.g., active)" },
            "start_date": { "type": "string", "format": "date-time" },
            "end_date": { "type": ["string", "null"], "format": "date-time" },
            "is_free_trial": { "type": "boolean", "description": "Whether this is a free trial" },
            "payment_frequency": { "type": "string", "description": "e.g., monthly" }
          }
        },
        "api_metadata": {
          "type": ["object", "null"],
          "properties": { "data": { "type": "object", "description": "Metadata you passed at checkout-session creation" } }
        },
        "event_type": { "type": "string", "const": "subscription.created" }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "e7c3a9f1-6d2b-4e8c-a1f5-3b9d7e2c8a61",
  "type": "subscription.created",
  "data": {
    "payment_id": "ORD-9RK2-5WM7-T4XB",
    "amount": 19.99,
    "currency": "USD",
    "status": "succeeded",
    "buyer": {
      "id": "user_8Fh2wN5cV1Rt",
      "name": "Jane Cooper",
      "email": "jane@example.com"
    },
    "item": {
      "id": "qYyEp",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "mR4dW",
      "status": "active",
      "start_date": "2026-07-13T21: 42: 47+00: 00"
    },
    "event_type": "subscription.created"
  },
  "created_at": "2026-07-13T21: 42: 47+00: 00"
}⎘ Copy
```

subscription.renewed

subscription.renewed

Fires on each successful recurring charge

A subscription successfully billed for another period. Nearly identical to `subscription.created` but the `subscription` object adds `renewed_at` and `auto_renew_count`. Use this to extend access dates and log recurring revenue in your system.

Example Payload

```json
{
  "id": "c1f7b3e9-8a4d-4c2f-b6e8-1d5a9c3f7b28",
  "type": "subscription.renewed",
  "data": {
    "payment_id": "ORD-3LV8-6PD1-H9SN",
    "amount": 29.00,
    "currency": "USD",
    "status": "succeeded",
    "payment_method": "card",
    "buyer": {
      "id": "user_4Kd9mQ2xZ7Lp",
      "email": "alex@example.com",
      "name": "Alex Johnson"
    },
    "item": {
      "id": "NLxj6",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "qYyEp",
      "status": "active",
      "start_date": "2026-01-15T10:00:00+00:00",
      "payment_frequency": "monthly",
      "renewed_at": "2026-07-15T10:00:00+00:00",
      "auto_renew_count": 6
    },
    "api_metadata": {
      "data": {
        "discord_user_id": "123456789"
      }
    },
    "event_type": "subscription.renewed"
  },
  "created_at": "2026-07-15T10:00:00+00:00"
}
```

#### Additional Fields (vs. subscription.created)

| Field | Type | Notes |
| --- | --- | --- |
| `subscription.renewed_at` | string (ISO 8601) | Optional |
| `subscription.auto_renew_count` | integer | Optional |
| `subscription.is_free_trial` | — | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "subscription.renewed" },
    "created_at": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["payment_id", "amount", "currency", "status", "buyer", "item", "subscription"],
      "properties": {
        "payment_id": { "type": "string", "description": "Public order ID (ORD-XXXX-XXXX-XXXX)" },
        "amount": { "type": "number", "description": "Amount charged, in dollars" },
        "currency": { "type": "string" },
        "status": { "type": "string", "const": "succeeded" },
        "buyer": {
          "type": "object", "required": ["id", "name", "email"],
          "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" } }
        },
        "item": {
          "type": "object", "required": ["id", "title", "type"],
          "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "type": { "type": "string" } }
        },
        "subscription": {
          "type": "object", "required": ["id", "status", "start_date", "renewed_at"],
          "properties": {
            "id": { "type": "string", "description": "The subscription's public ID (hashid)" },
            "status": { "type": "string" },
            "start_date": { "type": "string", "format": "date-time" },
            "renewed_at": { "type": "string", "format": "date-time", "description": "When the subscription was renewed" },
            "end_date": { "type": ["string", "null"] },
            "payment_frequency": { "type": "string" },
            "auto_renew_count": { "type": "integer", "description": "Number of auto-renewals" }
          }
        },
        "api_metadata": {
          "type": ["object", "null"],
          "properties": { "data": { "type": "object" } }
        },
        "event_type": { "type": "string", "const": "subscription.renewed" }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "f2a8d4c1-7e3b-4f9a-c5d2-9b1e6a8f3c74",
  "type": "subscription.renewed",
  "data": {
    "payment_id": "ORD-6XQ4-2ZJ9-W7KC",
    "amount": 19.99,
    "currency": "USD",
    "status": "succeeded",
    "buyer": {
      "id": "user_8Fh2wN5cV1Rt",
      "name": "Jane Cooper",
      "email": "jane@example.com"
    },
    "item": {
      "id": "qYyEp",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "mR4dW",
      "status": "active",
      "start_date": "2026-06-13T21: 42: 47+00: 00",
      "renewed_at": "2026-07-13T21: 42: 47+00: 00"
    },
    "event_type": "subscription.renewed"
  },
  "created_at": "2026-07-13T21: 42: 47+00: 00"
}⎘ Copy
```

subscription.completed

subscription.completed

Fires when a subscription finishes all scheduled payments

The subscription ran through all its scheduled payments and has naturally completed. This differs from `subscription.canceled` in that no one canceled it — it simply reached its intended end. The `completion_reason` is always `period_ended`. Unlike `subscription.created`/`renewed`, this event carries no payment fields — only `buyer`, `item`, and `subscription`. Use it to gracefully downgrade the customer's access or start an offboarding flow.

Example Payload

```json
{
  "id": "a6d2f8b4-1c9e-4b7d-8f3a-5e1c9b4d7a26",
  "type": "subscription.completed",
  "data": {
    "buyer": {
      "id": "user_4Kd9mQ2xZ7Lp",
      "email": "alex@example.com",
      "name": "Alex Johnson"
    },
    "item": {
      "id": "wS8cM",
      "title": "6-Month Coaching Program",
      "type": "subscription"
    },
    "subscription": {
      "id": "qYyEp",
      "status": "completed",
      "start_date": "2026-01-01T00:00:00+00:00",
      "payment_frequency": "monthly",
      "auto_renew_count": 5,
      "completion_reason": "period_ended",
      "completed_at": "2026-07-01T00:00:00+00:00"
    },
    "api_metadata": { "data": { "plan": "coaching" } },
    "event_type": "subscription.completed"
  },
  "created_at": "2026-07-01T00:00:00+00:00"
}
```

#### Additional Fields (vs. subscription.created)

| Field | Type | Notes |
| --- | --- | --- |
| `subscription.status` | string | Optional |
| `subscription.completion_reason` | string | Optional |
| `subscription.completed_at` | string (ISO 8601) | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "subscription.completed" },
    "created_at": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["buyer", "item", "subscription"],
      "properties": {
        "buyer": {
          "type": "object", "required": ["id", "name", "email"],
          "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" } }
        },
        "item": {
          "type": "object", "required": ["id", "title", "type"],
          "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "type": { "type": "string" } }
        },
        "subscription": {
          "type": "object", "required": ["id", "status", "start_date", "completed_at"],
          "properties": {
            "id": { "type": "string", "description": "The subscription's public ID (hashid)" },
            "status": { "type": "string", "const": "completed" },
            "start_date": { "type": "string", "format": "date-time" },
            "completed_at": { "type": "string", "format": "date-time" },
            "payment_frequency": { "type": "string" },
            "auto_renew_count": { "type": "integer" },
            "completion_reason": { "type": "string", "const": "period_ended" }
          }
        },
        "api_metadata": { "type": ["object", "null"], "properties": { "data": { "type": "object" } } },
        "customFields": { "type": "array" },
        "event_type": { "type": "string", "const": "subscription.completed" }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "d9b5e1a7-3c8f-4d2b-9a6e-7f4c1d8b5a39",
  "type": "subscription.completed",
  "data": {
    "buyer": {
      "id": "user_8Fh2wN5cV1Rt",
      "name": "Jane Cooper",
      "email": "jane@example.com"
    },
    "item": {
      "id": "qYyEp",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "mR4dW",
      "status": "completed",
      "start_date": "2025-07-13T21: 42: 47+00: 00",
      "completed_at": "2026-07-13T21: 42: 47+00: 00",
      "completion_reason": "period_ended"
    },
    "event_type": "subscription.completed"
  },
  "created_at": "2026-07-13T21: 42: 47+00: 00"
}⎘ Copy
```

subscription.canceled

subscription.canceled

Fires when a subscription is actively canceled

A subscription was canceled — by the customer, by you (in the dashboard or via the Cancel Subscription API), or by Commas after too many failed payment retries. Check `cancellation_reason` to distinguish between these cases. This event carries no payment fields — only `buyer`, `item`, and `subscription`. Note the status value is spelled `cancelled` (double L). Use this event to revoke access, trigger a win-back campaign, and update the subscription status in your database.

Example Payload

```json
{
  "id": "3c1d8e2f-9a4b-4d6c-8e1f-7b2a5c9d0e34",
  "type": "subscription.canceled",
  "data": {
    "buyer": {
      "id": "user_4Kd9mQ2xZ7Lp",
      "name": "Alex Johnson",
      "email": "alex@example.com"
    },
    "item": {
      "id": "NLxj6",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "qYyEp",
      "status": "cancelled",
      "start_date": "2026-01-15T10:00:00+00:00",
      "cancelled_at": "2026-07-13T14:22:00+00:00",
      "cancellation_reason": "user_cancel",
      "end_date": "2026-08-15T10:00:00+00:00",
      "auto_renew_count": 5,
      "payment_method": "card",
      "payment_frequency": "monthly"
    },
    "api_metadata": { "data": { "plan": "monthly" } },
    "customFields": [
      { "label": "Discord username", "type": "text", "value": "alex#1234" }
    ],
    "event_type": "subscription.canceled"
  },
  "created_at": "2026-07-13T14:22:00+00:00"
}
```

#### Additional Fields (vs. subscription.created)

| Field | Type | Notes |
| --- | --- | --- |
| `subscription.status` | string | Optional |
| `subscription.cancelled_at` | string (ISO 8601) | Optional |
| `subscription.cancellation_reason` | string | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event ID (UUID)" },
    "type": { "type": "string", "const": "subscription.canceled" },
    "created_at": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["buyer", "item", "subscription"],
      "properties": {
        "buyer": {
          "type": "object", "required": ["id", "name", "email"],
          "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" } }
        },
        "item": {
          "type": "object", "required": ["id", "title", "type"],
          "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "type": { "type": "string" } }
        },
        "subscription": {
          "type": "object", "required": ["id", "status", "start_date", "cancelled_at"],
          "properties": {
            "id": { "type": "string", "description": "The subscription's public ID (hashid)" },
            "status": { "type": "string", "const": "cancelled" },
            "start_date": { "type": "string", "format": "date-time" },
            "cancelled_at": { "type": "string", "format": "date-time" },
            "end_date": { "type": ["string", "null"] },
            "payment_method": { "type": "string" },
            "payment_frequency": { "type": "string" },
            "auto_renew_count": { "type": "integer" },
            "cancellation_reason": { "type": "string", "enum": ["user_cancel", "user_request", "admin_action", "api_request", "subscription_failed"] }
          }
        },
        "api_metadata": { "type": ["object", "null"], "properties": { "data": { "type": "object" } } },
        "customFields": { "type": "array" },
        "event_type": { "type": "string", "const": "subscription.canceled" }
      }
    }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "b8f4c2d6-9e1a-4f7c-b3d8-2a6e9c4f1b57",
  "type": "subscription.canceled",
  "data": {
    "buyer": {
      "id": "user_8Fh2wN5cV1Rt",
      "name": "Jane Cooper",
      "email": "jane@example.com"
    },
    "item": {
      "id": "qYyEp",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "mR4dW",
      "status": "cancelled",
      "start_date": "2026-01-20T21: 42: 47+00: 00",
      "cancelled_at": "2026-07-13T14: 30: 00+00: 00",
      "cancellation_reason": "user_cancel"
    },
    "event_type": "subscription.canceled"
  },
  "created_at": "2026-07-13T14: 30: 00+00: 00"
}⎘ Copy
```

subscription.past_due

subscription.past_due

Fires when a renewal charge fails and retries begin

A renewal charge failed and the subscription entered the automatic retry window. Commas will retry the charge on a schedule — `attempt_number`, `max_attempts`, and `next_retry_date` tell you where the subscription is in that flow. Each failed retry attempt _also_ emits its own `payment.failed` event, so expect both; this event is your signal to pause access and prompt the customer to update their payment method.

Example Payload

```json
{
  "id": "5e2c9a7f-4b1d-4e8a-9c3f-7d5b2e9a1c48",
  "type": "subscription.past_due",
  "data": {
    "buyer": {
      "id": "user_4Kd9mQ2xZ7Lp",
      "name": "Alex Johnson",
      "email": "alex@example.com"
    },
    "item": {
      "id": "NLxj6",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "qYyEp",
      "status": "past_due",
      "start_date": "2026-01-15T10:00:00+00:00",
      "end_date": "2026-08-15T10:00:00+00:00",
      "payment_frequency": "monthly",
      "auto_renew_count": 4,
      "attempt_number": 2,
      "max_attempts": 4,
      "next_retry_date": "2026-07-16T10:00:00+00:00",
      "failure_reason": "card_declined",
      "first_failed_at": "2026-07-13T10:00:00+00:00"
    },
    "api_metadata": { "data": { "plan": "monthly" } },
    "customFields": [],
    "event_type": "subscription.past_due"
  },
  "created_at": "2026-07-13T10:00:05+00:00"
}
```

#### Retry Fields

| Field | Type | Notes |
| --- | --- | --- |
| `subscription.status` | string | Optional |
| `subscription.attempt_number` | integer | Optional |
| `subscription.max_attempts` | integer | Optional |
| `subscription.next_retry_date` | string\|null (ISO 8601) | Optional |
| `subscription.failure_reason` | string | Optional |
| `subscription.first_failed_at` | string (ISO 8601) | Optional |

subscription.recovered

subscription.recovered

Fires when a past-due subscription is successfully charged

A subscription that was `past_due` has been successfully charged and is active again — either an automatic retry succeeded or the customer updated their payment method. Restore access immediately when you receive this event.

Example Payload

```json
{
  "id": "8a4f1d6c-2e9b-4a5d-b7f3-1c8e5a2d9f61",
  "type": "subscription.recovered",
  "data": {
    "buyer": {
      "id": "user_4Kd9mQ2xZ7Lp",
      "name": "Alex Johnson",
      "email": "alex@example.com"
    },
    "item": {
      "id": "NLxj6",
      "title": "Pro Membership",
      "type": "subscription"
    },
    "subscription": {
      "id": "qYyEp",
      "status": "active",
      "recovered_at": "2026-07-19T10:00:00+00:00",
      "recovered_amount": 29.00,
      "recovery_source": "autorenew",
      "days_in_past_due": 6,
      "total_retry_attempts": 2
    },
    "api_metadata": { "data": { "plan": "monthly" } },
    "customFields": [],
    "event_type": "subscription.recovered"
  },
  "created_at": "2026-07-19T10:00:00+00:00"
}
```

#### Recovery Fields

| Field | Type | Notes |
| --- | --- | --- |
| `subscription.status` | string | Optional |
| `subscription.recovered_at` | string (ISO 8601) | Optional |
| `subscription.recovered_amount` | number | Optional |
| `subscription.recovery_source` | string | Optional |
| `subscription.days_in_past_due` | integer | Optional |
| `subscription.total_retry_attempts` | integer | Optional |

DISPUTE EVENTS

## Dispute Events `dispute.created``dispute.updated`

Like all events, dispute events use the **envelope format** — the actual data lives inside a `data` object, with top-level `id`, `type`, and `created_at`. Disputes are chargebacks filed by a customer's bank and must be responded to within the deadline shown in `due_by`.

dispute.created

dispute.created

Fires the moment a chargeback is filed

A customer's bank has initiated a chargeback against one of your payments. This is time-sensitive — you typically have a narrow response window (see `data.due_by`) to submit evidence. Act on this event immediately by alerting your team and gathering evidence of the original transaction.

⚠ Respond before the deadline

Check `data.due_by` immediately. If you miss the response deadline, the dispute is automatically decided in the customer's favor. Submit your evidence through the Commas dashboard before the `due_by` date.

Example Payload (Envelope Format)

```json
{
  "id": "fe3505d5-1b32-4c04-95bf-5d5f60957b7f",
  "type": "dispute.created",
  "data": {
    "id": "gT5mN",
    "dispute_id": "dp_1Q2w3E4r5T",
    "amount": 75.50,
    "dispute_fee": 15.00,
    "total_amount": 90.50,
    "status": "needs_response",
    "reason": "fraudulent",
    "payment_intent_id": "pi_3Nc8QJ2eZvKYlo2C0xYzAbCd",
    "due_by": "2025-02-08T23:59:59Z",
    "created_at": "2025-02-01T12:00:00Z",
    "updated_at": "2025-02-01T12:00:00Z",
    "organization_id": "org_7Hj2kL9mP4Qr",
    "buyer": {
      "id": "user_9Qp3nR7yT2Wk",
      "name": "John Doe",
      "email": "buyer@example.com"
    },
    "item": {
      "id": "kQ7wR",
      "title": "Pro Membership",
      "type": "onetime"
    },
    "event_type": "dispute.created"
  },
  "created_at": "2025-02-01T12:00:00Z"
}
```

#### Field Reference

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string (UUID) | Optional |
| `type` | string | Optional |
| `created_at` | string (ISO 8601) | Optional |
| `data.id` | string | Optional |
| `data.dispute_id` | string | Optional |
| `data.amount` | number | Optional |
| `data.dispute_fee` | number | Optional |
| `data.total_amount` | number | Optional |
| `data.status` | string | Optional |
| `data.reason` | string | Optional |
| `data.payment_intent_id` | string | Optional |
| `data.due_by` | string (ISO 8601) | Optional |
| `data.organization_id` | string | Optional |
| `data.buyer` | object | Optional |
| `data.item` | object | Optional |
| `data.customFields` | array | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event identifier (UUID)" },
    "type": { "type": "string", "description": "Always 'dispute.created'" },
    "data": {
      "type": "object",
      "required": ["id", "dispute_id", "amount", "status", "reason", "payment_intent_id", "due_by"],
      "properties": {
        "id": { "type": "string", "description": "The dispute's public ID (hashid)" },
        "dispute_id": { "type": "string", "description": "The processor-level dispute identifier" },
        "amount": { "type": "number", "description": "The disputed amount" },
        "dispute_fee": { "type": "number", "description": "Fee charged for the dispute" },
        "total_amount": { "type": "number", "description": "Amount + dispute fee" },
        "status": { "type": "string", "description": "e.g., needs_response" },
        "reason": { "type": "string", "description": "e.g., fraudulent" },
        "payment_intent_id": { "type": "string" },
        "due_by": { "type": "string", "format": "date-time", "description": "Deadline to respond" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" },
        "organization_id": { "type": "string", "description": "Your organization's public ID (org_ prefix)" },
        "buyer": { "type": "object", "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" } } },
        "item": { "type": "object", "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "type": { "type": "string" } } },
        "customFields": { "type": "array" },
        "event_type": { "type": "string" }
      }
    },
    "created_at": { "type": "string", "format": "date-time" }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "fe3505d5-1b32-4c04-95bf-5d5f60957b7f",
  "type": "dispute.created",
  "data": {
    "id": "gT5mN",
    "dispute_id": "dp_1Q2w3E4r5T",
    "amount": 75.50,
    "dispute_fee": 15.00,
    "total_amount": 90.50,
    "status": "needs_response",
    "reason": "fraudulent",
    "payment_intent_id": "pi_3Nc8QJ2eZvKYlo2C0xYzAbCd",
    "due_by": "2026-03-01T23: 59: 59Z",
    "created_at": "2026-02-17T15: 32: 10Z",
    "updated_at": "2026-02-17T15: 32: 10Z",
    "organization_id": "org_7Hj2kL9mP4Qr",
    "buyer": {
      "id": "user_9Qp3nR7yT2Wk",
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    },
    "item": {
      "id": "kQ7wR",
      "title": "Premium Coaching Call",
      "type": "onetime"
    },
    "event_type": "dispute.created"
  },
  "created_at": "2026-02-25T10: 04: 33Z"
}⎘ Copy
```

dispute.updated

dispute.updated

Fires when a dispute status changes

A dispute has had a status change. The most common transition is `needs_response` → `under_review` after you submit evidence, then eventually `won` or `lost`. The payload shape is identical to `dispute.created` — check `data.status` to see what changed. If `won`, the disputed funds and chargeback fee will be returned to you.

Example Payload (dispute resolved as won)

```json
{
  "id": "fe3505d5-1b32-4c04-95bf-5d5f60957b7f",
  "type": "dispute.updated",
  "data": {
    "id": "gT5mN",
    "dispute_id": "dp_1Q2w3E4r5T",
    "amount": 75.50,
    "dispute_fee": 15.00,
    "total_amount": 90.50,
    "status": "won",
    "reason": "fraudulent",
    "payment_intent_id": "pi_3Nc8QJ2eZvKYlo2C0xYzAbCd",
    "due_by": "2025-02-08T23:59:59Z",
    "created_at": "2025-02-01T12:00:00Z",
    "updated_at": "2025-02-12T15:30:00Z",
    "organization_id": "org_7Hj2kL9mP4Qr",
    "buyer": {
      "id": "user_9Qp3nR7yT2Wk",
      "name": "John Doe",
      "email": "buyer@example.com"
    },
    "item": {
      "id": "kQ7wR",
      "title": "Pro Membership",
      "type": "onetime"
    },
    "event_type": "dispute.updated"
  },
  "created_at": "2025-02-12T15:30:00Z"
}
```

#### Dispute Status Values

| Status | Meaning |
| --- | --- |
| `needs_response` | Dispute just opened — submit evidence before `due_by`. |
| `under_review` | You submitted evidence and the bank is reviewing it. |
| `won` | Resolved in your favor — funds and fee returned to you. |
| `lost` | Resolved in the customer's favor — amount and fee deducted. |
| `warning_needs_response` | Early warning — respond quickly to prevent a full chargeback. |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event identifier (UUID)" },
    "type": { "type": "string", "description": "Always 'dispute.updated'" },
    "data": {
      "type": "object",
      "required": ["id", "dispute_id", "amount", "status", "reason", "payment_intent_id", "due_by"],
      "properties": {
        "id": { "type": "string", "description": "The dispute's public ID (hashid)" },
        "dispute_id": { "type": "string" },
        "amount": { "type": "number" },
        "dispute_fee": { "type": "number" },
        "total_amount": { "type": "number" },
        "status": { "type": "string", "description": "Updated status (e.g., won, lost)" },
        "reason": { "type": "string" },
        "payment_intent_id": { "type": "string" },
        "due_by": { "type": "string", "format": "date-time" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" },
        "organization_id": { "type": "string", "description": "Your organization's public ID (org_ prefix)" },
        "buyer": { "type": "object", "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" } } },
        "item": { "type": "object", "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "type": { "type": "string" } } },
        "customFields": { "type": "array" },
        "event_type": { "type": "string" }
      }
    },
    "created_at": { "type": "string", "format": "date-time" }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "fe3505d5-1b32-4c04-95bf-5d5f60957b7f",
  "type": "dispute.updated",
  "data": {
    "id": "gT5mN",
    "dispute_id": "dp_1Q2w3E4r5T",
    "amount": 75.50,
    "dispute_fee": 15.00,
    "total_amount": 90.50,
    "status": "won",
    "reason": "fraudulent",
    "payment_intent_id": "pi_3Nc8QJ2eZvKYlo2C0xYzAbCd",
    "due_by": "2026-03-01T23: 59: 59Z",
    "created_at": "2026-02-17T15: 32: 10Z",
    "updated_at": "2026-02-25T10: 04: 33Z",
    "organization_id": "org_7Hj2kL9mP4Qr",
    "buyer": {
      "id": "user_9Qp3nR7yT2Wk",
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    },
    "item": {
      "id": "kQ7wR",
      "title": "Premium Coaching Call",
      "type": "onetime"
    },
    "event_type": "dispute.updated"
  },
  "created_at": "2026-02-25T10: 04: 33Z"
}⎘ Copy
```

REFUND EVENTS

## Refund Events `refund.created`

Refund events also use the envelope format. They include a nested `processor` object with processor-level identifiers for accounting reconciliation.

refund.created

refund.created

Fires when a refund is successfully issued

A refund has been issued to a customer — whether triggered by you via API, through the dashboard, or automatically. The nested `processor` object contains processor-level IDs for cross-referencing with your payment records and for accurate accounting. It is only present when a processor-level refund ID exists.

ℹ Non-refundable processing fee

`data.processor.processor_refund_cost_fee` is the payment processing fee that is forfeited when a refund is issued. Track this for accurate P&L accounting — your payout will be reduced by both the refunded amount and any non-refundable fees.

Example Payload (Envelope Format)

```json
{
  "id": "fe3505d5-1b32-4c04-95bf-5d5f60957b7f",
  "type": "refund.created",
  "data": {
    "arn": null,
    "refund_id": "d8Kw2",
    "refund_transaction_id": "pX9vQ",
    "refund_cost": 26.05,
    "refund_cost_creator_amount": 25.00,
    "refund_cost_affiliate_commission": null,
    "amount": 25.00,
    "status": "success",
    "created_at": "2025-02-05T09:00:00-06:00",
    "updated_at": "2025-02-05T09:00:00-06:00",
    "refund_type": "partial",
    "reason": "requested_by_customer",
    "buyer": {
      "id": "user_9Qp3nR7yT2Wk",
      "name": "John Doe",
      "email": "buyer@example.com"
    },
    "item": {
      "id": "kQ7wR",
      "title": "Pro Membership",
      "type": "onetime"
    },
    "customFields": [
      { "label": "Order note", "type": "text", "value": "…" }
    ],
    "processor": {
      "processor_refund_id": "re_3Px7LkLkHcJBAbcd",
      "processor_charge_id": "pi_3Px7LkLkHcJBAbcd",
      "processor_refund_cost_fee": 1.05
    },
    "event_type": "refund.created"
  },
  "created_at": "2025-02-05T09:00:00.000Z"
}
```

#### Field Reference

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string (UUID) | Optional |
| `type` | string | Optional |
| `created_at` | string (ISO 8601) | Optional |
| `data.refund_id` | string | Optional |
| `data.refund_transaction_id` | string | Optional |
| `data.refund_cost` | number | Optional |
| `data.refund_cost_creator_amount` | number | Optional |
| `data.amount` | number | Optional |
| `data.status` | string | Optional |
| `data.refund_type` | string | Optional |
| `data.reason` | string | Optional |
| `data.arn` | string\|null | Optional |
| `data.processor.processor_refund_id` | string | Optional |
| `data.processor.processor_charge_id` | string | Optional |
| `data.processor.processor_refund_cost_fee` | number | Optional |
| `data.buyer` | object | Optional |
| `data.item` | object | Optional |
| `data.customFields` | array | Optional |

#### Schema

JSON Schema

```json
{
  "type": "object",
  "required": ["id", "type", "data", "created_at"],
  "properties": {
    "id": { "type": "string", "description": "Unique event identifier (UUID)" },
    "type": { "type": "string", "description": "Always 'refund.created'" },
    "data": {
      "type": "object",
      "required": ["refund_id", "amount", "status", "reason", "buyer", "item"],
      "properties": {
        "arn": { "type": ["string", "null"] },
        "refund_id": { "type": "string", "description": "The refund's public ID (hashid)" },
        "refund_transaction_id": { "type": "string", "description": "Public ID (hashid) of the refunded transaction" },
        "refund_cost": { "type": "number", "description": "Total refund cost including fees" },
        "refund_cost_creator_amount": { "type": "number", "description": "Amount deducted from creator" },
        "refund_cost_affiliate_commission": { "type": ["number", "null"] },
        "amount": { "type": "number", "description": "The refunded amount" },
        "status": { "type": "string", "description": "e.g., success, pending" },
        "created_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" },
        "refund_type": { "type": "string", "description": "full or partial" },
        "reason": { "type": "string", "description": "e.g., requested_by_customer" },
        "buyer": { "type": "object", "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" } } },
        "item": { "type": "object", "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "type": { "type": "string" } } },
        "customFields": { "type": "array" },
        "processor": {
          "type": "object",
          "description": "Present only when a processor-level refund ID exists",
          "properties": {
            "processor_refund_id": { "type": "string" },
            "processor_charge_id": { "type": "string" },
            "processor_refund_cost_fee": { "type": "number" }
          }
        },
        "event_type": { "type": "string" }
      }
    },
    "created_at": { "type": "string", "format": "date-time" }
  }
}⎘ Copy
```

#### Example Payload

Example JSON

```json
{
  "id": "fe3505d5-1b32-4c04-95bf-5d5f60957b7f",
  "type": "refund.created",
  "data": {
    "arn": null,
    "refund_id": "d8Kw2",
    "refund_transaction_id": "pX9vQ",
    "refund_cost": 26.05,
    "refund_cost_creator_amount": 25,
    "refund_cost_affiliate_commission": null,
    "amount": 25,
    "status": "success",
    "created_at": "2026-02-17T15: 41: 55-06: 00",
    "updated_at": "2026-02-17T15: 41: 55-06: 00",
    "refund_type": "partial",
    "reason": "requested_by_customer",
    "buyer": {
      "id": "user_9Qp3nR7yT2Wk",
      "name": "John Smith",
      "email": "john@example.com"
    },
    "item": {
      "id": "kQ7wR",
      "title": "Premium Course Bundle",
      "type": "onetime"
    },
    "processor": {
      "processor_refund_id": "re_3Sn3p5I79SORlUQS1Exkfaov",
      "processor_charge_id": "pi_3Sn3p5I79SORlUQS1okl6q3D",
      "processor_refund_cost_fee": 1.05
    },
    "event_type": "refund.created"
  },
  "created_at": "2026-02-17T15: 41: 58-06: 00"
}⎘ Copy
```
