---
title: "Update Redirect By Id"
source: "https://marketplace.gohighlevel.com/docs/ghl/funnels/update-redirect-by-id"
seccion: "Funnels > Redirect > Update Redirect By Id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/funnels/lookup/redirect/:id"
---

# Update Redirect By Id

```http
PATCH /funnels/lookup/redirect/:id
```

The "Update Redirect By Id" API Allows updating an existing URL redirect in the system. Use this endpoint to modify a URL redirect with the specified ID using details provided in the request payload.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_

### Request body (application/json)

**Body required**

- **target** `string` _required_
- **action** `string` _required_
  - Available options: `funnel`, `website`, `url`, `all`
- **locationId** `string` _required_

```json
{
  "target": "https://www.google.com",
  "action": "URL",
  "locationId": "6p2RxpgtMKQwO3E6IUaT"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object` _required_ — Data containing details of the updated redirect

```json
{
  "data": {
    "id": "6p2RxpgtMKQwO3E6IUaT",
    "locationId": "6p2RxpgtMKQwO3E6IUaT",
    "domain": "www.example.com",
    "path": "/old-path",
    "pathLowercase": "/old-path",
    "type": "Permanent",
    "target": "https://www.example.com/new-path",
    "action": "url"
  }
}
```
