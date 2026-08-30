---
title: "Delete Link"
source: "https://marketplace.gohighlevel.com/docs/ghl/links/delete-link"
seccion: "Trigger Links > Trigger Links > Delete Link"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/links/:linkId"
---

# Delete Link

```http
DELETE /links/:linkId
```

Delete Link

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **linkId** `string` _required_ — Link Id

### Response (201 · application/json)

Successful response

**Schema**

- **succeded** `boolean` — Indicates whether the link was successfully deleted (legacy field, misspelled). Use `succeeded` with x-api-version: v3.
- **succeeded** `boolean` — Indicates whether the link was successfully deleted.

```json
{
  "succeeded": true
}
```
