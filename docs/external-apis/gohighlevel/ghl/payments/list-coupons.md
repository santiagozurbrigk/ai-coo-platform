---
title: "List Coupons"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/list-coupons"
seccion: "Payments > Coupons > List Coupons"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/coupon/list"
---

# List Coupons

```http
GET /payments/coupon/list
```

The "List Coupons" API allows you to retrieve a list of all coupons available in your location. Use this endpoint to view all promotional offers and special discounts for your customers.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **limit** `number` — Maximum number of coupons to return

  Default value:

  `100`

- **offset** `number` — Number of coupons to skip for pagination

  Default value:

  `0`

- **status** `string` — Filter coupons by status
  - Available options: `scheduled`, `active`, `expired`
- **search** `string` — Search term to filter coupons by name or code

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object[]` _required_ — Array of coupon objects
- **totalCount** `number` _required_ — Total number of coupons matching the query criteria
- **traceId** `string` _required_ — Unique identifier for tracing this API request

```json
{
  "data": [
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
      "productIds": [
        "6241712be68f7a98102ba272"
      ],
      "priceIds": [
        "6241712be68f7a98102ba272"
      ],
      "variantIds": [
        "6241712be68f7a98102ba272"
      ],
      "userId": "q0m15dTLGeiGOXG123123",
      "createdAt": "2025-04-09T18:49:22.026Z",
      "updatedAt": "2025-04-09T18:49:22.026Z"
    }
  ],
  "totalCount": 20,
  "traceId": "c667b18d-8f5e-44cf-a914"
}
```
