---
title: "Delete shipping carrier"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/delete-shipping-carrier"
seccion: "Store > Shipping Carrier > Delete shipping carrier"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/store/shipping-carrier/:shippingCarrierId"
---

# Delete shipping carrier

```http
DELETE /store/shipping-carrier/:shippingCarrierId
```

Delete specific shipping carrier with Id :shippingCarrierId

## Request

### Path parameters

- **shippingCarrierId** `string` _required_ — ID of the shipping carrier that needs to be returned

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
