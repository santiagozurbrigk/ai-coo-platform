---
title: "Search Trigger Links"
source: "https://marketplace.gohighlevel.com/docs/ghl/links/search-trigger-links"
seccion: "Trigger Links > Trigger Links Search > Search Trigger Links"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/links/search"
---

# Search Trigger Links

```http
GET /links/search
```

Get list of links by searching

## Request

### Header parameters

- **Authorization** `string` _required_ — Access Token
- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location Id
- **query** `string` — Search query as a string
- **skip** `number` — Numbers of query results to skip

  Default value:

  `0`

- **limit** `number` — Limit on number of search results

  Default value:

  `20`

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
