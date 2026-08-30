---
title: "Get audiences"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-audiences"
seccion: "Ad Manager > Google Ads > Get audiences"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/audiences"
---

# Get audiences

```http
GET /ad-publishing/google/audiences
```

Retrieve Google Ads combined audiences for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100, default 100) the response is a paginated `{ audiences, paging }` envelope; pass `pageToken` (from `paging.next`) to fetch the next batch.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **limit** `string` — Page size for a paginated fetch (max 100, defaults to 100). When set, the response is a { audiences, paging } envelope instead of a plain array.
- **pageToken** `string` — Opaque cursor for the next batch, taken from the previous response paging.next

### Response (200 · application/json)

A plain array of audiences (default), or a { audiences, paging } envelope when `limit` is provided

**Schema**

oneOf

Array [

- **resourceName** `string` _required_ — Google Ads resource name
- **id** `string` _required_ — Audience id
- **status** `string` _required_ — Audience status
- **name** `string` _required_ — Audience name
- **scope** `string` _required_ — Scope the audience is defined at
- **dimensions** `object` _required_ — Inclusion targeting
- **exclusionDimension** `object` _required_ — Exclusion targeting

]

```json
[
  {
    "resourceName": "customers/6776452901/audiences/330214962",
    "id": "330214962",
    "status": "ENABLED",
    "name": "Returning customers",
    "scope": "CUSTOMER",
    "dimensions": {
      "ageRanges": [
        {
          "minAge": 18,
          "maxAge": 64
        }
      ],
      "genders": [
        "MALE"
      ],
      "incomeRanges": [
        "INCOME_RANGE_0_50"
      ],
      "parentalStatuses": [
        "PARENT"
      ],
      "audienceSegments": {
        "customAudiences": [
          "customers/6776452901/customAudiences/901256299"
        ],
        "userLists": [
          "customers/6776452901/userLists/9144367872"
        ],
        "userInterests": [
          "customers/6776452901/userInterests/80276"
        ]
      },
      "isAgeUnknown": true,
      "isHouseHoldIncomeUnknown": true
    },
    "exclusionDimension": {
      "userLists": [
        "customers/6776452901/userLists/8999046675"
      ]
    }
  }
]
```
