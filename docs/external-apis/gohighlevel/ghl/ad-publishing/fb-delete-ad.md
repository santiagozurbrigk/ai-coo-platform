---
title: "Delete ad"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-ad"
seccion: "Ad Manager > Facebook Ads > Delete ad"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/facebook/ads/:adId"
---

# Delete ad

```http
DELETE /ad-publishing/facebook/ads/:adId
```

Delete a Facebook ad by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adId** `string` _required_ — Ad identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier

```json
{
  "locationId": "HChooFuiyPpVYzeJ4HMe"
}
```

### Response (200 · application/json)

Acknowledgement that the ad was deleted

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
