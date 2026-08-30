---
title: "Delete Opportunity"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/delete-opportunity"
seccion: "Opportunities > Opportunities > Delete Opportunity"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/opportunities/:id"
---

# Delete Opportunity

```http
DELETE /opportunities/:id
```

Delete Opportunity

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Opportunity Id

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Indicates whether the operation was successful

```json
{
  "success": true
}
```
