---
title: "Delete Custom Value"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/delete-custom-value"
seccion: "Sub-Account (Formerly location) > Custom Value > Delete Custom Value"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/locations/:locationId/customValues/:id"
---

# Delete Custom Value

```http
DELETE /locations/:locationId/customValues/:id
```

Delete Custom Value

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — Custom Value Id

### Response (200 · application/json)

Successful response

**Schema**

- **succeded** `boolean`

```json
{
  "succeded": true
}
```
