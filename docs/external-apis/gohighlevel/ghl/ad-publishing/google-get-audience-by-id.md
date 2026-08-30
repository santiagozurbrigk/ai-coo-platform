---
title: "Get audience by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-audience-by-id"
seccion: "Ad Manager > Google Ads > Get audience by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/audiences/:audienceId"
---

# Get audience by ID

```http
GET /ad-publishing/google/audiences/:audienceId
```

Retrieve a specific Google Ads combined audience by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **audienceId** `string` _required_ — Audience identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

The combined audience

**Schema**

- **resourceName** `string` _required_ — Google Ads resource name
- **id** `string` _required_ — Audience id
- **status** `string` _required_ — Audience status
- **name** `string` _required_ — Audience name
- **scope** `string` _required_ — Scope the audience is defined at
- **dimensions** `object` _required_ — Inclusion targeting
- **exclusionDimension** `object` _required_ — Exclusion targeting

```json
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
```
