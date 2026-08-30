---
title: "Delete tag"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/delete-tag"
seccion: "Sub-Account (Formerly location) > Tags > Delete tag"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/locations/:locationId/tags/:tagId"
---

# Delete tag

```http
DELETE /locations/:locationId/tags/:tagId
```

Delete tag

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **tagId** `string` _required_ — Tag Id

### Response (200 · application/json)

Successful response

**Schema**

- **succeded** `boolean`

```json
{
  "succeded": true
}
```
