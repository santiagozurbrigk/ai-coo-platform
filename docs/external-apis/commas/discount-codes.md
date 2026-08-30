---
title: "Discount Codes"
source: "https://commasdocs.com/api/discount-codes"
seccion: "Recursos"
ancla: "#discount-codes"
capturado: "2026-08-30"
---

# Discount Codes

Discount codes let you offer reduced pricing to specific customers or as part of a promotion. You control the discount type (percentage or fixed amount), how long it applies, when it expires, and how many times it can be used.

✦ Ideas for using discount codes

**"SUMMER20"** — 20% off the first payment. Share on social media to attract new subscribers.
 **"LOYALVIP"** — $10 off forever for your longest-standing members.
 **"WELCOME50"** — 50% off the first payment for new sign-ups from a referral campaign.

⚠ Field naming: request vs response

When you **create or update** a code you send `discount_type` (values `percentage` or `cash`). When you **read** a code back, the same field comes out as `type`. Also note: responses use `expiry` (not `expires_at`), `services` (not `applicable_products`), `usable_number` / `usage_count`, and `value` comes back as a string (e.g. `"20.0000"`).

List Discount Codes

## List Discount Codes

```http
GET /public-api/discount-codes
```

Returns all your discount codes. Use the search parameter to quickly find a specific code.

### Query Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `search` | string | Optional | Matches the code string, the discount type, the value, or the title of an attached product. It does **not** match the description. |
| `per_page` | integer | Optional | Results per page. Not validated server-side — whatever you pass goes straight to the paginator. |

```shell
curl "https://www.fanbasis.com/public-api/discount-codes" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/discount-codes",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/discount-codes", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/discount-codes",
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

/public-api/discount-codes

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/discount-codes" \
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
        "id": "z41y",
        "code": "SUMMER20",
        "description": "20% off for new subscribers",
        "type": "percentage",
        "value": "20.0000",
        "duration": "once",
        "expiry": "2025-08-31T00: 00: 00.000000Z",
        "expiry_time": "00: 00",
        "limited_redemptions": true,
        "usable_number": 100,
        "one_time": true,
        "code_type": "no_limits",
        "service_count": 1,
        "usage_count": 12,
        "services": [
          { "id": "qYyEp", "title": "Pro Monthly", "price": "29.00" }
        ],
        "created_at": "2026-05-01T09: 12: 00.000000Z",
        "updated_at": "2026-06-20T16: 40: 00.000000Z"
      }
    ],
    "total": 1
  }
}⎘ Copy
```

`id` is a **hashid**, the request field `discount_type` comes back as `type`, `value` is a string, and there is **no `is_active` field** — derive usability from `expiry` plus `usage_count` / `usable_number`. `expiry` is a full ISO datetime; `expiry_time` is derived from it (e.g. `"00:00"`). This endpoint returns a raw Laravel paginator, so the envelope carries the full Laravel pagination key set (`first_page_url`, `last_page_url`, `next_page_url`, `prev_page_url`, `from`, `to`, `per_page`, `total`, …) rather than a `data.pagination` object.

Create Discount Code

## Create a Discount Code

```http
POST /public-api/discount-codes
```

Creates a new discount code with the settings you define.

⚠ Cash value is in dollars — not cents

With `discount_type: "cash"`, `value` is the discount in **dollars** (`5` = $5.00), unlike [Create a Checkout Session](#checkout-sessions), which takes `amount_cents`. Sending `"value": 1000` intending $10.00 creates a $1,000 discount. `duration` accepts `once`, `forever`, or `multiple_months` (send `no_of_months` with `multiple_months`).

Request Body

```json
{
  "code": "SUMMER20",
  "description": "20% off for new subscribers",
  "discount_type": "percentage",
  "value": 20,
  "duration": "multiple_months",
  "no_of_months": 3,
  "expiry": "2025-08-31",
  "limited_redemptions": true,
  "usable_number": 100,
  "one_time": true,
  "service_ids": [101, 102]
}
```

```shell
curl -X POST https://www.fanbasis.com/public-api/discount-codes \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER20",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "service_ids": [101],
    "expiry": "2025-08-31",
    "one_time": true
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "code": "SUMMER20",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "service_ids": [
        101
    ],
    "expiry": "2025-08-31",
    "one_time": true
}

response = requests.post(
    "https://www.fanbasis.com/public-api/discount-codes",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/discount-codes", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "code": "SUMMER20",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "service_ids": [
      101
    ],
    "expiry": "2025-08-31",
    "one_time": true
  }),
});

const data = await response.json();
console.log(data);
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/discount-codes",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "code": "SUMMER20",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "service_ids": [101],
    "expiry": "2025-08-31",
    "one_time": true
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/discount-codes

API Key

Request Body

Request

```bash
curl -X POST https://www.fanbasis.com/public-api/discount-codes \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER20",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "service_ids": [101],
    "expiry": "2025-08-31",
    "one_time": true
  }'⎘ Copy
