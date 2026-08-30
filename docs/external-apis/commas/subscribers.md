---
title: "Subscribers"
source: "https://commasdocs.com/api/subscribers"
seccion: "Recursos"
ancla: "#subscribers"
capturado: "2026-08-30"
---

# Subscribers

The Subscribers endpoint gives you a unified view of who is subscribed to what — combining customer profile info with their subscription status across all your products. Think of it as a live member directory.

List Subscribers

## List All Subscribers

```http
GET /public-api/subscribers
```

Returns every subscriber across all your products. Filter by customer or product to narrow results.

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `product_id` | string | Optional | Show only subscribers to this product. |
| `customer_id` | integer | Optional | Show only subscriptions belonging to this customer. Must be the **raw numeric** customer id — the hashid this endpoint returns in `customer.id` will not match. |
| `page` | integer | Optional | Page number. |
| `per_page` | integer | Optional | Results per page (max 100). |

```shell
curl "https://www.fanbasis.com/public-api/subscribers?product_id=NLxj6" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/subscribers?product_id=NLxj6",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/subscribers?product_id=NLxj6", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/subscribers?product_id=NLxj6",
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

/public-api/subscribers?product_id=NLxj6

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/subscribers?product_id=NLxj6" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Subscribers retrieved successfully",
  "data": {
    "subscribers": [
      {
        "id": 111388,
        "customer": {
          "id": "5yWjR",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "phone": "3055550100",
          "country_code": "1"
        },
        "product": {
          "id": "NLxj6",
          "title": "Pro Monthly Membership",
          "internal_name": null,
          "description": null,
          "price": "29.99",
          "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/NLxj6"
        },
        "subscription": {
          "id": 111388,
          "status": "active",
          "service_type": "subscription",
          "payment_frequency": "monthly",
          "completion_date": null,
          "cancelled_at": null,
          "auto_renew_count": 3,
          "charge_consent": 1,
          "created_at": "2026-01-01T00: 00: 00.000000Z",
          "updated_at": "2026-07-01T00: 00: 00.000000Z"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 4,
      "per_page": 25,
      "total_items": 80,
      "has_more": true
    }
  },
  "request_id": "…"
}⎘ Copy
```

