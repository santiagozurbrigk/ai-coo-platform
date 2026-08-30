---
title: "Delete shipping zone"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/delete-shipping-zone"
seccion: "Store > Shipping Zone > Delete shipping zone"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/store/shipping-zone/:shippingZoneId"
---

# Delete shipping zone

```http
DELETE /store/shipping-zone/:shippingZoneId
```

Delete specific shipping zone with Id :shippingZoneId

## Request

### Path parameters

- **shippingZoneId** `string` _required_ — ID of the item that needs to be returned

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
