---
title: "Update estimate last visited at"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/update-estimate-last-visited-at"
seccion: "Invoice > Estimate > Update estimate last visited at"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/invoices/estimate/stats/last-visited-at"
---

# Update estimate last visited at

```http
PATCH /invoices/estimate/stats/last-visited-at
```

API to update estimate last visited at by estimate id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **estimateId** `string` _required_ — Estimate Id

```json
{
  "estimateId": "5f9d6d8b1b2d2c001f2d9e4b"
}
```

### Response (200)
