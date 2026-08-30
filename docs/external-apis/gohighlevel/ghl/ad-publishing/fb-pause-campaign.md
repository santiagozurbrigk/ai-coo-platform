---
title: "Pause campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-pause-campaign"
seccion: "Ad Manager > Facebook Ads > Pause campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/facebook/campaigns/:campaignId/pause"
---

# Pause campaign

```http
POST /ad-publishing/facebook/campaigns/:campaignId/pause
```

Pause a running Facebook campaign

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **campaignId** `string` _required_ — Campaign identifier

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier

```json
{
  "locationId": "HChooFuiyPpVYzeJ4HMe"
}
```

### Response (200 · application/json)

Acknowledgement that the campaign was paused

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
