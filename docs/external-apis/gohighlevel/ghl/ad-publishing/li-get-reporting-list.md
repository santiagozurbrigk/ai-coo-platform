---
title: "Get reporting list"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-get-reporting-list"
seccion: "Ad Manager > LinkedIn Reporting > Get reporting list"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/reporting/list"
---

# Get reporting list

```http
GET /ad-publishing/linkedin/reporting/list
```

Retrieve a list of LinkedIn campaigns or campaign groups with reporting data

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID
- **listType** `string` _required_ — List type
  - Available options: `campaignGroups`, `campaigns`, `ads`
- **campaignId** `string` _required_ — Campaign ID
- **campaignGroupId** `string` _required_ — Campaign group ID
- **startDate** `string` _required_ — Start date in yyyy-mm-dd format
- **endDate** `string` _required_ — End date in yyyy-mm-dd format
- **fields** `string[]` — Reporting fields. Pass as comma-separated values on the wire (e.g. ?fields=impressions,clicks).
  - Available options: `clicks`, `oneClickLeads`, `costInLocalCurrency`, `impressions`, `costInUsd`, `ctr`, `cpc`, `cpm`, `cpl`, `externalWebsitePostClickConversions`, `conversionRate`

### Response (200 · application/json)

Metrics per entity for the period. Identity fields vary with `listType`.

**Schema**

  Array [

  ]

```json
[
  {
    "impressions": 15230,
    "clicks": 214,
    "oneClickLeads": 8,
    "externalWebsitePostClickConversions": 6,
    "ctr": 1.4,
    "cpc": 0.66,
    "cpm": 9.35,
    "cpl": 17.79,
    "conversionRate": 3.74,
    "pivotValues": [
      "urn:li:sponsoredAccount:509444880"
    ],
    "dateStart": "2026-07-01",
    "dateEnd": "2026-07-31",
    "costInUsd": "576.049999999999648674",
    "costInLocalCurrency": "576.05000000000014868",
    "_id": "693c9998ce9aa51d56fa2c7a",
    "name": "Q3 demand generation",
    "publishingStatus": "PAUSED",
    "adCampaignGroupId": "807183436",
    "adCampaignId": "693c99a8682f9414fbd27580",
    "adId": "994458886",
    "campaignName": "48 hours leads"
  }
]
```