```

Response

```
# 201 Created
{
  "status": "success",
  "message": "Coupon code added successfully.",
  "data": {
    "id": "z41y",
    "code": "SUMMER20",
    "description": "20% off for new subscribers",
    "type": "percentage",
    "value": "20.0000",
    "duration": "once",
    "expiry": "2025-08-31T00:00:00.000000Z",
    "expiry_time": "00:00",
    "limited_redemptions": true,
    "usable_number": 100,
    "one_time": true,
    "code_type": "no_limits",
    "service_count": 1,
    "usage_count": 0,
    "services": [
      { "id": "qYyEp", "title": "Pro Monthly", "price": "29.00" }
    ],
    "created_at": "2026-07-13T09:12:00.000000Z",
    "updated_at": "2026-07-13T09:12:00.000000Z"
  }
}⎘ Copy
```

```shell
curl -X POST https://www.fanbasis.com/public-api/discount-codes \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "LOYALVIP",
    "discount_type": "cash",
    "value": 10,
    "duration": "forever",
    "service_ids": [101]
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "code": "LOYALVIP",
    "discount_type": "cash",
    "value": 10,
    "duration": "forever",
    "service_ids": [
        101
    ]
}

response = requests.post(
    "https://www.fanbasis.com/public-api/discount-codes",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/discount-codes", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "code": "LOYALVIP",
    "discount_type": "cash",
    "value": 10,
    "duration": "forever",
    "service_ids": [
      101
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/discount-codes",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "POST",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "code": "LOYALVIP",
    "discount_type": "cash",
    "value": 10,
    "duration": "forever",
    "service_ids": [101]
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

POST

/public-api/discount-codes

API Key

Request Body

Request — cash discount ($10.00 off)

```bash
curl -X POST https://www.fanbasis.com/public-api/discount-codes \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "LOYALVIP",
    "discount_type": "cash",
    "value": 10,
    "duration": "forever",
    "service_ids": [101]
  }'⎘ Copy
```

`value: 10` means **$10.00 off**, not 10 cents. The code reads back with `"type": "cash"` and `"value": "10.0000"`.

Get Discount Code

## Get a Discount Code

```http
GET /public-api/discount-codes/:id
```

Fetches the details of one discount code, including how many times it's been used.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Required | The discount code's **hashid** (e.g. `z41y`), exactly as returned in `data.id`. A numeric id returns `400 "Invalid discount code ID"`. |

```shell
curl "https://www.fanbasis.com/public-api/discount-codes/z41y" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(
    "https://www.fanbasis.com/public-api/discount-codes/z41y",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/discount-codes/z41y", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/discount-codes/z41y",
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

/public-api/discount-codes/z41y

API Key

Request

```bash
curl "https://www.fanbasis.com/public-api/discount-codes/z41y" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{
  "status": "success",
  "data": {
    "id": "z41y",
    "code": "SUMMER20",
    "description": "20% off for new subscribers",
    "type": "percentage",
    "value": "20.0000",
    "duration": "once",
    "expiry": "2025-08-31T00: 00: 00.000000Z",
    "expiry_time": "00: 00",
    "limited_redemptions": true,
    "usable_number": 100,
    "one_time": true,
    "code_type": "no_limits",
    "service_count": 1,
    "usage_count": 12,
    "services": [
      { "id": "qYyEp", "title": "Pro Monthly", "price": "29.00" }
    ],
    "created_at": "2026-05-01T09: 12: 00.000000Z",
    "updated_at": "2026-06-20T16: 40: 00.000000Z"
  }
}⎘ Copy
```

Update Discount Code

## Update a Discount Code

```http
PUT /public-api/discount-codes/:id
```

Updates an existing discount code. This is a **full replacement, not a patch**.

⚠ Send the complete payload

`PUT` validates the same required set as create — `code`, `discount_type`, `value`, `duration`, and `service_ids`. A partial body (e.g. just `expiry`) returns `400 Validation failed`.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Required | The discount code's **hashid** (e.g. `z41y`). A numeric id returns `400 "Invalid discount code ID"`. |

Request Body

```json
{
  "code": "SUMMER20",
  "description": "20% off for new subscribers — extended",
  "discount_type": "percentage",
  "value": 20,
  "duration": "once",
  "expiry": "2025-12-31",
  "limited_redemptions": true,
  "usable_number": 200,
  "one_time": true,
  "service_ids": [101]
}
```

```shell
curl -X PUT "https://www.fanbasis.com/public-api/discount-codes/z41y" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER20",
    "description": "20% off for new subscribers — extended",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "expiry": "2025-12-31",
    "limited_redemptions": true,
    "usable_number": 200,
    "one_time": true,
    "service_ids": [101]
  }'
```

```python
import requests

headers = {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
}

payload = {
    "code": "SUMMER20",
    "description": "20% off for new subscribers — extended",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "expiry": "2025-12-31",
    "limited_redemptions": true,
    "usable_number": 200,
    "one_time": true,
    "service_ids": [
        101
    ]
}

response = requests.put(
    "https://www.fanbasis.com/public-api/discount-codes/z41y",
    headers=headers,
    json=payload
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/discount-codes/z41y", {
  method: "PUT",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    "code": "SUMMER20",
    "description": "20% off for new subscribers — extended",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "expiry": "2025-12-31",
    "limited_redemptions": true,
    "usable_number": 200,
    "one_time": true,
    "service_ids": [
      101
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/discount-codes/z41y",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => "PUT",
  CURLOPT_HTTPHEADER     => [
    "x-api-key: YOUR_API_KEY",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS     => '{
    "code": "SUMMER20",
    "description": "20% off for new subscribers — extended",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "expiry": "2025-12-31",
    "limited_redemptions": true,
    "usable_number": 200,
    "one_time": true,
    "service_ids": [101]
  }',
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

PUT

/public-api/discount-codes/z41y

API Key

Request Body

Request

```bash
curl -X PUT "https://www.fanbasis.com/public-api/discount-codes/z41y" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SUMMER20",
    "description": "20% off for new subscribers — extended",
    "discount_type": "percentage",
    "value": 20,
    "duration": "once",
    "expiry": "2025-12-31",
    "limited_redemptions": true,
    "usable_number": 200,
    "one_time": true,
    "service_ids": [101]
  }'⎘ Copy
```

Response

```json
{
  "status": "success",
  "message": "Discount code updated successfully",
  "data": {
    "id": "z41y",
    "code": "SUMMER20",
    "description": "20% off for new subscribers — extended",
    "type": "percentage",
    "value": "20.0000",
    "duration": "once",
    "expiry": "2025-12-31T00: 00: 00.000000Z",
    "expiry_time": "00: 00",
    "limited_redemptions": true,
    "usable_number": 200,
    "one_time": true,
    "code_type": "no_limits",
    "service_count": 1,
    "usage_count": 12,
    "services": [
      { "id": "qYyEp", "title": "Pro Monthly", "price": "29.00" }
    ],
    "created_at": "2026-05-01T09: 12: 00.000000Z",
    "updated_at": "2026-07-13T09: 12: 00.000000Z"
  }
}⎘ Copy
```

Delete Discount Code

## Delete a Discount Code

```http
DELETE /public-api/discount-codes/:id
```

Deletes a discount code. Customers with active subscriptions already using this code won't be affected — they'll keep their discount.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Required | The discount code's **hashid** (e.g. `z41y`). A numeric id returns `400 "Invalid discount code ID"`. |

```shell
curl -X DELETE "https://www.fanbasis.com/public-api/discount-codes/z41y" \
  -H "x-api-key: YOUR_API_KEY"
```

```python
import requests

headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.delete(
    "https://www.fanbasis.com/public-api/discount-codes/z41y",
    headers=headers
)

print(response.json())
```

```javascript
const response = await fetch("https://www.fanbasis.com/public-api/discount-codes/z41y", {
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
  CURLOPT_URL            => "https://www.fanbasis.com/public-api/discount-codes/z41y",
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

/public-api/discount-codes/z41y

API Key

Request

```bash
curl -X DELETE "https://www.fanbasis.com/public-api/discount-codes/z41y" \
  -H "x-api-key: YOUR_API_KEY"⎘ Copy
```

Response

```json
{ "status": "success", "message": "Coupon Code has been deleted successfully!", "data": null }⎘ Copy
```
