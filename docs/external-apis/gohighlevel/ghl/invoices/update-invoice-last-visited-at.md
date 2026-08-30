---
title: "Update invoice last visited at"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/update-invoice-last-visited-at"
seccion: "Invoice > Invoice > Update invoice last visited at"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/invoices/stats/last-visited-at"
---

# Update invoice last visited at

```http
PATCH /invoices/stats/last-visited-at
```

API to update invoice last visited at by invoice id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **invoiceId** `string` _required_ — Invoice Id

```json
{
  "invoiceId": "6578278e879ad2646715ba9c"
}
```

### Response (200)
