---
title: "Checkout Sessions"
source: "https://commasdocs.com/api/checkout-sessions"
seccion: "Recursos"
ancla: "#checkout-sessions"
capturado: "2026-08-30"
---

# Checkout Sessions

A checkout session is how you create a payment page. Think of it as a product listing that Commas hosts for you — you define the name, price, and type, and Commas gives you a link customers can use to pay. One checkout session can be shared with unlimited customers and generates a new transaction each time someone pays.

### How the checkout flow works

1

**You create a checkout session**

Call `POST /checkout-sessions` with your product details. You receive a `checkout_session_id` and a `payment_link`.

2

**Your customer visits the payment link**

Share the link however you like — email, social, your website. Commas shows them a secure checkout page.

3

**The customer enters their card and pays**

Commas handles everything: card validation, processing, receipts. You don't touch payment data.

4

**You get a webhook notification**

As soon as payment succeeds, Commas fires a `payment.succeeded` event to your webhook URL (if configured). A transaction record is also created.

Create Checkout Session

## Create a Checkout Session

```http
POST /public-api/checkout-sessions
```

This is the most important endpoint — you'll call it every time you want to offer a product for purchase. The payment link you get back is ready to use immediately.

✦ When would I use this?

You're launching a new coaching package priced at $199 one-time. You call this endpoint, get a payment link, and paste it into your newsletter. Anyone who clicks and pays gets a transaction recorded automatically.

ℹ What's actually required

Only three fields are required: `product.title`, `amount_cents`, and `type` — plus `subscription.frequency_days` when `type` is `subscription`. Everything else is optional.

### Body Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `product.title` | string | Required | Product name shown at checkout. Max 255 characters. |
| `product.description` | string | Optional | Short description shown under the product name. |
| `amount_cents` | integer | Required | Price in cents (e.g., `2999` = $29.99). **Minimum 100** ($1.00) — anything lower returns `400 Validation failed`. |
| `type` | string | Required | One of: `subscription`, `onetime_reusable`, `onetime_non_reusable`. See the type guide below. |
| `application_fee` | number | Optional | Optional platform/affiliate fee. |
| `metadata` | object | Optional | Arbitrary key/value pairs persisted on the session and echoed in webhooks. **Values must be strings** — numbers, booleans, and nested objects are rejected. The one exception is the reserved key `allowed_payment_methods`, which takes an array. |
| `expiration_date` | string (date) | Optional | ISO date (`YYYY-MM-DD`) when this checkout session stops accepting payments. |
| `success_url` | uri | Optional | Where to redirect the buyer after successful payment. |
| `webhook_url` | uri | Optional | Override webhook URL for events from this session (otherwise uses your account-level webhook subscriptions). |
| `subscription.frequency_days` | integer | Optional | Billing cycle length in days (e.g., `30` for monthly, `365` for yearly). |
| `subscription.auto_expire_after_x_periods` | integer | Optional | Auto-cancel after N billing cycles. Omit for indefinite. |
| `subscription.free_trial_days` | integer | Optional | Free trial length before first charge. |
| `subscription.initial_fee` | number | Optional | One-time fee charged at sign-up in addition to the recurring price. **Minimum 1**, and it cannot be combined with `free_trial_days` — sending both, or sending `initial_fee: 0`, returns `400`. |
| `subscription.initial_fee_days` | integer | Optional | Days before the recurring billing kicks in after the initial fee. |

### Choosing a `type`

| Type | Use when | Behavior |
| --- | --- | --- |
| `subscription` | Recurring product (membership, SaaS, content access) | Charges `amount_cents` every `frequency_days`. Buyer can be renewed automatically until canceled. |
| `onetime_reusable` | Single-purchase product where you want one shareable link that many buyers can use (digital download, course, ebook) | Single charge of `amount_cents`. The same payment link works for unlimited buyers — share publicly. |
| `onetime_non_reusable` | Single-buyer transaction (consultation booking, custom invoice, one-off service) | Single charge of `amount_cents`. The link is consumed after the first successful payment and won't accept further buyers. |

