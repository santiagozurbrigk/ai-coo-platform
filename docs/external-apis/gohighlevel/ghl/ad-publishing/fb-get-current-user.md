---
title: "Get current Facebook user"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-current-user"
seccion: "Ad Manager > Facebook Integration > Get current Facebook user"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/me"
---

# Get current Facebook user

```http
GET /ad-publishing/facebook/me
```

Retrieve the authenticated Facebook user profile for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Profile of the Facebook user connected to this location

**Schema**

- **id** `string` _required_ — Facebook user id
- **name** `string` _required_ — Display name on the connected Facebook account
- **picture** `object` _required_ — Profile photo, kept in Facebook’s `{ data: { … } }` envelope

```json
{
  "id": "122106171518726316",
  "name": "Jane Doe",
  "picture": {
    "data": {
      "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=...&height=50&width=50",
      "width": 50,
      "height": 50,
      "isSilhouette": false
    }
  }
}
```
