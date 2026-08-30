---
title: "Customers"
source: "https://commasdocs.com/api/customers"
seccion: "Recursos"
ancla: "#customers"
capturado: "2026-08-30"
---

# Customers

Your customer list includes everyone who has ever purchased from you through Commas. The Customers API lets you search your list, view saved payment methods, and charge customers again directly — without them needing to go through checkout.

✦ When is this useful?

A customer wants to add another product or pay for a one-time service. You find them in your customer list, grab their saved card, and charge them directly — all without sending them a new payment link.

List Customers

## List Your Customers

```http
GET /public-api/customers
```

Returns a searchable, paginated list of all your customers — with their total spend, transaction count, and last payment date.

ℹ Types in this response

`id` is a plain numeric integer (not a prefixed string), and `total_spent` may serialize as a **string** because it comes straight out of a decimal column. Parse both defensively.

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `search` | string | Optional | Type a name, email, or phone number to search for a specific customer. |
| `page` | integer | Optional | Page number (starts at 1). |
| `per_page` | integer | Optional | Results per page (max 100). |

```shell
curl "https://www.fanbasis.com/public-api/customers?search=jane@example.com" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/customers?search=jane@example.com",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/customers?search=jane@example.com", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/customers?search=jane@example.com",
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

/public-api/customers?search=jane@example.com

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/customers?search=jane@example.com" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "data": {
    "customers": [
      {
        "id": 102482,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "total_transactions": 5,
        "total_spent": "149.95",
        "last_transaction_date": "2025-01-10T00: 00: 00Z"
      }
    ],
    "pagination": { "current_page": 1, "per_page": 10, "total_items": 58, "total_pages": 6, "has_more": true }
  }
}⎘ Copy
```

Get Payment Methods

## Get a Customer's Saved Payment Methods

```http
GET /public-api/customers/:customerId/payment-methods
```

Shows all payment cards a customer has on file. You'll need the payment method ID to charge them directly.

⚠ Use the customer ID from the customer list — not a transaction's

`fan.id`