### Example 1 — Subscription

Recurring monthly membership with a 7-day free trial.

Request Body · subscription

```json
{
  "product": {
    "title": "Pro Monthly Membership",
    "description": "Full access including private Discord + weekly calls"
  },
  "amount_cents": 2999,
  "type": "subscription",
  "subscription": {
    "frequency_days": 30,
    "free_trial_days": 7,
    "auto_expire_after_x_periods": null
  },
  "metadata": { "plan": "pro_monthly" },
  "success_url": "https://yoursite.com/welcome"
}
```

```shell
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "Pro Monthly Membership",
      "description": "Full access including private Discord + weekly calls"
    },
    "amount_cents": 2999,
    "type": "subscription",
    "subscription": { "frequency_days": 30, "free_trial_days": 7 },
    "success_url": "https://yoursite.com/welcome",
    "metadata": { "plan": "pro_monthly" }
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "product": {
        "title": "Pro Monthly Membership",
        "description": "Full access including private Discord + weekly calls"
    },
    "amount_cents": 2999,
    "type": "subscription",
    "subscription": {
        "frequency_days": 30,
        "free_trial_days": 7
    },
    "success_url": "https://yoursite.com/welcome",
    "metadata": {
        "plan": "pro_monthly"
    }
}

response = requests.post(
    "https://www.fanbasis.com/public-api/checkout-sessions",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "product": {
      "title": "Pro Monthly Membership",
      "description": "Full access including private Discord + weekly calls"
    },
    "amount_cents": 2999,
    "type": "subscription",
    "subscription": {
      "frequency_days": 30,
      "free_trial_days": 7
    },
    "success_url": "https://yoursite.com/welcome",
    "metadata": {
      "plan": "pro_monthly"
    }
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "product": {
      "title": "Pro Monthly Membership",
      "description": "Full access including private Discord + weekly calls"
    },
    "amount_cents": 2999,
    "type": "subscription",
    "subscription": { "frequency_days": 30, "free_trial_days": 7 },
    "success_url": "https://yoursite.com/welcome",
    "metadata": { "plan": "pro_monthly" }
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/checkout-sessions

API Key

Request Body

Request

```bash
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "Pro Monthly Membership",
      "description": "Full access including private Discord + weekly calls"
    },
    "amount_cents": 2999,
    "type": "subscription",
    "subscription": { "frequency_days": 30, "free_trial_days": 7 },
    "success_url": "https://yoursite.com/welcome",
    "metadata": { "plan": "pro_monthly" }
  }'⎘ Copy
```

### Example 2 — One-time payment (reusable link)

A single $199 coaching package — one link, unlimited buyers.

Request Body · onetime_reusable

```json
{
  "product": {
    "title": "1-Hour Strategy Session",
    "description": "60-minute call to map out your launch plan"
  },
  "amount_cents": 19900,
  "type": "onetime_reusable",
  "metadata": { "campaign": "launch-week-2026" },
  "success_url": "https://yoursite.com/booking-confirmed"
}
```

```shell
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "1-Hour Strategy Session",
      "description": "60-minute call to map out your launch plan"
    },
    "amount_cents": 19900,
    "type": "onetime_reusable",
    "success_url": "https://yoursite.com/booking-confirmed",
    "metadata": { "campaign": "launch-week-2026" }
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "product": {
        "title": "1-Hour Strategy Session",
        "description": "60-minute call to map out your launch plan"
    },
    "amount_cents": 19900,
    "type": "onetime_reusable",
    "success_url": "https://yoursite.com/booking-confirmed",
    "metadata": {
        "campaign": "launch-week-2026"
    }
}

