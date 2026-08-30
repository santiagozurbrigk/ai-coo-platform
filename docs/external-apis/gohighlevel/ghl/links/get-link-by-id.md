---
title: "Get Link by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/links/get-link-by-id"
seccion: "Trigger Links > Trigger Links > Get Link by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/links/id/:linkId"
---

# Get Link by ID

```http
GET /links/id/:linkId
```

Get a single link by its ID

## Request

### Header parameters

- **Authorization** `string` _required_ — Access Token
- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **linkId** `string` _required_ — Link Id

### Query parameters

- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **link** `object` — The trigger link object

```json
{
  "link": {
    "id": "n4AriwEnFrGh3tu08W0U",
    "name": "first tag",
    "redirectTo": "https://www.google.com/",
    "fieldKey": "{{trigger_link.n4AriwEnFrGh3tu08W0U}}",
    "locationId": "ve9EPM428h8vShlRW1KT"
  }
}
```
