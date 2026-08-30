---
title: "List Estimates"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/list-estimates"
seccion: "Invoice > Estimate > List Estimates"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/invoices/estimate/list"
---

# List Estimates

```http
GET /invoices/estimate/list
```

Get a paginated list of estimates

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **startAt** `string` — startAt in YYYY-MM-DD format
- **endAt** `string` — endAt in YYYY-MM-DD format
- **search** `string` — search text for estimates name
- **status** `string` — estimate status
  - Available options: `all`, `draft`, `sent`, `accepted`, `declined`, `invoiced`, `viewed`
- **contactId** `string` — Contact ID for the estimate
- **limit** `string` _required_ — Limit the number of items to return
- **offset** `string` _required_ — Number of items to skip

### Response (200 · application/json)

Successful response

**Schema**

- **estimates** `string[]` _required_ — List of estimates
- **total** `number` _required_ — Total number of estimates
- **traceId** `string` _required_ — Unique identifier for tracing the request

```json
{
  "estimates": [
    "string"
  ],
  "total": 0,
  "traceId": "string"
}
```
