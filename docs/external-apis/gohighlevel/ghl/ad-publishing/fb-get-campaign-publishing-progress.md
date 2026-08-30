---
title: "Get campaign publishing progress"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-campaign-publishing-progress"
seccion: "Ad Manager > Facebook Ads > Get campaign publishing progress"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/campaigns/:campaignId/publishing-progress"
---

# Get campaign publishing progress

```http
GET /ad-publishing/facebook/campaigns/:campaignId/publishing-progress
```

Returns Redis-backed publish progress for a campaign while it is publishing to Meta. Used by the validation funnel UI to poll step counts and completion state.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **campaignId** `string` _required_ — Campaign identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Publishing progress for the campaign

**Schema**

- **campaignId** `string` _required_ — Campaign identifier
- **publishingStatus** `string` _required_ — Current campaign publishing status in ad-publishing
  - Available options: `DRAFT`, `SCHEDULED`, `PUBLISHED`, `PUBLISHING`, `FAILED`, `IN_REVIEW`, `PAUSED`, `ARCHIVED`, `WITH_ISSUES`, `REJECTED`
- **total** `number` _required_ — Total publish steps tracked in Redis (campaign + ad sets + ads)
- **processed** `number` _required_ — Number of publish steps completed so far
- **isComplete** `boolean` _required_ — Whether publishing is finished (Redis complete/failed, processed >= total, or status is no longer PUBLISHING)
- **hasFailed** `boolean` _required_ — Whether publishing failed (Redis failed status or campaign FAILED)

```json
{
  "campaignId": "507f1f77bcf86cd799439011",
  "publishingStatus": "PUBLISHING",
  "total": 5,
  "processed": 2,
  "isComplete": false,
  "hasFailed": false
}
```
