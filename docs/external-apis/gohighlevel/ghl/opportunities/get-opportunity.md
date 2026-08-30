---
title: "Get Opportunity"
source: "https://marketplace.gohighlevel.com/docs/ghl/opportunities/get-opportunity"
seccion: "Opportunities > Opportunities > Get Opportunity"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/opportunities/:id"
---

# Get Opportunity

```http
GET /opportunities/:id
```

Get Opportunity

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Opportunity Id

### Response (200 · application/json)

Successful response

**Schema**

- **opportunity** `object` — The retrieved opportunity object

```json
{
  "opportunity": {}
}
```
