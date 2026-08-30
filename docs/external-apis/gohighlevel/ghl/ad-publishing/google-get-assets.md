---
title: "Get assets"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-assets"
seccion: "Ad Manager > Google Ads > Get assets"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/assets"
---

# Get assets

```http
GET /ad-publishing/google/assets
```

Retrieve Google Ads creative assets for a location. Without `limit` the response is a plain array of assets. When `limit` is provided (max 100, default 100) the response is a paginated `{ assets, paging }` envelope; pass `pageToken` (from `paging.next`) to fetch the next batch.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` _required_ — Asset type to retrieve
  - Available options: `CALL`, `SITELINK`
- **id** `string` — Asset identifier
- **advertiserOnly** `string` — Advertiser only flag
- **limit** `string` — Page size for a paginated fetch (max 100, defaults to 100). When set, the response is a { assets, paging } envelope instead of a plain array.
- **pageToken** `string` — Opaque cursor for the next batch, taken from the previous response paging.next

### Response (200 · application/json)

A plain array of assets (default), or a { assets, paging } envelope when `limit` is provided

**Schema**

oneOf

Array [

- **property name*** `any`

]

```json
[
  {
    "resourceName": "customers/6776452901/assets/183948277",
    "type": "SITELINK",
    "linkText": "Book a demo",
    "description1": "Free 30-minute session",
    "description2": "No card required",
    "finalUrls": "https://example.com/demo",
    "source": "ADVERTISER",
    "reviewStatus": "REVIEWED",
    "approvalStatus": "APPROVED",
    "policyTopics": []
  },
  {
    "resourceName": "customers/6776452901/assets/183948299",
    "type": "CALL",
    "phoneNumber": "+14155550132",
    "countryCode": "US",
    "callConversionAction": "customers/6776452901/conversionActions/874396901",
    "source": "ADVERTISER",
    "reviewStatus": "REVIEWED",
    "approvalStatus": "APPROVED",
    "policyTopics": []
  }
]
```
