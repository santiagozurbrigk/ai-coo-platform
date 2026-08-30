---
title: "Generate Estimate Number"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/generate-estimate-number"
seccion: "Invoice > Estimate > Generate Estimate Number"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/invoices/estimate/number/generate"
---

# Generate Estimate Number

```http
GET /invoices/estimate/number/generate
```

Get the next estimate number for the given location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **estimateNumber** `number` _required_
- **traceId** `string` _required_

```json
{
  "estimateNumber": 0,
  "traceId": "string"
}
```
