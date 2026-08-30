---
title: "Fetch List of Redirects"
source: "https://marketplace.gohighlevel.com/docs/ghl/funnels/fetch-redirects-list"
seccion: "Funnels > Redirect > Fetch List of Redirects"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/funnels/lookup/redirect/list"
---

# Fetch List of Redirects

```http
GET /funnels/lookup/redirect/list
```

Retrieves a list of all URL redirects based on the given query parameters.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **limit** `number` _required_
- **offset** `number` _required_
- **search** `string`

### Response (200 · application/json)

Successful response - List of URL redirects returned

**Schema**

- **data** `object` _required_ — Object containing the count of redirects and an array of redirect data

```json
{
  "data": {
    "count": 42,
    "data": []
  }
}
```
