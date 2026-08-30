---
title: "Get campaign reporting"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-campaign-reporting"
seccion: "Ad Manager > Google Reporting > Get campaign reporting"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/reporting/campaign/:campaignId"
---

# Get campaign reporting

```http
GET /ad-publishing/google/reporting/campaign/:campaignId
```

Retrieve reporting metrics for a specific Google campaign

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **campaignId** `string` _required_ — Campaign identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **startDate** `string` _required_ — Report start date
- **endDate** `string` _required_ — Report end date

### Response (200 · application/json)

Per-day metric rows for the campaign, plus its identity and serving window

**Schema**

- **grouped** `object[]` _required_ — Per-day metric rows
- **campaignId** `string` _required_ — Google Ads campaign id
- **name** `string` _required_ — Campaign name
- **publishingStatus** `string` _required_ — Publishing status held by this product
- **objective** `string` _required_ — Advertising channel the campaign runs on
- **startTime** `string` _required_ — When the campaign started serving
- **stopTime** `string` _required_ — When the campaign stopped serving
- **leads** `string` _required_ — Attributed leads count, as a string

```json
{
  "grouped": [
    {
      "campaign": {
        "resourceName": "customers/6776452901/campaigns/22209847663",
        "startDate": "2025-02-06",
        "endDate": "2037-12-30"
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
      "segments": {
        "date": "2025-02-07"
      }
    }
  ],
  "campaignId": "22209847663",
  "name": "Spring promotion",
  "publishingStatus": "PAUSED",
  "objective": "SEARCH",
  "startTime": "2025-02-07T07:05:03.891Z",
  "stopTime": "2025-02-10T07:05:03.000Z",
  "leads": "0"
}
```
