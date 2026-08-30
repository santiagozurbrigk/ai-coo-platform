---
title: "Delete ad set"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-adset"
seccion: "Ad Manager > Facebook Ads > Delete ad set"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/ad-publishing/facebook/adsets/:adSetId"
---

# Delete ad set

```http
DELETE /ad-publishing/facebook/adsets/:adSetId
```

Delete a Facebook ad set by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adSetId** `string` _required_ — Ad set identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier

```json
{
  "locationId": "HChooFuiyPpVYzeJ4HMe"
}
```

### Response (200 · application/json)

Acknowledgement that the ad set was deleted

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
