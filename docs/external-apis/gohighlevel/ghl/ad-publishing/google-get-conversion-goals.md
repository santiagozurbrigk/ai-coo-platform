---
title: "Get conversion goals"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-conversion-goals"
seccion: "Ad Manager > Google Ads > Get conversion goals"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/conversion-goals"
---

# Get conversion goals

```http
GET /ad-publishing/google/conversion-goals
```

Retrieve Google Ads conversion goals for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100, default 100) the response is a paginated `{ conversionGoals, paging }` envelope; pass `pageToken` (from `paging.next`) to fetch the next batch.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **limit** `string` — Page size for a paginated fetch (max 100, defaults to 100). When set, the response is a { conversionGoals, paging } envelope instead of a plain array.
- **pageToken** `string` — Opaque cursor for the next batch, taken from the previous response paging.next

### Response (200 · application/json)

A plain array of conversion goals (default), or a { conversionGoals, paging } envelope when `limit` is provided

**Schema**

oneOf

Array [

- **property name*** `any`

]

```json
[
  {
    "category": "PURCHASE",
    "isCustomConversionGoal": false,
    "verificationStatus": "VERIFIED",
    "issueCount": 0
  },
  {
    "category": "SUBMIT_LEAD_FORM",
    "isCustomConversionGoal": false,
    "verificationStatus": "UNVERIFIED",
    "issueCount": 2
  },
  {
    "category": "Demo booked",
    "isCustomConversionGoal": true,
    "verificationStatus": "PENDING",
    "issueCount": 0
  }
]
```
