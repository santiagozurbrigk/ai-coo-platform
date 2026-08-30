---
title: "Duplicate ad"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-duplicate-ad"
seccion: "Ad Manager > Facebook Ads > Duplicate ad"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/facebook/ads/:adId/duplicate"
---

# Duplicate ad

```http
POST /ad-publishing/facebook/ads/:adId/duplicate
```

Duplicate an existing Facebook ad

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

The duplicated ad, as a new draft

**Schema**

- **id** `string` _required_ — Ad identifier
- **name** `string` _required_ — Ad name
- **campaignId** `string` _required_ — Parent campaign id
- **adsetId** `string` _required_ — Parent ad set id
- **fbAdId** `string` — Facebook ad id, set once published
- **publishingStatus** `string` _required_ — Publishing status. On a published entity this is not the state you asked for but the `effective_status` Meta reports, mapped back — a pause or resume re-reads it live, so an ad awaiting review comes back `IN_REVIEW` rather than `PAUSED` or `PUBLISHED`. Any effective status this service does not recognise also maps to `IN_REVIEW`.
  - Available options: `DRAFT`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `PAUSED`, `IN_REVIEW`, `WITH_ISSUES`, `REJECTED`, `ARCHIVED`, `FAILED`
- **fbError** `string` — Publish error from Facebook. `null` on reads when there is none.
- **mediaType** `string` _required_ — Creative format
- **cta** `string` — Call-to-action button
- **multiAdvertiserAds** `boolean` _required_ — Whether multi-advertiser ads are enabled
- **primaryTexts** `object[]` _required_ — Primary text variants. Used by SINGLE image and video ads.
- **headlines** `object[]` _required_ — Headline variants
- **descriptions** `object[]` _required_ — Description variants
- **primaryText** `string` — Single primary text. Carried alongside `primaryTexts`, mirroring its first entry.
- **headline** `string` — Single headline. Used by carousel ads; mirrors the first `headlines` entry otherwise.
- **description** `string` — Single description
- **media** `object[]` _required_ — Creative media
- **destinationFormId** `string` — Instant form the ad routes to, when the conversion location is on-ad
- **destinationLink** `string` — Click destination. `null` when the ad routes to an instant form instead.
- **unpublishedChanges** `boolean` — Whether the ad has edits not yet published
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "id": "6a323f3f4454921db1498ce1",
  "name": "Ad 1",
  "campaignId": "6a323f3e4454921db1498ccf",
  "adsetId": "6a323f3f4454921db1498cd8",
  "fbAdId": "120250378908850122",
  "publishingStatus": "PUBLISHED",
  "fbError": null,
  "mediaType": "SINGLE",
  "cta": "GET_OFFER",
  "multiAdvertiserAds": true,
  "primaryTexts": [
    {
      "text": "Book a free demo",
      "_id": "6a3245204454921db1499735"
    }
  ],
  "headlines": [
    {
      "text": "Book a free demo",
      "_id": "6a3245204454921db1499735"
    }
  ],
  "descriptions": [
    {
      "text": "Book a free demo",
      "_id": "6a3245204454921db1499735"
    }
  ],
  "primaryText": "Get an instant estimate",
  "headline": "Free home valuation",
  "description": "Fast and hassle-free",
  "media": [
    {
      "type": "image",
      "src": "https://staging.files.leadconnectorhq.com/file/abc/def.jpeg",
      "name": "creative.jpeg",
      "_id": "6a859661867e604d24f4d73d"
    }
  ],
  "destinationFormId": "36267736432839880",
  "destinationLink": null,
  "unpublishedChanges": false,
  "createdAt": "2026-06-17T06:31:27.661Z",
  "updatedAt": "2026-08-19T11:45:39.340Z"
}
```
