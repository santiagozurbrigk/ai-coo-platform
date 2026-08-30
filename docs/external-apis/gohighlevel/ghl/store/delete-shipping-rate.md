---
title: "Delete shipping rate"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/delete-shipping-rate"
seccion: "Store > Shipping Zone Rates > Delete shipping rate"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId"
---

# Delete shipping rate

```http
DELETE /store/shipping-zone/:shippingZoneId/shipping-rate/:shippingRateId
```

Delete specific shipping rate with Id :shippingRateId

## Request

### Path parameters

- **shippingZoneId** `string` _required_ — ID of the shipping zone
- **shippingRateId** `string` _required_ — ID of the shipping rate that needs to be returned

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — Status of api action
- **message** `string` — Success message

```json
{
  "status": true,
  "message": "Successfully created"
}
```
