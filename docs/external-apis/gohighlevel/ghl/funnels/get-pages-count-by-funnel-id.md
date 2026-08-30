---
title: "Fetch count of funnel pages"
source: "https://marketplace.gohighlevel.com/docs/ghl/funnels/get-pages-count-by-funnel-id"
seccion: "Funnels > Funnel > Fetch count of funnel pages"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/funnels/page/count"
---

# Fetch count of funnel pages

```http
GET /funnels/page/count
```

Retrieves count of all funnel pages based on the given query parameters.

## Request

### Query parameters

- **locationId** `string` _required_
- **funnelId** `string` _required_
- **name** `string`

### Response (200 · application/json)

Successful response - Count of funnel pages returned

**Schema**

- **count** `number` _required_

```json
{
  "count": 20
}
```
