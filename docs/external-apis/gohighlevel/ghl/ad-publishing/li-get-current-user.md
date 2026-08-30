---
title: "Get current LinkedIn user"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-get-current-user"
seccion: "Ad Manager > LinkedIn Integration > Get current LinkedIn user"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/me"
---

# Get current LinkedIn user

```http
GET /ad-publishing/linkedin/me
```

Retrieve the authenticated LinkedIn user info for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Profile of the LinkedIn member connected to this location

**Schema**

- **id** `string` _required_ — LinkedIn member id
- **name** `string` _required_ — Display name, joined from the profile first and last name
- **profilePicture** `string` — Profile photo URL, taken from the largest display image LinkedIn returns

```json
{
  "id": "AbC1dEfGh2",
  "name": "Jane Doe",
  "profilePicture": "https://media.licdn.com/dms/image/v2/.../profile-displayphoto"
}
```
