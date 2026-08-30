---
title: "Get ad analytics"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-get-ad-analytics"
seccion: "Ad Manager > LinkedIn Reporting > Get ad analytics"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/reporting"
---

# Get ad analytics

```http
GET /ad-publishing/linkedin/reporting
```

Retrieve LinkedIn Ads analytics data with configurable pivot and time grouping

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID
- **pivot** `string` — Analytics pivot type
  - Available options: `ACCOUNT`, `CAMPAIGN`, `CAMPAIGN_GROUP`, `CREATIVE`
- **groupBy** `string` — Time granularity for analytics
  - Available options: `day`, `month`, `year`
- **startDate** `string` _required_ — Start date in yyyy-mm-dd format
- **endDate** `string` _required_ — End date in yyyy-mm-dd format
- **entityUrns** `string` — Comma-separated list of entity URNs
- **fields** `string[]` — Reporting fields. Pass as comma-separated values on the wire (e.g. ?fields=impressions,clicks).
  - Available options: `clicks`, `oneClickLeads`, `costInLocalCurrency`, `impressions`, `costInUsd`, `ctr`, `cpc`, `cpm`, `cpl`, `externalWebsitePostClickConversions`, `conversionRate`

### Response (200 · application/json)

Metrics grouped by the requested pivot, plus totals. Only the requested `fields` appear.

**Schema**

- **grouped** `object[]` _required_ — One entry per pivot bucket
- **totals** `object` _required_ — Metrics summed across every bucket

```json
{
  "grouped": [
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
      "costInLocalCurrency": "576.05000000000014868"
    }
  ],
  "totals": {
    "impressions": 15230,
    "clicks": 214,
    "oneClickLeads": 8,
    "externalWebsitePostClickConversions": 6,
    "ctr": 1.4,
    "cpc": 0.66,
    "cpm": 9.35,
    "cpl": 17.79,
    "conversionRate": 3.74,
    "costInUsd": 240.45,
    "costInLocalCurrency": 240.45
  }
}
```