response = requests.post(
    "https://www.fanbasis.com/public-api/checkout-sessions",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "product": {
      "title": "1-Hour Strategy Session",
      "description": "60-minute call to map out your launch plan"
    },
    "amount_cents": 19900,
    "type": "onetime_reusable",
    "success_url": "https://yoursite.com/booking-confirmed",
    "metadata": {
      "campaign": "launch-week-2026"
    }
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "product": {
      "title": "1-Hour Strategy Session",
      "description": "60-minute call to map out your launch plan"
    },
    "amount_cents": 19900,
    "type": "onetime_reusable",
    "success_url": "https://yoursite.com/booking-confirmed",
    "metadata": { "campaign": "launch-week-2026" }
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/checkout-sessions

API Key

Request Body

Request

```bash
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "1-Hour Strategy Session",
      "description": "60-minute call to map out your launch plan"
    },
    "amount_cents": 19900,
    "type": "onetime_reusable",
    "success_url": "https://yoursite.com/booking-confirmed",
    "metadata": { "campaign": "launch-week-2026" }
  }'⎘ Copy
```

### Example 3 — One-time payment (single-buyer link)

A custom invoice for a specific client — link expires after the first successful payment.

Request Body · onetime_non_reusable

```json
{
  "product": {
    "title": "Custom Logo Design — Acme Corp",
    "description": "Full brand identity package"
  },
  "amount_cents": 250000,
  "type": "onetime_non_reusable",
  "expiration_date": "2026-06-30",
  "metadata": { "client_id": "acme-corp", "invoice": "INV-2026-0042" },
  "success_url": "https://yoursite.com/clients/thank-you"
}
```

```shell
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "Custom Logo Design — Acme Corp",
      "description": "Full brand identity package"
    },
    "amount_cents": 250000,
    "type": "onetime_non_reusable",
    "expiration_date": "2026-06-30",
    "metadata": { "client_id": "acme-corp", "invoice": "INV-2026-0042" }
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "product": {
        "title": "Custom Logo Design — Acme Corp",
        "description": "Full brand identity package"
    },
    "amount_cents": 250000,
    "type": "onetime_non_reusable",
    "expiration_date": "2026-06-30",
    "metadata": {
        "client_id": "acme-corp",
        "invoice": "INV-2026-0042"
    }
}

response = requests.post(
    "https://www.fanbasis.com/public-api/checkout-sessions",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "product": {
      "title": "Custom Logo Design — Acme Corp",
      "description": "Full brand identity package"
    },
    "amount_cents": 250000,
    "type": "onetime_non_reusable",
    "expiration_date": "2026-06-30",
    "metadata": {
      "client_id": "acme-corp",
      "invoice": "INV-2026-0042"
    }
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "product": {
      "title": "Custom Logo Design — Acme Corp",
      "description": "Full brand identity package"
    },
    "amount_cents": 250000,
    "type": "onetime_non_reusable",
    "expiration_date": "2026-06-30",
    "metadata": { "client_id": "acme-corp", "invoice": "INV-2026-0042" }
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/checkout-sessions

API Key

Request Body

Request

```bash
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product": {
      "title": "Custom Logo Design — Acme Corp",
      "description": "Full brand identity package"
    },
    "amount_cents": 250000,
    "type": "onetime_non_reusable",
    "expiration_date": "2026-06-30",
    "metadata": { "client_id": "acme-corp", "invoice": "INV-2026-0042" }
  }'⎘ Copy
```

### Response

Same response shape regardless of `type`:

Response

```json
{
  "status": "success",
  "message": "Created Product",
  "data": {
    "id": "NLxj6",
    "checkout_session_id": 345424,
    "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/NLxj6"
  },
  "request_id": "Root=1-xxxxxxxx-xxxxxxxxxxxxxxxxxxxx"
}⎘ Copy
```

✓ What to do with the payment_link

Store the `checkout_session_id` (numeric) and `id` (short alphanumeric) in your own database so you can look up transactions and subscriptions later. The `payment_link` is what you share — embed it as a button, paste it in emails, or add it to your link-in-bio. The URL format includes your creator handle.

Get Checkout Session

## Look Up a Checkout Session

```http
GET /public-api/checkout-sessions/:checkoutSessionId
```

Retrieves all the details of a checkout session — the product info, pricing, subscription settings, and expiration date. Useful if you've lost track of a session's configuration.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `checkoutSessionId` | string | Required | The `checkout_session_id` returned when you created the session. |

```shell
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/NLxj6", {
  method: "GET",
  headers: {
    "x-api-key": "YOUR_API_KEY",
  },
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
  ],
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

