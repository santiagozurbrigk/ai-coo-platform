---
title: "Delete Coupon"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/delete-coupon"
seccion: "Payments > Coupons > Delete Coupon"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/payments/coupon"
---

# Delete Coupon

```http
DELETE /payments/coupon
```

The "Delete Coupon" API allows you to permanently remove a coupon from your system using its unique identifier. Use this endpoint to discontinue promotional offers or clean up unused coupons. Note that this action cannot be undone.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **id** `string` _required_ — Coupon Id

```json
{
  "altId": "BQdAwxa0ky1iK2sstLGJ",
  "altType": "location",
  "id": "6241712be68f7a98102ba272"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Indicates whether the delete was successful
- **traceId** `string` _required_ — Unique identifier for tracing this API request

```json
{
  "success": true,
  "traceId": "c667b18d-8f5e-44cf-a914"
}
```
