---
title: "Delete Business"
source: "https://marketplace.gohighlevel.com/docs/ghl/businesses/delete-business"
seccion: "Business > Businesses > Delete Business"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/businesses/:businessId"
---

# Delete Business

```http
DELETE /businesses/:businessId
```

Delete Business

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **businessId** `string` _required_

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success value

```json
{
  "success": true
}
```
