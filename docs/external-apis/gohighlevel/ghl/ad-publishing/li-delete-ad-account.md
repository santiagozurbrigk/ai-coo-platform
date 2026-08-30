---
title: "Delete ad account"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-delete-ad-account"
seccion: "Ad Manager > LinkedIn Integration > Delete ad account"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/linkedin/ad-account"
---

# Delete ad account

```http
DELETE /ad-publishing/linkedin/ad-account
```

Remove a LinkedIn ad account connection from a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **adAccountId** `string` _required_ — Ad account identifier

### Response (200 · application/json)

Acknowledgement that the ad account was disconnected

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