GET

/public-api/checkout-sessions/NLxj6

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Checkout session retrieved successfully",
  "data": {
    "product": {
      "id": 45012,
      "title": "Pro Monthly Membership",
      "description": "Full access including private Discord + weekly calls"
    },
    "amount_cents": 2999,
    "type": "subscription",
    "metadata": { "discord_user_id": "123456789" },
    "expiration_date": "2026-08-01T00: 00: 00+00: 00",
    "subscription": {
      "frequency_days": 30,
      "auto_expire_after_x_periods": null,
      "free_trial_days": 7,
      "initial_fee": null,
      "initial_fee_days": null
    },
    "success_url": "https://yoursite.com/welcome",
    "webhook_url": "https://yoursite.com/hooks"
  },
  "request_id": "req_9f2c…"
}⎘ Copy
```

⚠ product.id is numeric here

Unlike the create response (which returns the product's hashid), this endpoint returns the product's **numeric database ID**. Don't use it interchangeably with hashids from other endpoints. `type` is one of `subscription` or `onetime`; `subscription` is always present and holds `null` values for one-time products.

Delete Checkout Session

## Delete a Checkout Session

```http
DELETE /public-api/checkout-sessions/:checkoutSessionId
```

Permanently deletes a checkout session and deactivates its payment link. Anyone who visits the link afterwards will see a "not found" error.

⚠ This cannot be undone

Existing transactions and subscriptions created through this session are not affected — only the ability to make new purchases is removed.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `checkoutSessionId` | string | Required | The ID of the checkout session to delete. |

```shell
curl -X DELETE "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.delete(
    "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/NLxj6", {
  method: "DELETE",
  headers: {
    "x-api-key": "YOUR_API_KEY",
  },
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "DELETE",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
  ],
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

DELETE

/public-api/checkout-sessions/NLxj6

API Key

Request

```bash
curl -X DELETE "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{ "status": "success", "message": "Checkout session deleted successfully", "data": [] }⎘ Copy
```

Get Transactions for a Checkout Session

## Get Transactions for a Checkout Session

```http
GET /public-api/checkout-sessions/:checkoutSessionId/transactions
```

Returns all transactions associated with a specific checkout session. Useful when a single session has produced multiple payments (e.g. subscription renewals tied to the same session).

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `checkoutSessionId` | string | Required | The checkout session ID. |

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | integer | Optional | Which page of results to show. Starts at 1. |
| `per_page` | integer | Optional | How many results per page (max 100). |

```shell
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/transactions?page=1&per_page=20" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/transactions?page=1&per_page=20",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/transactions?page=1&per_page=20", {
  method: "GET",
  headers: {
    "x-api-key": "YOUR_API_KEY",
  },
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/transactions?page=1&per_page=20",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
  ],
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

GET

/public-api/checkout-sessions/NLxj6/transactions?page=1&per_page=20

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/transactions?page=1&per_page=20" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": 919049,
        "fan": { "name": "Jane Doe", "email": "jane@example.com" },
        "service": { "title": "Pro Monthly Membership", "price": 29.99 },
        "fee_amount": 1.20,
        "net_amount": 28.79
      }
    ],
    "pagination": { "current_page": 1, "total_pages": 3, "total_items": 48, "has_more": true }
  }
}⎘ Copy
```

Embedded Checkout

## Create an Embedded Checkout Session

```http
POST /public-api/checkout-sessions/embedded
```

Creates a checkout session designed to be embedded directly inside your app or website, rather than redirecting to a separate page. Returns a `checkout_session_secret` you use to construct the embedded checkout URL.

✓ Reusable session secret

The `checkout_session_secret` is scoped to your creator account. You can reuse the same secret and swap the `product_id` in the URL — you don't need to create a new embedded session for every product.

