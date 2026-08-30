---
title: "Generate Invoice Number"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/generate-invoice-number"
seccion: "Invoice > Invoice > Generate Invoice Number"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/invoices/generate-invoice-number"
---

# Generate Invoice Number

```http
GET /invoices/generate-invoice-number
```

Get the next invoice number for the given location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id
- **altType** `string` _required_
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **invoiceNumber** `number` — Invoice Number

```json
{
  "invoiceNumber": "19"
}
```
