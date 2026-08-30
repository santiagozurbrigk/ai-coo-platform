---
title: "Create Redirect"
source: "https://marketplace.gohighlevel.com/docs/ghl/funnels/create-redirect"
seccion: "Funnels > Redirect > Create Redirect"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/funnels/lookup/redirect"
---

# Create Redirect

```http
POST /funnels/lookup/redirect
```

The "Create Redirect" API Allows adding a new url redirect to the system. Use this endpoint to create a url redirect with the specified details. Ensure that the required information is provided in the request payload.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_
- **domain** `string` _required_
- **path** `string` _required_
- **target** `string` _required_
- **action** `string` _required_
  - Available options: `funnel`, `website`, `url`, `all`

```json
{
  "locationId": "6p2RxpgtMKQwO3E6IUaT",
  "domain": "example.com",
  "path": "/Hello",
  "target": "https://www.google.com",
  "action": "URL"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object` _required_ — Data containing details of the created redirect

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