### Body Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `creator_id` | string | Optional | Accepted for backwards compatibility but not validated or used — the session is scoped by your API key. |
| `product_id` | string | Optional | Accepted for backwards compatibility but not validated or used. The returned secret is reusable across all your products. |
| `metadata` | object | Optional | Arbitrary JSON object stored on the session and echoed back in webhook events for the resulting transaction. Reserved key: `allowed_payment_methods`. If `metadata` is omitted, the checkout falls back to the creator's account-level payment method settings. |
| `metadata.allowed_payment_methods` | array of strings | Optional | Per-session allow-list of payment methods. When provided, only these methods will be offered at checkout (intersected with the creator's account-level settings, product-level disabled methods, amount limits, service-type rules, and global disables — it can only narrow, never re-enable). Must contain at least 1 entry. See [Accepted payment methods](#accepted-payment-methods). |

Request Body

```json
{
  "creator_id": "your-creator-slug",
  "product_id": "NLxj6",
  "metadata": {
    "campaign_id": "summer-2026",
    "allowed_payment_methods": ["card", "cashapp"]
  }
}
```

```shell
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions/embedded \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "creator_id": "your-creator-slug",
    "product_id": "NLxj6",
    "metadata": {
      "campaign_id": "summer-2026",
      "allowed_payment_methods": ["card", "cashapp"]
    }
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "creator_id": "your-creator-slug",
    "product_id": "NLxj6",
    "metadata": {
        "campaign_id": "summer-2026",
        "allowed_payment_methods": [
            "card",
            "cashapp"
        ]
    }
}

response = requests.post(
    "https://www.fanbasis.com/public-api/checkout-sessions/embedded",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/embedded", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "creator_id": "your-creator-slug",
    "product_id": "NLxj6",
    "metadata": {
      "campaign_id": "summer-2026",
      "allowed_payment_methods": [
        "card",
        "cashapp"
      ]
    }
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/embedded",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "creator_id": "your-creator-slug",
    "product_id": "NLxj6",
    "metadata": {
      "campaign_id": "summer-2026",
      "allowed_payment_methods": ["card", "cashapp"]
    }
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/checkout-sessions/embedded

API Key

Request Body

Request

```bash
curl -X POST https://www.fanbasis.com/public-api/checkout-sessions/embedded \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "creator_id": "your-creator-slug",
    "product_id": "NLxj6",
    "metadata": {
      "campaign_id": "summer-2026",
      "allowed_payment_methods": ["card", "cashapp"]
    }
  }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Embedded checkout session created successfully",
  "data": {
    "id": 3204,
    "checkout_session_secret": "550e8400-e29b-41d4-a716-446655440000",
    "metadata": {
      "campaign_id": "summer-2026",
      "allowed_payment_methods": ["card", "cashapp"]
    },
    "created_at": "2026-04-30T22: 34: 36.000000Z"
  }
}⎘ Copy
```

ℹ Embedded checkout URL format

Construct the embeddable URL using your creator handle, the product `id`, and the `checkout_session_secret`:

```
https://embedded.fanbasis.io/session/{your-handle}/{product-id}/{checkout_session_secret}⎘ Copy
```

Load this URL inside an `<iframe>` or open it as a popup to display the embedded payment form.

Update Embedded Checkout

## Update an Embedded Checkout Session

```http
PATCH /public-api/checkout-sessions/embedded/:checkoutSessionId
```

Updates an existing embedded checkout session's metadata or changes the allowed payment methods after creation. Performs a **shallow merge** into the existing metadata — only the keys you supply are updated, others are preserved.

ℹ Notes

- Lookup is scoped to the authenticated creator. A key from creator A cannot modify creator B's sessions.
- Sending `metadata: null` or an empty object is a no-op — the endpoint never clears existing metadata.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `checkoutSessionId` | string | Required | The `checkout_session_secret` of the session to update. |

### Request Parameters

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `metadata` | object | Optional | Object shallow-merged into existing session metadata. Unsupplied keys are preserved. |
| `metadata.allowed_payment_methods` | array of strings | Optional | Replaces the previous list under `metadata.allowed_payment_methods`. Must contain at least 1 entry if provided. See [Accepted payment methods](#accepted-payment-methods). |

Request Body

```json
{
  "metadata": {
    "allowed_payment_methods": ["card", "klarna"]
  }
}
```

```shell
curl -X PATCH "https://www.fanbasis.com/public-api/checkout-sessions/embedded/550e8400-e29b-41d4-a716-446655440000" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "allowed_payment_methods": ["card", "klarna"]
    }
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "metadata": {
        "allowed_payment_methods": [
            "card",
            "klarna"
        ]
    }
}

