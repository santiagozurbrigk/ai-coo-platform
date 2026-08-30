---
title: "Fetch Coupon"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/get-coupon"
seccion: "Payments > Coupons > Fetch Coupon"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/coupon"
---

# Fetch Coupon

```http
GET /payments/coupon
```

The "Get Coupon Details" API enables you to retrieve comprehensive information about a specific coupon using either its unique identifier or promotional code. Use this endpoint to view coupon parameters, usage statistics, validity periods, and other promotional details.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **id** `string` _required_ — Coupon id
- **code** `string` _required_ — Coupon code

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
