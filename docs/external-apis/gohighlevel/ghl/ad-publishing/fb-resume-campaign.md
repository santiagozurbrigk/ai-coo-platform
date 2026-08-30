---
title: "Resume campaign"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-resume-campaign"
seccion: "Ad Manager > Facebook Ads > Resume campaign"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/facebook/campaigns/:campaignId/resume"
---

# Resume campaign

```http
POST /ad-publishing/facebook/campaigns/:campaignId/resume
```

Resume a paused Facebook campaign

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

Acknowledgement that the campaign was resumed

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
