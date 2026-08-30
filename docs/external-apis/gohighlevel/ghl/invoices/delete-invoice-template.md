---
title: "Delete template"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/delete-invoice-template"
seccion: "Invoice > Template > Delete template"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/invoices/template/:templateId"
---

# Delete template

```http
DELETE /invoices/template/:templateId
```

API to update an template by template id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **templateId** `string` _required_ — Template Id

### Query parameters

- **altId** `string` _required_ — location Id / company Id based on altType
- **altType** `string` _required_ — Alt Type
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — success

```json
{
  "success": true
}
```
