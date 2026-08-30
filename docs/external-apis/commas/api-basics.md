---
title: "API Basics"
source: "https://commasdocs.com/#api-basics"
seccion: "Conceptos de la API"
ancla: "#api-basics"
capturado: "2026-08-30"
---

# API Basics

How every Commas API call works: the concepts the endpoints build on, how requests authenticate, what your key's scopes allow, and the shape every response comes back in.

### Key Concepts

◆ Checkout Session

A checkout session is a payment page. You define what's being sold and at what price, and Commas generates a link you share with your customer. When they click it, they see a ready-to-use payment form. One session can produce many transactions over time.

◆ Webhook

A webhook is a message Commas sends to your server the moment something happens — like a payment succeeding or a subscription being canceled. Instead of polling the API constantly, your app just listens and reacts when events arrive.

◆ Transaction

A transaction is a single completed payment. Each time a customer pays — whether for a one-time purchase or a subscription renewal — a new transaction is created. Transactions include fee breakdowns and net payout amounts.

◆ Subscription

A subscription is a recurring payment plan tied to a product. Commas bills the customer automatically every `frequency_days` (e.g. 30 for monthly) and fires `subscription.renewed` on each successful charge. A subscriber keeps access until their subscription is canceled or completes its scheduled periods.

◆ Slug / ID

A "slug" is a short, URL-safe identifier Commas uses for records — for example your **creator slug** (your handle, like `boolerscom`) or a **product ID** (like `NLxj6`). You'll see these in URLs and request bodies. Note that some IDs are these short slugs (products, sessions) while others are plain integers (customer IDs, subscription IDs).

### Authentication

Every API request must include your API key in the `x-api-key` header. There are no usernames or passwords — just your key. Every endpoint is served under the `/public-api/` path on `https://www.fanbasis.com` (e.g. `https://www.fanbasis.com/public-api/products`). The one exception is the Subscription Proration API, which lives under `/api/seller/v1/` on the same `www` host — never the apex domain (`https://fanbasis.com`), which answers with a 301 redirect that drops `POST` bodies. See that section for details.

⚠ Keep your key private

Never share your API key in public code, GitHub repositories, or client-side JavaScript. If your key is compromised, regenerate it immediately from the **API Keys** section in your Commas dashboard.

```bash
curl https://www.fanbasis.com/public-api/products \
  -H "x-api-key: YOUR_API_KEY"
```

### API Key Scopes

Every API key carries a set of scopes. If a key is missing the scope a route requires, the request is rejected with `403` and a message naming the scope:

Error Payload — 403 Forbidden

```json
{
  "status": "error",
  "message": "API key does not have permission for this resource. Required scope(s): refunds"
}
```

| Scope | Routes it covers |
| --- | --- |
| `checkout-sessions` | `/public-api/checkout-sessions/*` (everything except the refund endpoint), `/public-api/products/*`, `/public-api/discount-codes/*` |
| `refunds` | `POST /public-api/checkout-sessions/transactions/:transactionId/refund` |
| `payments` | `/public-api/transactions/*` |
| `webhooks` | `/public-api/webhook-subscriptions/*` |
| `customers` | `/public-api/customers/*`, `/public-api/subscribers` |
| `subscriptions` | The [Subscription Proration](#proration) endpoints (`/api/seller/v1/subscriptions/*`) |

ℹ Default keys carry every scope

A key created with the default settings has all six scopes, so most integrations never see a `403`. Narrow the scopes when you want to hand out read-only or refund-only credentials.

### How Responses Work

Every response follows the same structure: a status of `"success"` or `"error"`, a human-readable `message`, a `data` object with the actual result, and usually a `request_id` (an opaque string — include it when contacting support so we can trace the exact request). `request_id` is not on _every_ response — the discount-code and embedded-checkout responses omit it — so treat it as optional. When something goes wrong, the `errors` field tells you exactly which fields need fixing.

✓ Successful response

```json
{ "status": "success",
  "message": "...",
  "data": { ... },
  "request_id": "..."
}⎘ Copy
```

✕ Error response

```json
{ "status": "error",
  "message": "...",
  "data": [],
  "errors": { "field": ["msg"] },
  "request_id": "..."
}⎘ Copy
```
