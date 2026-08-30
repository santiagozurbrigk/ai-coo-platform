---
title: "Get conversion pixels"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-pixels"
seccion: "Ad Manager > Facebook Ads > Get conversion pixels"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/pixels"
---

# Get conversion pixels

```http
GET /ad-publishing/facebook/pixels
```

Retrieve Facebook conversion pixels for a location. `channel` selects between two unrelated behaviours. For `FACEBOOK` (the default) the response is `{ items, total }`, or a paginated `{ items, paging }` envelope when `limit` (max 100) is given — pass `after` from `paging.next` for the next batch — and `projection` (comma-separated, from `createdAt`, `fbIsCrmPixel`, `fbPixelCode`, `fbPixelId`, `name`, `type`) narrows each item. For `IG` the response is instead a bare array of Instagram datasets carrying only an id, and `limit`, `after`, and `projection` are ignored.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **channel** `string` — Channel type
  - Available options: `IG`, `FACEBOOK`
- **pageId** `string` — Facebook page ID
- **igUserId** `string` — Instagram user ID
- **limit** `string` — Page size for a paginated fetch (max 100, FACEBOOK channel only). When set, the response is a { items, paging } envelope instead of { items, total }.
- **after** `string` — Opaque cursor for the next batch, taken from the previous response paging.next
- **projection** `string[]` — Fields to return on each item, comma-separated (e.g. ?projection=name,fbPixelId). When set, only the requested fields are returned. Selectable fields: createdAt, fbIsCrmPixel, fbPixelCode, fbPixelId, name, type — any other value is rejected. Omit the param entirely to receive the full item as-is.
  - Available options: `createdAt`, `fbIsCrmPixel`, `fbPixelCode`, `fbPixelId`, `name`, `type`

### Response (200 · application/json)

For channel FACEBOOK, an { items, total } object or an { items, paging } envelope when `limit` is given. For channel IG, a bare array of Instagram datasets, empty when no connected Instagram account matched.

**Schema**

oneOf

- **items** `object[]` _required_ — Every pixel on the ad account
- **total** `number` _required_ — Number of entries in `items`

```json
{
  "items": [
    {
      "name": "AdPublishing - Staging's Pixel",
      "fbPixelId": "2107520276278738",
      "fbIsCrmPixel": true,
      "type": "LEAD_EVENT",
      "fbPixelCode": "<!-- Facebook Pixel Code -->\n<script>...fbq('init', '2107520276278738');...</script>\n<!-- End Facebook Pixel Code -->",
      "createdAt": "2024-03-21T05:29:10+0000"
    }
  ],
  "total": 48
}
```
