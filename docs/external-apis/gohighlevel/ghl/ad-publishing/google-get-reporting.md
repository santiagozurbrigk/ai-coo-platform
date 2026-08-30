---
title: "Get reporting data"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-reporting"
seccion: "Ad Manager > Google Reporting > Get reporting data"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/reporting"
---

# Get reporting data

```http
GET /ad-publishing/google/reporting
```

Retrieve aggregated Google Ads reporting metrics for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **fields** `string[]` _required_ — Reporting fields. Pass as comma-separated values on the wire (e.g. ?fields=impressions,clicks).
  - Available options: `impressions`, `clicks`, `cost_micros`, `average_cpc`, `conversions`, `average_cpm`, `cost_per_conversion`, `ctr`
- **groupBy** `string` — Group by period
  - Available options: `date`, `week`, `month`
- **startDate** `string` _required_ — Report start date
- **endDate** `string` _required_ — Report end date
- **type** `string` _required_ — Integration type
  - Available options: `AD_MANAGER`, `INTEGRATION`

### Response (200 · application/json)

Metrics grouped by the requested interval, plus totals. Only the requested `fields` appear.

**Schema**

- **grouped** `object[]` _required_ — One entry per time bucket
- **totals** `object` _required_ — Metrics summed across every bucket

```json
{
  "grouped": [
    {
      "segments": {
        "week": "2026-08-03"
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
      }
    }
  ],
  "totals": {
    "impressions": 6041,
    "clicks": 180,
    "costMicros": 5421341,
    "averageCpc": 864547.05,
    "conversions": 0,
    "averageCpm": 25877259.57,
    "costPerConversion": 0,
    "ctr": 0.115
  }
}
```
