---
title: "Delete Custom Field"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/delete-custom-field"
seccion: "Sub-Account (Formerly location) > Custom Field > Delete Custom Field"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/locations/:locationId/customFields/:id"
---

# Delete Custom Field

```http
DELETE /locations/:locationId/customFields/:id
```

Delete Custom Field

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — Custom Field Id

### Response (200 · application/json)

Successful response

**Schema**

- **succeded** `boolean`

```json
{
  "succeded": true
}
```
