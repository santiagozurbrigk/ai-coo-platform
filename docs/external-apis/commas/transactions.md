---
title: "Transactions"
source: "https://commasdocs.com/api/transactions"
seccion: "Recursos"
ancla: "#transactions"
capturado: "2026-08-30"
---

# Transactions

A transaction is a record of a single completed payment. Every time a customer pays — one-time or recurring — a transaction is created. The Transactions API lets you pull detailed records including customer info, the product sold, Commas's fee, and your net payout.

Look Up Transaction

## Look Up a Transaction

```http
GET /public-api/transactions/:transactionId
```

Returns the full details of a single payment. Useful for customer support lookups, accounting, or building transaction receipts.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `transactionId` | string | Required | The transaction's hashid (from transaction list responses). |

```shell
curl "https://www.fanbasis.com/public-api/transactions/pX9vQ" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/transactions/pX9vQ",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/transactions/pX9vQ", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/transactions/pX9vQ",
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

/public-api/transactions/pX9vQ

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/transactions/pX9vQ" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Transaction retrieved successfully",
  "data": {
    "id": 919049,
    "transaction_date": "2026-06-30T14: 55: 09.000000Z",
    "fan": {
      "id": "5yWjR",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "3055550100",
      "country_code": "1"
    },
    "servicePayment": {
      "id": "p9Rwr",
      "payment_type": "auto_renew",
      "fund_release_on": "2026-07-02 09: 55: 09",
      "fund_released": 1
    },
    "service": {
      "id": "NLxj6",
      "title": "Pro Monthly Membership",
      "internal_name": null,
      "description": null,
      "price": "29.99",
      "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/NLxj6"
    },
    "product": {
      "id": "NLxj6",
      "title": "Pro Monthly Membership",
      "internal_name": null,
      "description": null,
      "price": "29.99",
      "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/NLxj6"
    },
    "refunds": [],
    "fee_amount": 1.20,
    "net_amount": 28.79,
    "amount": 29.99
  },
  "request_id": "…"
}⎘ Copy
```

Row `id` is numeric; `fan`, `servicePayment`, `service`, and `product` ids are public hashids. `customFields` (an array of `{label, type, value}`) appears when the original checkout collected custom fields. Note that webhook events reference the same transaction by its public order ID (`ORD-…`), not this numeric id.

Get All Transactions

## Get All Transactions

```http
GET /public-api/checkout-sessions/transactions
```

Returns every payment that's been made across all your products. Each result shows who paid, what they bought, your fee, and your net payout. You can filter by product or customer.

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `product_id` | string | Optional | Only show transactions for this product. |
| `customer_id` | integer | Optional | Only show transactions from this customer. Must be the **raw numeric** customer id — the hashid this endpoint returns in `fan.id` will not match. |
| `page` | integer | Optional | Which page of results to show. Starts at 1. |
| `per_page` | integer | Optional | How many results per page (max 100). |

⚠ An unrecognised customer_id is silently ignored

This filter **fails open**: a `customer_id` that doesn't match one of your customers is not rejected — the endpoint returns **every transaction** on the account with a `200`. Pass the **raw numeric** customer id from [List Your Customers](#list-customers) (search by the buyer's email if all you have is a `fan.id`), and verify the returned rows actually belong to that customer rather than trusting the filter.

```shell
curl "https://www.fanbasis.com/public-api/checkout-sessions/transactions?page=1&per_page=20" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/checkout-sessions/transactions?page=1&per_page=20",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/checkout-sessions/transactions?page=1&per_page=20", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/checkout-sessions/transactions?page=1&per_page=20",
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

/public-api/checkout-sessions/transactions?page=1&per_page=20

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/checkout-sessions/transactions?page=1&per_page=20" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": 919049,
        "transaction_date": "2026-06-30T14: 55: 09.000000Z",
        "fan": {
          "id": "5yWjR",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "phone": "3055550100",
          "country_code": "1"
        },
        "servicePayment": {
          "id": "p9Rwr",
          "payment_type": "auto_renew",
          "fund_release_on": "2026-07-02 09: 55: 09",
          "fund_released": 1
        },
        "service": {
          "id": "NLxj6",
          "title": "Pro Monthly Membership",
          "internal_name": null,
          "description": null,
          "price": "29.99",
          "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/NLxj6"
        },
        "product": {
          "id": "NLxj6",
          "title": "Pro Monthly Membership",
          "internal_name": null,
          "description": null,
          "price": "29.99",
          "payment_link": "https://www.fanbasis.com/agency-checkout/your-handle/NLxj6"
        },
        "refunds": [],
        "fee_amount": 1.20,
        "net_amount": 28.79,
        "amount": 29.99
      }
    ],
    "pagination": { "current_page": 1, "total_pages": 5, "per_page": 20, "total_items": 95, "has_more": true }
  }
}⎘ Copy
```
