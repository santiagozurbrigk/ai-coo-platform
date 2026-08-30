---
title: "Get reporting list"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-reporting-list"
seccion: "Ad Manager > Google Reporting > Get reporting list"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/reporting/list"
---

# Get reporting list

```http
GET /ad-publishing/google/reporting/list
```

Retrieve a list of Google campaigns or ad groups with reporting data

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **listType** `string` _required_ — Report list type
  - Available options: `campaigns`, `ads`, `adGroups`, `keywords`
- **startDate** `string` _required_ — Report start date
- **endDate** `string` _required_ — Report end date
- **campaignId** `string` — Campaign identifier (required when listType is adGroups, ads, or keywords)
- **type** `string` _required_ — Integration type
  - Available options: `AD_MANAGER`, `INTEGRATION`

### Response (200 · application/json)

One entry per entity, shaped by `listType`. `campaigns` keeps Google's nested `{ campaign, metrics }` row and only adds the attributed revenue block when `type=AD_MANAGER`; `adGroups` and `ads` flatten the entity onto the row and always carry revenue; `keywords` flattens `name` and `id` from the criterion and carries no revenue at all.

**Schema**

  Array [

  ]

```json
[
  {
    "campaign": {
      "resourceName": "customers/6776452901/campaigns/22209847663",
      "id": "22209847663",
      "name": "Spring promotion",
      "status": "PAUSED"
    },
    "metrics": {
      "impressions": 6041,
      "clicks": 180,
      "costMicros": 5421341,
      "averageCpc": 864547.05,
      "conversions": 0,
      "averageCpm": 25877259.57,
      "costPerConversion": 0,
      "ctr": 0.115
    },
    "revenue": "0.00",
    "sales": "0",
    "leads": "0",
    "averageRevenue": "0.00"
  },
  {
    "resourceName": "customers/6776452901/adGroups/177462089489",
    "id": "177462089489",
    "name": "Ad Group 1",
    "status": "ENABLED",
    "adGroupName": "Ad Group 1",
    "adGroupId": "177462089489",
    "metrics": {
      "impressions": 6041,
      "clicks": 180,
      "costMicros": 5421341,
      "averageCpc": 864547.05,
      "conversions": 0,
      "averageCpm": 25877259.57,
      "costPerConversion": 0,
      "ctr": 0.115
    },
    "revenue": "0",
    "sales": "0",
    "leads": "0",
    "averageRevenue": "0"
  },
  {
    "id": "303338616",
    "name": "running shoes",
    "adGroupName": "Ad Group 1",
    "metrics": {
      "impressions": 6041,
      "clicks": 180,
      "costMicros": 5421341,
      "averageCpc": 864547.05,
      "conversions": 0,
      "averageCpm": 25877259.57,
      "costPerConversion": 0,
      "ctr": 0.115
    },
    "adGroupCriterion": {},
    "adGroup": {},
    "keywordView": {}
  }
]
```
