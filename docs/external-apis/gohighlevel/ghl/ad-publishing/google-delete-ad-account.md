---
title: "Delete ad account"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-delete-ad-account"
seccion: "Ad Manager > Google Integration > Delete ad account"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/google/ad-accounts/:adAccountId"
---

# Delete ad account

```http
DELETE /ad-publishing/google/ad-accounts/:adAccountId
```

Remove a Google Ads account connection from a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adAccountId** `string` _required_ — Ad account identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier

```json
{
  "locationId": "HChooFuiyPpVYzeJ4HMe"
}
```

### Response (200 · application/json)

Acknowledgement that the ad account was disconnected

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
