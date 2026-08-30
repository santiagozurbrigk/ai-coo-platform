---
title: "Products"
source: "https://commasdocs.com/#products"
seccion: "Recursos"
ancla: "#products"
capturado: "2026-08-30"
---

# Products

Products (called "services" in some parts of the API) are the items you've set up to sell. Each product has its own payment link. Use these endpoints to list everything you offer, create new products programmatically, and pull per-product transaction history.

List Products

## List Your Products

```http
GET /public-api/products
```

Returns all your products with their titles, prices, and ready-to-use payment links.

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | integer | Optional | Page number. |
| `per_page` | integer | Optional | Results per page (max 100). |

```shell
curl "https://www.fanbasis.com/public-api/products" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/products",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/products", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/products",
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

/public-api/products

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/products" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": "qYyEp",
        "title": "Pro Monthly",
        "internal_name": null,
        "description": "Full access to all features, billed monthly.",
        "price": "29.99",
        "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/qYyEp"
      }
    ],
    "total": 5
  }
}⎘ Copy
```

ℹ Community & Courses products are excluded

This endpoint returns your payment products only. Community and Courses products do not appear in the list.

ℹ IDs, prices, and pagination shape

Product `id` values here are **hashids** and `price` is a **string** in dollars. This endpoint returns a raw Laravel paginator (`data.current_page`, `data.data[]`, `data.total`, …) rather than the `data.pagination` envelope used by most list endpoints.

Additional Product Endpoints

## More Product Endpoints

The following endpoints are also available with the same `x-api-key` authentication:

| Endpoint | Description |
| --- | --- |
| `POST /public-api/products/create` | Create a product programmatically. Takes `price` in **dollars** (minimum 1), not cents. |
| `GET /public-api/products/:id/transactions` | Transactions for one product — same row shape as [Get All Transactions](#checkout-transactions). `:id` must be the **numeric** product id; hashids are not decoded on this route. |
| `GET /public-api/products/:id/subscriptions` | Subscriptions for one product — same row shape as [Get Subscriptions for a Product](#product-subscriptions). `:id` must be the **numeric** product id; hashids are not decoded on this route. |
| `GET /public-api/transactions/all` | All transactions across products — same row shape as [Get All Transactions](#checkout-transactions). Known issue: the `refunds` array on rows from this endpoint may show zeroed amounts. |

Create Product

## Create a Product

```http
POST /public-api/products/create
```

Creates a product directly and returns its `product_id` and a ready-to-share `payment_link` in one call. For subscriptions, include `payment_frequency_days`.

⚠ Price is in dollars here — not cents

This endpoint takes `price` in **dollars** (`19.99` = $19.99, minimum 1), unlike [Create a Checkout Session](#checkout-sessions), which takes `amount_cents`. Sending cents here creates a product 100× the intended price.

### Body Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | string | Required | Product name (max 255 chars). |
| `price` | number | Required | Price in **dollars**, minimum 1. |
| `type` | string | Optional | `onetime` (default) or `subscription`. |
| `payment_frequency_days` | integer | Optional | Billing frequency in days. |
| `description` | string | Optional | Product description. |
| `free_trial_days` | integer | Optional | Free trial days. Cannot be combined with `initial_fee`. |
| `initial_fee` | number | Optional | Initial fee in dollars. Cannot be combined with `free_trial_days`. |
| `initial_fee_days` | integer | Optional | Days the initial fee covers. |
| `auto_expire_after_x_periods` | integer | Optional | Auto-expire the subscription after X billing periods. |
| `successful_payment_redirect` | url | Optional | Redirect URL after successful payment. |
| `webhook_url` | url | Optional | Webhook URL for this product's events. |
| `application_fee` | number | Optional | Application fee amount. |
| `metadata` | string | Optional | Arbitrary metadata as a JSON string. |

```shell
curl -X POST "https://www.fanbasis.com/public-api/products/create" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1:1 Coaching Call",
    "price": 199,
    "type": "onetime",
    "description": "A 60-minute coaching session"
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "title": "1:1 Coaching Call",
    "price": 199,
    "type": "onetime",
    "description": "A 60-minute coaching session"
}

response = requests.post(
    "https://www.fanbasis.com/public-api/products/create",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/products/create", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "title": "1:1 Coaching Call",
    "price": 199,
    "type": "onetime",
    "description": "A 60-minute coaching session"
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/products/create",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "title": "1:1 Coaching Call",
    "price": 199,
    "type": "onetime",
    "description": "A 60-minute coaching session"
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/products/create

API Key

Request Body

Request

```bash
curl -X POST "https://www.fanbasis.com/public-api/products/create" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1:1 Coaching Call",
    "price": 199,
    "type": "onetime",
    "description": "A 60-minute coaching session"
  }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Created Product",
  "data": {
    "product_id": 1474183,
    "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/aB3xY"
  }
}⎘ Copy
```

Product Transactions

## Get Transactions for a Product

```http
GET /public-api/products/:productId/transactions
```

All transactions for one product — the closest thing to per-product revenue reporting. Same row shape as [Get All Transactions](#checkout-transactions).

⚠ Use the numeric product id on the raw endpoint

This route does **not** decode hashids: the path parameter is compared numerically, so a hashid like `62oN7` is silently read as `62` — filtering by the **wrong product** or none, with a 200 response either way. Resolve a hashid to the numeric id first via [Look Up a Checkout Session](#checkout-sessions) (`data.product.id`). The [MCP tools](#ai-agent) and [CLI](#cli) do this resolution for you automatically.

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | integer | Optional | Page number. |
| `per_page` | integer | Optional | Results per page (max 100). |

```shell
curl "https://www.fanbasis.com/public-api/products/1023864/transactions?per_page=10" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/products/1023864/transactions?per_page=10",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/products/1023864/transactions?per_page=10", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/products/1023864/transactions?per_page=10",
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

/public-api/products/1023864/transactions?per_page=10

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/products/1023864/transactions?per_page=10" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```