Commas has two separate identifiers for a buyer, and only one works here. This endpoint needs the numeric `id` returned by [List Your Customers](#list-customers) (e.g. `102482`). A transaction's `fan.id` or a subscriber record's `customer.id` (e.g. `5yWjR`) is a **different** identifier and returns `Customer not found`, even though it looks like a valid ID.

Searching customers by that other ID also returns nothing — look the buyer up by **email** instead to get the right ID. (The [MCP tools](#ai-agent) and the [CLI](#cli) resolve this for you automatically and tell you which ID they used.)

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `customerId` | integer | Required | The customer's numeric ID from [List Your Customers](#list-customers). Not a transaction's `fan.id` or a subscriber's `customer.id` — those are a different identifier and will not resolve. |

```shell
curl "https://www.fanbasis.com/public-api/customers/102482/payment-methods" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/customers/102482/payment-methods",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/customers/102482/payment-methods", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/customers/102482/payment-methods",
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

/public-api/customers/102482/payment-methods

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/customers/102482/payment-methods" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "data": {
    "customer": { "id": 102482, "name": "Jane Doe", "email": "jane@example.com" },
    "payment_methods": [
      {
        "id": "01KNHTPEASJ6WCGWZ66C5RGYB5",
        "type": "card",
        "last4": "4242",
        "payment_method_uuid": "9c04840d-8d55-4a7a-b84d-d511412d62da",
        "is_default": true,
        "mandate_status": null,
        "metadata": {
          "data": { "card_type": "visa", "month": 1, "year": 2027 }
        }
      }
    ]
  }
}⎘ Copy
```

ℹ Where card brand & expiry live

Top-level fields are `id`, `type`, `last4`, `payment_method_uuid`, `is_default`, and `mandate_status`. The card brand and expiry are nested inside `metadata.data` (`card_type`, `month`, `year`). Use the `id` (or `payment_method_uuid`) as the `payment_method_id` when charging the customer.

Charge Customer

## Charge a Customer Directly

```http
POST /public-api/customers/:customerId/charge
```

Charges a customer using a saved payment method. No checkout page needed — the charge happens immediately. This endpoint supports the `Idempotency-Key` header: replaying the same key within 10 minutes returns `409` instead of charging twice — strongly recommended for retry-safe integrations.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `customerId` | integer | Required | The customer's numeric ID. |

### Body Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `payment_method_id` | string | Required | A saved payment method `id` (or `payment_method_uuid`) from the payment-methods endpoint. |
| `amount_cents` | integer | Required | Amount to charge in cents. Minimum 1. |
| `description` | string | Required | What the charge is for. Max 255 characters. |
| `metadata` | object | Optional | Accepted (string values only) but **not persisted** — it will not appear on the transaction or in webhook payloads. |

### Headers

| Header | Required | Description |
| --- | --- | --- |
| `Idempotency-Key` | No (recommended) | Optional |

⚠ Undocumented preconditions

A charge is refused unless all of these hold, none of which are visible from the request itself:

- **Manual rebilling is enabled for your organization.** This is an admin-side flag — contact support if charges are refused outright.
- **The customer has a prior non-free purchase from you.** Someone who has only ever been on a free trial or a $0 product cannot be charged.
- **The customer has an authorized subscription with you** — an authorization the platform records when they buy. `subscription.charge_consent: 1` in the Subscribers response is a useful signal but **not a reliable one**: in production testing, 7 of 8 customers showing `charge_consent: 1` still could not be charged. Treat it as necessary, not sufficient.

When this precondition is missing the API returns `404` with `No authorized subscription found for customer`. The customer ID in the request is usually correct — check the authorization rather than hunting for an ID mistake.

Request Body

```json
{
  "payment_method_id": "01KNHTPEASJ6WCGWZ66C5RGYB5",
  "amount_cents": 1999,
  "description": "Monthly premium subscription charge"
}
```

```shell
curl -X POST "https://www.fanbasis.com/public-api/customers/102482/charge" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: charge-req-001" \
  -d '{
    "payment_method_id": "01KNHTPEASJ6WCGWZ66C5RGYB5",
    "amount_cents": 1999,
    "description": "Upgrade to Pro plan"
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
    "Idempotency-Key": "charge-req-001",
}

payload = {
    "payment_method_id": "01KNHTPEASJ6WCGWZ66C5RGYB5",
    "amount_cents": 1999,
    "description": "Upgrade to Pro plan"
}

response = requests.post(
    "https://www.fanbasis.com/public-api/customers/102482/charge",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/customers/102482/charge", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
    "Idempotency-Key": "charge-req-001",
  },
  body: JSON.stringify({
    "payment_method_id": "01KNHTPEASJ6WCGWZ66C5RGYB5",
    "amount_cents": 1999,
    "description": "Upgrade to Pro plan"
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/customers/102482/charge",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
    "Idempotency-Key: charge-req-001",
  ],
  CURLOPT_POSTFIELDS     => '{
    "payment_method_id": "01KNHTPEASJ6WCGWZ66C5RGYB5",
    "amount_cents": 1999,
    "description": "Upgrade to Pro plan"
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/customers/102482/charge

API Key

Request Body

Request

```bash
curl -X POST "https://www.fanbasis.com/public-api/customers/102482/charge" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: charge-req-001" \
  -d '{
    "payment_method_id": "01KNHTPEASJ6WCGWZ66C5RGYB5",
    "amount_cents": 1999,
    "description": "Upgrade to Pro plan"
  }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "data": {
    "charge_id": "01J8XR2K9P3QWZ5MN7VABCDEFG",
    "amount": 19.99,
    "status": "succeeded",
    "created_at": "2025-01-15T14: 30: 00Z"
  }
}⎘ Copy
```

⚠ Units: cents in, dollars out

You **send** the charge amount in cents (`amount_cents: 1999`), but the API **returns** `amount` in dollars (`19.99`). This dollars-in-responses convention is consistent across the API — transaction, product, and refund responses all report monetary amounts as decimal dollars, not cents.
