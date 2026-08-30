---
title: "Delete schedule"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/delete-invoice-schedule"
seccion: "Invoice > Schedule > Delete schedule"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/invoices/schedule/:scheduleId"
---

# Delete schedule

```http
DELETE /invoices/schedule/:scheduleId
```

API to delete an schedule by schedule id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **scheduleId** `string` _required_ — Schedule Id

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
