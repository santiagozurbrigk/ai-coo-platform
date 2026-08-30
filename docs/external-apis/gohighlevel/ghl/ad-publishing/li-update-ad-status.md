---
title: "Update ad status"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-update-ad-status"
seccion: "Ad Manager > LinkedIn Ads > Update ad status"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/ad-publishing/linkedin/:adId/status"
---

# Update ad status

```http
PATCH /ad-publishing/linkedin/:adId/status
```

Pause or resume a LinkedIn ad, campaign, or ad group

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adId** `string` _required_ — Ad identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Request body (application/json)

**Body required**

- **operationType** `string` _required_ — Update operation
  - Available options: `PAUSED`, `ARCHIVED`, `RESUME`
- **type** `string` _required_ — Ad object type
  - Available options: `adGroup`, `adCampaign`, `ad`

```json
{
  "operationType": "PAUSED",
  "type": "adCampaign"
}
```

### Response (200 · application/json)

Acknowledgement that the status change was applied

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```