Row `id` and `subscription.id` are numeric; `customer.id` and `product.id` are public hashids. `subscription.status` can be any of the values listed under [Subscription Statuses](#proration-statuses), including `onetime_service` for one-time purchases that appear in this list. `charge_consent` is `1` when the customer agreed to saved-card charges.

Get Subscriptions for a Checkout Session

## Get Subscriptions for a Checkout Session

```http
GET /public-api/checkout-sessions/:checkoutSessionId/subscriptions
```

Returns all subscriptions created from a specific checkout session. Useful for subscription products that have multiple subscribers through the same session.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `checkoutSessionId` | string | Required | The checkout session ID. |

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | integer | Optional | Page number. |
| `per_page` | integer | Optional | Results per page (max 100). |

```shell
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions?page=1" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions?page=1",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions?page=1", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions?page=1",
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

/public-api/checkout-sessions/NLxj6/subscriptions?page=1

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions?page=1" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Subscriptions retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "id": 111388,
        "user_id": "5yWjR",
        "first_name": "Jane Doe",
        "last_name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "3055550100",
        "country_code": "1",
        "subscription_status": "active",
        "next_renewal_date": "2026-08-15T00: 00: 00.000000Z",
        "created_at": "2026-01-15T00: 00: 00.000000Z"
      }
    ],
    "pagination": { "current_page": 1, "total_pages": 1, "per_page": 25, "total_items": 12, "has_more": false }
  },
  "request_id": "…"
}⎘ Copy
```

Row `id` is numeric; `user_id` is the customer's public hashid. Note: `first_name` and `last_name` currently both return the customer's _full_ name — don't rely on them being split.

Get Product Subscriptions

## Get Subscriptions for a Product

```http
GET /public-api/products/:productId/subscriptions
```

Lists every subscriber to a specific product. Shows their email, subscription status, and when they'll next be billed. Great for managing your member list. To list subscriptions by checkout session instead, use [Get Subscriptions for a Checkout Session](#session-subscriptions) above.

⚠ Use the numeric product id on this route

This route does **not** decode hashids: the path parameter is compared numerically, so a hashid like `62oN7` is silently read as `62` — filtering by the **wrong product** or none, with a 200 response either way. Resolve a hashid to the numeric id first via [Look Up a Checkout Session](#checkout-sessions) (`data.product.id`).

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `productId` | integer | Required | The **numeric** product id. Hashids are not decoded on this route. |

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | integer | Optional | Page number. |
| `per_page` | integer | Optional | Results per page (max 100). |

```shell
curl "https://www.fanbasis.com/public-api/products/1023864/subscriptions?page=1" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/products/1023864/subscriptions?page=1",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/products/1023864/subscriptions?page=1", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/products/1023864/subscriptions?page=1",
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

/public-api/products/1023864/subscriptions?page=1

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/products/1023864/subscriptions?page=1" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Subscriptions retrieved successfully",
  "data": {
    "subscriptions": [
      {
        "id": 111388,
        "user_id": "5yWjR",
        "first_name": "Jane Doe",
        "last_name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "3055550100",
        "country_code": "1",
        "subscription_status": "active",
        "next_renewal_date": "2026-08-15T00: 00: 00.000000Z",
        "created_at": "2026-01-15T00: 00: 00.000000Z"
      }
    ],
    "pagination": { "current_page": 1, "total_pages": 2, "per_page": 25, "total_items": 40, "has_more": true }
  },
  "request_id": "…"
}⎘ Copy
```

Row `id` is numeric; `user_id` is the customer's public hashid. Note: `first_name` and `last_name` currently both return the customer's _full_ name — don't rely on them being split.

Cancel a Subscription

## Cancel a Subscription

```http
DELETE /public-api/checkout-sessions/:checkoutSessionId/subscriptions/:subscriptionId
```

Cancels a customer's subscription. Cancellation is **immediate** — the subscription stops auto-renewing and no further charges are made. Access generally runs to the end of the already-paid period.

⚠ Community access during a trial or initial-fee period

If the subscriber is inside a **free-trial** or **initial-fee** period when you cancel, community access (Discord / Telegram) is revoked **immediately** rather than at period end.

⚠ Only active subscriptions can be cancelled

Anything that isn't `active` — including a subscription you already cancelled — returns `404` with `"Subscription not found or not active"`. It is _not_ a `400`, so don't treat 404 here as "wrong ID".

● Finding the subscriptionId

The `subscriptionId` is the numeric `id` field returned in the subscription list above — not the customer's user ID.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `checkoutSessionId` | string | Required | The ID of the product the subscription belongs to. |
| `subscriptionId` | integer | Required | The subscription ID from the subscription list (the numeric `id` field). |

```shell
curl -X DELETE \
  "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions/111388" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.delete(
    "",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("", {
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
  CURLOPT_URL            => "",
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

API Key

Request

```bash
curl -X DELETE \
  "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/subscriptions/111388" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Subscription cancelled successfully",
  "data": { "id": 111388, "cancelled_at": "2026-07-13T14: 00: 00Z", "subscription_status": "cancelled" }
}⎘ Copy
```

Refund a Transaction

## Refund a Transaction

```http
POST /public-api/checkout-sessions/transactions/:transactionId/refund
```

Issues a full or partial refund for a payment. Both `amount_cents` and `reason` are required — an empty body returns `400 Validation failed`. Pass the transaction's full remaining amount as `amount_cents` for a full refund, or a smaller amount for a partial refund. Refunds are processed synchronously: a `200` response means the refund is done.

⚠ Refunds are irreversible

Once issued, a refund cannot be canceled. The customer receives the refunded amount back to their original payment method within a few business days.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `transactionId` | string | Required | The transaction to refund — accepts the internal hashid (e.g. `pX9vQ`) or the public order ID (`ORD-XXXX-XXXX-XXXX`). The response echoes the hashid. |

### Body Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `amount_cents` | integer | Required | Amount to refund in cents (minimum 1). Equal to the transaction's remaining amount = full refund; less = partial refund. |
| `reason` | string | Required | Why the refund was issued — 3 to 255 characters. Stored on the refund record. |

Request Body

```json
{
  "amount_cents": 2500,
  "reason": "Customer requested partial refund"
}
```

```shell
curl -X POST "https://www.fanbasis.com/public-api/checkout-sessions/transactions/pX9vQ/refund" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: refund-req-001" \
  -d '{ "amount_cents": 2500, "reason": "Customer requested partial refund" }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
    "Idempotency-Key": "refund-req-001",
}

