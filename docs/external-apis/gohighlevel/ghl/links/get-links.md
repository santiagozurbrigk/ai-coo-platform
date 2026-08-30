---
title: "Get Links"
source: "https://marketplace.gohighlevel.com/docs/ghl/links/get-links"
seccion: "Trigger Links > Trigger Links > Get Links"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/links/"
---

# Get Links

```http
GET /links/
```

Get Links

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID of the business profile

### Response (200 · application/json)

Successful response

**Schema**

- **links** `object[]` — List of trigger links

```json
{
  "links": [
    {
      "id": "n4AriwEnFrGh3tu08W0U",
      "name": "first tag",
      "redirectTo": "https://www.google.com/",
      "fieldKey": "{{trigger_link.n4AriwEnFrGh3tu08W0U}}",
      "locationId": "ve9EPM428h8vShlRW1KT"
    }
  ]
}
```
