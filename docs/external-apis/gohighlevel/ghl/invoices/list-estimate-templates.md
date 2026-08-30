---
title: "List Estimate Templates"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/list-estimate-templates"
seccion: "Invoice > Estimate > List Estimate Templates"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/invoices/estimate/template"
---

# List Estimate Templates

```http
GET /invoices/estimate/template
```

Get a list of estimate templates or a specific template by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **search** `string` — To search for an estimate template by id / name
- **limit** `string` _required_ — Limit the number of items to return
- **offset** `string` _required_ — Number of items to skip

### Response (200 · application/json)

Successful response

**Schema**

- **data** `string[]` _required_ — List of estimate templates
- **totalCount** `number` _required_ — Total number of estimate templates available
- **traceId** `string` _required_ — Unique identifier for tracing the request

```json
{
  "data": [
    "string"
  ],
  "totalCount": 0,
  "traceId": "string"
}
```