payload = {
    "amount_cents": 2500,
    "reason": "Customer requested partial refund"
}

response = requests.post(
    "https://www.fanbasis.com/public-api/checkout-sessions/transactions/pX9vQ/refund",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/transactions/pX9vQ/refund", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
    "Idempotency-Key": "refund-req-001",
  },
  body: JSON.stringify({
    "amount_cents": 2500,
    "reason": "Customer requested partial refund"
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/transactions/pX9vQ/refund",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
    "Idempotency-Key: refund-req-001",
  ],
  CURLOPT_POSTFIELDS     => '{ "amount_cents": 2500, "reason": "Customer requested partial refund" }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/checkout-sessions/transactions/pX9vQ/refund

API Key

Request Body

Request

```bash
curl -X POST "https://www.fanbasis.com/public-api/checkout-sessions/transactions/pX9vQ/refund" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: refund-req-001" \
  -d '{ "amount_cents": 2500, "reason": "Customer requested partial refund" }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Transaction refunded successfully",
  "data": {
    "refund_id": "d8Kw2",
    "transaction_id": "pX9vQ",
    "refund_amount": 25.00,
    "refund_amount_cents": 2500,
    "refund_type": "partial",
    "refund_cost": 26.05,
    "proportional_fee": 1.05,
    "creator_amount_deduction": 25.00
  },
  "request_id": "req_9f2c…"
}⎘ Copy
```

ℹ Idempotency

This endpoint supports the `Idempotency-Key` header. Replaying the same key within 10 minutes returns `409` with `{"status": "error", "message": "This refund request was already processed.", "data": []}` instead of issuing a second refund.

Extend a Subscription

## Extend a Subscription

```http
POST /public-api/checkout-sessions/:checkoutSessionId/extend-subscription
```

Pushes out a customer's next billing date by a given number of days. Use this to comp members for downtime, run a loyalty promotion, or manually extend access. Only **active** subscriptions can be extended — anything else is rejected.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `checkoutSessionId` | string | Required | The ID of the product the subscription belongs to. |

### Body Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | integer or string | Required | The subscriber's customer id — either the raw numeric id or its hashid. |
| `duration_days` | integer | Required | How many days to push the next billing date out by. |

Request Body

```json
{
  "user_id": 102482,
  "duration_days": 30
}
```

```shell
curl -X POST "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/extend-subscription" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "user_id": 102482, "duration_days": 30 }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "user_id": 102482,
    "duration_days": 30
}

response = requests.post(
    "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/extend-subscription",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/extend-subscription", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "user_id": 102482,
    "duration_days": 30
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/extend-subscription",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{ "user_id": 102482, "duration_days": 30 }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/checkout-sessions/NLxj6/extend-subscription

API Key

Request Body

Request

```bash
curl -X POST "https://www.fanbasis.com/public-api/checkout-sessions/NLxj6/extend-subscription" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "user_id": 102482, "duration_days": 30 }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Subscription extended successfully",
  "data": {
    "subscription_id": 111388,
    "user_id": 102482,
    "product_id": "NLxj6",
    "duration_extended_days": 30,
    "new_completion_date": "2026-04-15T00: 00: 00.000000Z",
    "extended_at": "2026-03-16T09: 12: 00.000000Z",
    "request_id": "…"
  }
}⎘ Copy
```
