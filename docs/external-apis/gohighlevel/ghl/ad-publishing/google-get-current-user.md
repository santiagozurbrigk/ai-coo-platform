---
title: "Get current Google user"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-current-user"
seccion: "Ad Manager > Google Integration > Get current Google user"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/me"
---

# Get current Google user

```http
GET /ad-publishing/google/me
```

Retrieve the authenticated Google user info for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Profile of the Google account connected to this location

**Schema**

- **name** `string` _required_ — Display name on the connected Google account
- **picture** `string` _required_ — Profile photo as a base64 data URI, truncated here for brevity

```json
{
  "name": "Jane Doe",
  "picture": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAGQ..."
}
```
