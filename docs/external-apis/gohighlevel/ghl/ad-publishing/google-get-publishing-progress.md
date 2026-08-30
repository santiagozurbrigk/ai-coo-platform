---
title: "Get ad publishing progress"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-publishing-progress"
seccion: "Ad Manager > Google Ads > Get ad publishing progress"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/ads/:adId/publishing-progress"
---

# Get ad publishing progress

```http
GET /ad-publishing/google/ads/:adId/publishing-progress
```

Returns Redis-backed publish progress for a Google campaign while it is publishing. Used by the publish progress UI to poll step counts and completion state.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adId** `string` _required_ — Ad identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Publish progress counters for the campaign

**Schema**

- **campaignId** `string` _required_ — Campaign being published
- **publishingStatus** `string` _required_ — Current publishing status
  - Available options: `DRAFT`, `SCHEDULED`, `PUBLISHED`, `PUBLISHING`, `FAILED`, `IN_REVIEW`, `PAUSED`, `ARCHIVED`, `WITH_ISSUES`, `REJECTED`
- **total** `number` _required_ — Total steps to process — the campaign plus its ad groups and ads
- **processed** `number` _required_ — Steps completed so far
- **isComplete** `boolean` _required_ — Whether every step has finished
- **hasFailed** `boolean` _required_ — Whether any step failed

```json
{
  "campaignId": "6a8438b2b112242a53b1ea6a",
  "publishingStatus": "PUBLISHING",
  "total": 3,
  "processed": 0,
  "isComplete": false,
  "hasFailed": false
}
```
