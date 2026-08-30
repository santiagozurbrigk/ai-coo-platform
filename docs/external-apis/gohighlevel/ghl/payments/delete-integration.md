---
title: "Deleting an existing integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/delete-integration"
seccion: "Payments > Custom Provider > Deleting an existing integration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/payments/custom-provider/provider"
---

# Deleting an existing integration

```http
DELETE /payments/custom-provider/provider
```

API to delete an association for an app and location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location id

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Whether the custom provider config is disconnect or not. true represents config is disconnect

```json
{
  "success": "true"
}
```
