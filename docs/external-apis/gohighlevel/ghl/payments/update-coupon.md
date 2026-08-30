---
title: "Update Coupon"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/update-coupon"
seccion: "Payments > Coupons > Update Coupon"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/payments/coupon"
---

# Update Coupon

```http
PUT /payments/coupon
```

The "Update Coupon" API enables you to modify existing coupon details such as discount values, validity periods, usage limits, and other promotional parameters. Use this endpoint to adjust or extend promotional offers for your customers.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **name** `string` _required_ — Coupon Name
- **code** `string` _required_ — Coupon Code
- **discountType** `string` _required_ — Discount Type
  - Available options: `percentage`, `amount`
- **discountValue** `number` _required_ — Discount Value
- **startDate** `string` _required_ — Start date in YYYY-MM-DDTHH:mm:ssZ format
- **endDate** `string` — End date in YYYY-MM-DDTHH:mm:ssZ format
- **usageLimit** `number` — Max number of times coupon can be used
- **productIds** `string[]` — Product Ids
- **priceIds** `string[]` — Price Ids
- **variantIds** `string[]` — Variant Ids
- **applyToFuturePayments** `boolean` — Is Coupon applicable on upcoming subscription transactions

  **Default value:**

  `true`

- **applyToFuturePaymentsConfig** `object` — If coupon is applicable on upcoming subscription transactions, how many months should it be applicable for a subscription

  **Default value:**

  `{"type":"forever"}`

- **limitPerCustomer** `boolean` — Limits whether a coupon can be redeemed only once per customer.

  **Default value:**

  `false`

- **id** `string` _required_ — Coupon Id

```json
{
  "altId": "BQdAwxa0ky1iK2sstLGJ",
  "altType": "location",
  "name": "New Year Sale",
  "code": "LEVELUPDAY2022",
  "discountType": "amount",
  "discountValue": 10,
  "startDate": "2023-01-01T22:45:00.000Z",
  "endDate": "2023-01-31T22:45:00.000Z",
  "usageLimit": 10,
  "productIds": [
    "6241712be68f7a98102ba272"
  ],
  "priceIds": [
    "6241712be68f7a98102ba272"
  ],
  "variantIds": [
    "6241712be68f7a98102ba272"
  ],
  "applyToFuturePayments": true,
  "applyToFuturePaymentsConfig": [
    {
      "type": "fixed",
      "duration": 5,
      "durationType": "months"
    },
    {
      "type": "forever"
    }
  ],
  "limitPerCustomer": true,
  "id": "6241712be68f7a98102ba272"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **_id** `string` _required_ — Unique MongoDB identifier for the coupon
- **usageCount** `number` _required_ — Number of times the coupon has been used
- **limitPerCustomer** `number` _required_ — Maximum number of times a customer can use this coupon (0 for unlimited)
- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — Type of entity
- **name** `string` _required_ — Display name of the coupon
- **code** `string` _required_ — Redemption code for the coupon
- **discountType** `string` _required_ — Type of discount (percentage or amount)
  - Available options: `percentage`, `amount`
- **discountValue** `number` _required_ — Value of the discount (percentage or fixed amount)
- **status** `string` _required_ — Current status of the coupon
  - Available options: `scheduled`, `active`, `expired`
- **startDate** `string` _required_ — Date when the coupon becomes active
- **endDate** `string` — End date when the coupon expires
- **applyToFuturePayments** `boolean` _required_ — Indicates if the coupon applies to future recurring payments
- **applyToFuturePaymentsConfig** `object` _required_ — Configuration for how the coupon applies to future payments
- **userId** `string` — User ID associated with the coupon (if applicable)
- **createdAt** `string` _required_ — Creation timestamp
- **updatedAt** `string` _required_ — Last update timestamp
- **traceId** `string` _required_ — Unique identifier for tracing this API request

```json
{
  "_id": "67f6c132d9485f9dacd5f123",
  "usageCount": 12,
  "limitPerCustomer": 5,
  "altId": "79t07PzK8Tvf73d12312",
  "altType": "location",
  "name": "NEWT6",
  "code": "NEWT6",
  "discountType": "percentage",
  "discountValue": 25,
  "status": "scheduled",
  "startDate": "2025-04-30T18:30:00.000Z",
  "endDate": "2025-05-30T18:30:00.000Z",
  "applyToFuturePayments": true,
  "applyToFuturePaymentsConfig": {
    "type": "fixed",
    "duration": 3,
    "durationType": "months"
  },
  "userId": "q0m15dTLGeiGOXG123123",
  "createdAt": "2025-04-09T18:49:22.026Z",
  "updatedAt": "2025-04-09T18:49:22.026Z",
  "traceId": "c667b18d-8f5e-44cf-a914"
}
```
