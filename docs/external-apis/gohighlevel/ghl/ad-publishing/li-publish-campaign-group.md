---
title: "Publish ad campaign group"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-publish-campaign-group"
seccion: "Ad Manager > LinkedIn Ads > Publish ad campaign group"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/linkedin/ads/:adId/publish"
---

# Publish ad campaign group

```http
POST /ad-publishing/linkedin/ads/:adId/publish
```

Publish a LinkedIn ad campaign group and push it live

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

Acknowledgement that publishing was queued. Unlike Google, this does not return the campaign document.

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