response = requests.patch(
    "https://www.fanbasis.com/public-api/checkout-sessions/embedded/550e8400-e29b-41d4-a716-446655440000",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/embedded/550e8400-e29b-41d4-a716-446655440000", {
  method: "PATCH",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "metadata": {
      "allowed_payment_methods": [
        "card",
        "klarna"
      ]
    }
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/embedded/550e8400-e29b-41d4-a716-446655440000",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "PATCH",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "metadata": {
      "allowed_payment_methods": ["card", "klarna"]
    }
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

PATCH

/public-api/checkout-sessions/embedded/550e8400-e29b-41d4-a716-446655440000

API Key

Request Body

Request

```bash
curl -X PATCH "https://www.fanbasis.com/public-api/checkout-sessions/embedded/550e8400-e29b-41d4-a716-446655440000" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {
      "allowed_payment_methods": ["card", "klarna"]
    }
  }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Embedded checkout session updated successfully",
  "data": {
    "id": 3204,
    "checkout_session_secret": "550e8400-e29b-41d4-a716-446655440000",
    "metadata": {
      "campaign_id": "summer-2026",
      "allowed_payment_methods": ["card", "klarna"]
    },
    "updated_at": "2026-04-30T22: 39: 42.000000Z"
  }
}⎘ Copy
```

Accepted Payment Methods Reference

### Accepted Payment Methods

The following strings are accepted in `allowed_payment_methods`:

`card`

`cashapp`

`affirm`

`klarna`

`afterpay_clearpay`

`apple_pay`

`google_pay`

`link`

`zip`

`sezzle`

`crypto`

`us_bank_account`

`payva`

`climb`

`paypal`

`paypal_later`

`creditkey`

`amazon_pay`

`claritypay`

ℹ Validation applies to the array form

When `allowed_payment_methods` is sent as an **array** (embedded session creation and metadata updates), an entry outside the list above returns `400 Validation failed`. Hosted checkout-session creation additionally accepts a **comma-separated string**, and entries in that form are _not_ validated — unknown values are silently dropped during filtering instead of rejected.

### How `allowed_payment_methods` is enforced

The session list is **intersected** with the creator's enabled methods and the product's configuration — in practice it narrows what the buyer sees rather than expanding it. This enforcement applies to both embedded and non-embedded (hosted) checkout.

The following filters always apply on top of the session list:

| Filter | Applied? |
| --- | --- |
| Global platform kill switch | ✅ Always |
| Creator's account-level enabled methods | ✅ Always (intersection) |
| Service-type restrictions (e.g. subscriptions remove BNPL) | ✅ Always |
| Per-method amount limits (Affirm, Klarna, Afterpay, Zip, Sezzle, Crypto, Payva, ClarityPay, Climb, CreditKey min/max, plus PayPal Pay Later's country-based limits) | ✅ Always |
| Product-level disabled methods | ✅ Always — the session allow-list narrows further, it does not re-enable a method the product has disabled |

⚠ Known exception to "narrow only"

On the legacy hosted **Spreedly** rail, Apple Pay and Google Pay can still appear even when your session list excludes them — those wallets are injected by the hosted payment form itself rather than by the method filter.

✓ Empty-list fallback

If filtering leaves the list empty, the session falls back to `["card"]` in Commas mode, so checkout is never blank. On legacy FanBasis-mode deployments the fallback is `["card", "cashapp", "us_bank_account"]`.
