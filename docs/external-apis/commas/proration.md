---
title: "Subscription Proration"
source: "https://commasdocs.com/#proration"
seccion: "Recursos"
ancla: "#proration"
capturado: "2026-08-30"
---

# Subscription Proration

The Subscription Proration API lets sellers offer **tier upgrades** to existing subscribers, where the buyer pays only the prorated price difference for the remainder of their current cycle rather than the full price of the new tier.

Three endpoints drive the upgrade flow:

1. **[Get Available Upgrades](#proration-list)** — list all valid upgrade targets for a subscription, with proration math pre-calculated for each.

2. **[Preview Upgrade](#proration-preview)** — get the proration calculation for a single specific target tier before executing.

3. **[Process Upgrade](#proration-process)** — execute the upgrade, marking the original subscription as `upgraded` and creating a new `active` subscription on the target tier.

### Prerequisites

Before any of these endpoints will return upgrade options, subscription proration must be enabled for your **organization** in the admin panel:

- **Subscription proration:** enabled.
- **Proration billing mode:** `immediate` (charge prorated amount at upgrade time) or `next_cycle` (defer to next renewal).
- **API key scope:** your key needs the `subscriptions` scope. Without it every endpoint below returns `403` naming the missing scope, regardless of your proration settings. See [API Key Scopes](#api-key-scopes).

If proration is not enabled for the organization, **Get Available Upgrades** returns an empty `available_upgrades` array, and **Preview Upgrade** / **Process Upgrade** return a `400`. Proration is an **organization-level setting only** — there is no per-service proration flag (those columns were dropped), so you do not need to enable anything on the target tier. Note: proration is currently unavailable (force-disabled) for organizations processing on Adyen.

### Authentication

All proration endpoints authenticate via the seller API key, the same as the rest of the Public API.

| Header | Value |
| --- | --- |
| `x-api-key` | Seller API key. |
| `Content-Type` | `application/json` (POST requests only). |

### Base URL

| Environment | Base URL |
| --- | --- |
| Production | `https://www.fanbasis.com` |
| QA / Sandbox | `https://qa.dev-fan-basis.com` |

All proration endpoints are mounted under `/api/seller/v1/`.

⚠ Use the www host — the apex domain redirects

Call these Seller v1 endpoints on `https://www.fanbasis.com`, the same host as the rest of the Public API. The apex domain (`https://fanbasis.com`) answers with a **301 redirect**, and most HTTP clients drop the request body when following it — which silently breaks `POST /upgrade`. The QA/Sandbox host (`qa.dev-fan-basis.com`) is the same for both.

### Standard Upgrade Flow

1. Call **Get Available Upgrades** to display valid upgrade options to the buyer.

2. Buyer selects a target tier.

3. Call **Preview Upgrade** with the selected `target_service_id` to confirm the exact charge.

4. Display `amount_due` to the buyer for confirmation.

5. Call **Process Upgrade** to execute.

─── Get Available Upgrades ───

## Get Available Upgrades

```http
GET /api/seller/v1/subscriptions/:id/upgrades
```

Returns all upgrade options available to a given subscriber, with full proration math pre-calculated for each target tier.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer | Required | The subscriber ID (subscription record ID, not the buyer's user ID). |

```shell
curl -X GET "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrades" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrades",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrades", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrades",
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

/api/seller/v1/subscriptions/12345/upgrades

API Key

Request

```bash
curl -X GET "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrades" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "statuscode": 200,
  "message": "Available upgrades retrieved successfully",
  "data": {
    "subscription_id": 12345,
    "subscription_status": "active",
    "current_tier": {
      "id": 1001,
      "title": "Basic Plan",
      "price": 10,
      "payment_frequency": 30
    },
    "proration_credit": 0,
    "available_upgrades": [
      {
        "service": { "id": 1002, "title": "Pro Plan", "price": 25, "payment_frequency": 30 },
        "calculation": {
          "current_service": { "id": 1001, "title": "Basic Plan", "price": 10 },
          "target_service":  { "id": 1002, "title": "Pro Plan",  "price": 25 },
          "price_difference": 15,
          "days_remaining": 22,
          "total_cycle_days": 30,
          "proration_ratio": 0.7333,
          "upgrade_charge": 11,
          "renewal_credit": 7.33,
          "existing_credit": 0,
          "amount_due": 11,
          "completion_date": "2026-12-31 09: 53: 09"
        }
      },
      {
        "service": { "id": 1003, "title": "VIP Plan", "price": 50, "payment_frequency": 30 },
        "calculation": {
          "current_service": { "id": 1001, "title": "Basic Plan", "price": 10 },
          "target_service":  { "id": 1003, "title": "VIP Plan",   "price": 50 },
          "price_difference": 40,
          "days_remaining": 22,
          "total_cycle_days": 30,
          "proration_ratio": 0.7333,
          "upgrade_charge": 29.33,
          "renewal_credit": 7.33,
          "existing_credit": 0,
          "amount_due": 29.33,
          "completion_date": "2026-12-31 09: 53: 09"
        }
      }
    ]
  }
}⎘ Copy
```

### Response Fields — `data`

| Field | Type | Description |
| --- | --- | --- |
| `subscription_id` | integer | Optional |
| `subscription_status` | string | Optional |
| `current_tier` | object | Optional |
| `proration_credit` | number | Optional |
| `available_upgrades` | array | Optional |

### Service Object (`current_tier`, `service`)

| Field | Type | Description |
| --- | --- | --- |
| `id` | integer | Optional |
| `title` | string | Optional |
| `price` | number | Optional |
| `payment_frequency` | integer | Optional |

### Calculation Object

Proration math for upgrading from the current tier to a target tier. The same shape is returned by all three endpoints.

| Field | Type | Description |
| --- | --- | --- |
| `current_service` | object | Optional |
| `target_service` | object | Optional |
| `price_difference` | number | Optional |
| `days_remaining` | integer | Optional |
| `total_cycle_days` | integer | Optional |
| `proration_ratio` | number | Optional |
| `upgrade_charge` | number | Optional |
| `renewal_credit` | number | Optional |
| `existing_credit` | number | Optional |
| `amount_due` | number | Optional |
| `completion_date` | string | Optional |

ℹ Empty result cases

`available_upgrades` returns as an empty array (with `200 OK`) when:

- The current tier is already the highest available — no upgrade targets exist.
- The subscription's `subscription_status` is `upgraded` (already upgraded once).
- The subscription's `subscription_status` is anything other than `active` (`past_due`, `cancelled`, `paused`, etc.).
- Proration is not enabled for your organization.

✓ Notes

- Only tiers priced **higher** than the current tier are returned. Downgrades are never returned.
- `amount_due` is what gets charged when the upgrade is processed — display this value to the buyer before they confirm.
- All monetary values are in the seller's account currency.
- Only subscriptions with status `active` are upgradeable.

─── Preview Upgrade ───

## Preview Upgrade

```http
GET /api/seller/v1/subscriptions/:id/upgrade/preview
```

Returns the proration calculation for a single specific target service before executing the upgrade. Use this when the buyer has already selected a target tier and you want to confirm the exact charge before processing.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer | Required | The subscriber ID (subscription record ID, not the buyer's user ID). |

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `target_service_id` | integer | Required | The service ID the subscriber wants to upgrade to. |

```shell
curl -X GET "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade/preview?target_service_id=1003" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade/preview?target_service_id=1003",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade/preview?target_service_id=1003", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade/preview?target_service_id=1003",
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

/api/seller/v1/subscriptions/12345/upgrade/preview?target_service_id=1003

API Key

Request

```bash
curl -X GET "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade/preview?target_service_id=1003" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "statuscode": 200,
  "message": "Upgrade preview calculated",
  "data": {
    "current_service": { "id": 1001, "title": "Basic Plan", "price": 10 },
    "target_service":  { "id": 1003, "title": "VIP Plan",   "price": 50 },
    "price_difference": 40,
    "days_remaining": 22,
    "total_cycle_days": 30,
    "proration_ratio": 0.7333,
    "upgrade_charge": 29.33,
    "renewal_credit": 7.33,
    "existing_credit": 0,
    "amount_due": 29.33,
    "completion_date": "2026-12-31 09: 53: 09",
    "available_credit": 0
  }
}⎘ Copy
```

### Response Fields

The `data` object is the same as the [Calculation Object](#proration-calculation), plus one extra field:

| Field | Type | Description |
| --- | --- | --- |
| `available_credit` | number | Optional |

✓ Notes

- Read-only — this endpoint does not charge the buyer or modify the subscription. Use [Process Upgrade](#proration-process) to actually execute.
- `amount_due` is the value to display to the buyer before they confirm.

─── Process Upgrade ───

## Process Upgrade

```http
POST /api/seller/v1/subscriptions/:id/upgrade
```

Executes the subscription upgrade. Marks the original subscription as `upgraded` (stops auto-renewing), creates a new `active` subscription on the target tier, and either charges the buyer immediately or defers billing to the next renewal cycle.

⚠ Destructive operation

This endpoint creates a new subscription and modifies the existing one. Always call [Preview Upgrade](#proration-preview) first to confirm the calculation with the buyer.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer | Required | The subscriber ID (subscription record ID, not the buyer's user ID). |

### Body Parameters

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `target_service_id` | integer | Required | — | The service ID to upgrade to. |
| `billing_mode` | string | Optional | seller's configured mode | `immediate` (charge prorated amount now) or `next_cycle` (defer to next renewal). Defaults to the billing mode configured on your organization, not a fixed value. |
| `payment_method_id` | string | Optional | — | The buyer's stored payment method to charge. Required when `billing_mode` resolves to `immediate`; ignored for `next_cycle`. |

### Billing Modes

| Mode | Behavior |
| --- | --- |
| `immediate` | Buyer is charged the prorated `amount_due` at the time of the upgrade. Use when the buyer should get instant access and pay the difference now. |
| `next_cycle` | No immediate charge. Credit is stored against the new subscription and applied at the next renewal date. Use when deferring billing to the regular renewal. |

Request Body

```json
{
  "target_service_id": 1003,
  "billing_mode": "next_cycle"
}
```

```shell
curl -X POST "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "target_service_id": 1003,
    "billing_mode": "next_cycle"
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "target_service_id": 1003,
    "billing_mode": "next_cycle"
}

response = requests.post(
    "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "target_service_id": 1003,
    "billing_mode": "next_cycle"
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "target_service_id": 1003,
    "billing_mode": "next_cycle"
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/api/seller/v1/subscriptions/12345/upgrade

API Key

Request Body

Request

```bash
curl -X POST "https://www.fanbasis.com/api/seller/v1/subscriptions/12345/upgrade" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "target_service_id": 1003,
    "billing_mode": "next_cycle"
  }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "statuscode": 200,
  "message": "Upgrade processed successfully",
  "data": {
    "upgrade_id": "00000000-0000-0000-0000-000000000000",
    "base_subscription": {
      "subscription_id": 12345,
      "subscription_status": "upgraded",
      "current_tier": { "id": 1001, "title": "Basic Plan", "price": 10, "payment_frequency": 30 },
      "proration_credit": 0
    },
    "new_subscription": {
      "subscription_id": 12346,
      "subscription_status": "active",
      "current_tier": { "id": 1003, "title": "VIP Plan", "price": 50, "payment_frequency": 30 },
      "proration_credit": 0
    },
    "calculation": {
      "current_service": { "id": 1001, "title": "Basic Plan", "price": 10 },
      "target_service":  { "id": 1003, "title": "VIP Plan",   "price": 50 },
      "price_difference": 40,
      "days_remaining": 22,
      "total_cycle_days": 30,
      "proration_ratio": 0.7333,
      "upgrade_charge": 29.33,
      "renewal_credit": 7.33,
      "existing_credit": 0,
      "amount_due": 29.33,
      "completion_date": "2026-12-31 09: 53: 09"
    },
    "charge": {
      "payment_id": null,
      "amount_charged": 0,
      "payment_method_type": "none"
    }
  }
}⎘ Copy
```

### Response Fields — `data`

| Field | Type | Description |
| --- | --- | --- |
| `upgrade_id` | string (UUID) | Optional |
| `base_subscription` | object | Optional |
| `new_subscription` | object | Optional |
| `calculation` | object | Optional |
| `charge` | object | Optional |

### Subscription Object (`base_subscription`, `new_subscription`)

| Field | Type | Description |
| --- | --- | --- |
| `subscription_id` | integer | Optional |
| `subscription_status` | string | Optional |
| `current_tier` | object | Optional |
| `proration_credit` | number | Optional |

### Charge Object

| Field | Type | Description |
| --- | --- | --- |
| `payment_id` | string \\| null | Optional |
| `amount_charged` | number | Optional |
| `payment_method_type` | string | Optional |

### Behavior By Billing Mode

billing_mode: immediate

```
charge.payment_id     = new payment ID
charge.amount_charged = calculation.amount_due
charge.payment_method_type = "card" (or buyer's stored method)⎘ Copy
```

billing_mode: next_cycle

```
charge.payment_id     = null
charge.amount_charged = 0
charge.payment_method_type = "none"
// Prorated amount stored as credit, applied at next renewal⎘ Copy
```

### Subscription State After Upgrade

| Subscription | Status | Auto-Renew |
| --- | --- | --- |
| `base_subscription` (original) | upgraded | Optional |
| `new_subscription` (new) | active | Optional |

✓ Notes

- `upgrade_id` is the canonical reference for this event in audit logs and webhooks.
- The new subscription's billing cycle starts fresh on the upgrade date. The original `completion_date` only matters for the credit/charge calculation — the new subscription renews on its own schedule.
- A subscription can only be upgraded once. After upgrade, `base_subscription` is permanently marked `upgraded` and is no longer eligible for further upgrades. To upgrade again, call this endpoint on `new_subscription.subscription_id`.
- For `billing_mode: immediate`, the charge uses the buyer's stored payment method on the original subscription. If the card has expired or fails, the upgrade returns `422`.

─── Errors + Statuses ───

### Error Responses

| Status | When it fires |
| --- | --- |
| `400 Bad Request` | Target tier is not a valid upgrade (Preview only) — same tier or downgrade. |
| `401 Unauthorized` | Missing, invalid, or inactive API key. |
| `404 Not Found` | Subscription ID does not exist or doesn't belong to the authenticated seller (the `GET` endpoints). |
| `422 Unprocessable Entity` | `POST /upgrade` with a missing or foreign subscription ID returns `422` — **not** `404`. |
| `400 Bad Request` | Upgrade rejected — subscription not `active`, proration disabled for the organization, target tier is same or lower, or buyer's stored payment method failed. The response body may include a stray `"errors": 422` field — ignore it; the HTTP status is `400`. |
| `500 Internal Server Error` | Unhandled error during upgrade processing. |

The exact rejection messages returned on `400` are:

- `"Subscription must be active to upgrade."`
- `"Proration is not enabled for this seller."`
- `"Downgrade not allowed. Target tier must have a higher price."`

ℹ

`statuscode`

is not always present

Controller-level errors echo a `statuscode` field matching the HTTP status, but `401`, `403`, and `422` responses do **not** carry it. Read the real HTTP status; treat `statuscode` as optional.

### Subscription Statuses Reference

| Status | Auto-Renew | Upgradeable | Description |
| --- | --- | --- | --- |
| `active` | ✅ YES | Optional | Normal active subscription. |
| `past_due` | ✅ YES | Optional | Payment failed, retry in progress. |
| `upgraded` | ❌ NO | Optional | Original subscription after upgrade (stopped renewing). |
| `cancelled` | ❌ NO | Optional | Manually cancelled. |
| `paused` | ❌ NO | Optional | Paused by seller or buyer. |
| `paused_by_admin` | ❌ NO | Optional | Paused by a Commas admin. |
| `paused_by_persona` | ❌ NO | Optional | Paused pending identity verification. |
| `holded` | ❌ NO | Optional | On hold (e.g. under review). |
| `failed` | ❌ NO | Optional | Terminal payment failure — retries exhausted. |
| `completed` | ❌ NO | Optional | Ran through all scheduled periods. |
| `onetime_service` | ❌ NO | Optional | A one-time purchase record (appears in subscriber lists, not a recurring subscription). |

Subscription Payment Links

## Create a Subscription Payment Link

```http
POST /api/seller/v1/subscription-payment-links
```

Creates a complete recurring offer in one call: the subscription itself plus everything attached to it — course access, Discord roles, Telegram chats, order bumps (addons) and post-purchase upsells. Uses the same authentication, **www host** and `subscriptions` key scope as the upgrade endpoints above.

### Body Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | string | Required | Subscription name (max 255 chars). |
| `price` | number | Required | Recurring price in **dollars** (e.g. 49.99), not cents. |
| `payment_frequency` | integer | Required | Billing frequency in **days** (30 = monthly). |
| `internal_name` | string | Optional | Internal label (max 50 chars). |
| `description` | string | Optional | Description (max 5000 chars). |
| `is_free_trial` + `free_trial_days` | boolean + integer | Optional | Free trial — set the flag and the day count together. |
| `is_joining_fees` + `joining_fees` + `joining_fee_days` | boolean + number + integer | Optional | One-time joining fee (dollars) and the days it covers — all three together. |
| `is_subscription_period` + `subscription_period` | boolean + integer | Optional | Auto-expire after this many billing periods. |
| `course_ids` | integer[] | Optional | Courses to grant access to. |
| `discord_role_ids` | integer[] | Optional | Discord roles to grant. |
| `telegram_chat_ids` | integer[] | Optional | Telegram chats to grant. |
| `addon_ids` | integer[] | Optional | Products to offer as order bumps. |
| `upsell_ids` | integer[] | Optional | Products to offer as post-purchase upsells. |
| `successfull__payment_redirect` | url | Optional | Redirect after successful payment. Yes, the field really is spelled with a double-l and a double underscore. |
| `webhook_url` | url | Optional | Webhook URL for this link's events. |

```shell
curl -X POST "https://www.fanbasis.com/api/seller/v1/subscription-payment-links" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pro Plan",
    "price": 49.99,
    "payment_frequency": 30,
    "is_free_trial": true,
    "free_trial_days": 7,
    "course_ids": [11],
    "discord_role_ids": [22],
    "addon_ids": [33]
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "title": "Pro Plan",
    "price": 49.99,
    "payment_frequency": 30,
    "is_free_trial": true,
    "free_trial_days": 7,
    "course_ids": [
        11
    ],
    "discord_role_ids": [
        22
    ],
    "addon_ids": [
        33
    ]
}

response = requests.post(
    "https://www.fanbasis.com/api/seller/v1/subscription-payment-links",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/api/seller/v1/subscription-payment-links", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "title": "Pro Plan",
    "price": 49.99,
    "payment_frequency": 30,
    "is_free_trial": true,
    "free_trial_days": 7,
    "course_ids": [
      11
    ],
    "discord_role_ids": [
      22
    ],
    "addon_ids": [
      33
    ]
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/api/seller/v1/subscription-payment-links",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "title": "Pro Plan",
    "price": 49.99,
    "payment_frequency": 30,
    "is_free_trial": true,
    "free_trial_days": 7,
    "course_ids": [11],
    "discord_role_ids": [22],
    "addon_ids": [33]
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/api/seller/v1/subscription-payment-links

API Key

Request Body

Request

```bash
curl -X POST "https://www.fanbasis.com/api/seller/v1/subscription-payment-links" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pro Plan",
    "price": 49.99,
    "payment_frequency": 30,
    "is_free_trial": true,
    "free_trial_days": 7,
    "course_ids": [11],
    "discord_role_ids": [22],
    "addon_ids": [33]
  }'⎘ Copy
```

Returns `201` with the link's `id`, `product_id_hash`, pricing, and the attached courses/roles/chats/addons/upsells. The created link is manageable like any product — it appears in [List Your Products](#products) and can be deleted via [Delete a Checkout Session](#checkout-sessions).

## Preview a Subscription Payment Link

```http
POST /api/seller/v1/subscription-payment-links/preview
```

Same body as create; computes and returns the resulting link configuration **without persisting anything**. Use it to validate an offer before creating it.
