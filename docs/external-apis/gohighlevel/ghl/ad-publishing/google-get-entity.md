---
title: "Get entities"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-entity"
seccion: "Ad Manager > Google Ads > Get entities"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/entity"
---

# Get entities

```http
GET /ad-publishing/google/entity
```

Retrieve Google campaigns, ad groups, or ads based on entity type

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` _required_ — Integration type
  - Available options: `AD_MANAGER`, `INTEGRATION`
- **campaignId** `string` — Campaign identifier
- **adGroupId** `string` — Ad group identifier
- **entityType** `string` _required_ — Entity type
  - Available options: `CAMPAIGN`, `ADGROUP`, `AD`
- **searchId** `string` — Comma-separated Google Ads IDs to filter by
- **startDate** `string` — Filter start date
- **endDate** `string` — Filter end date
- **selectedAdAccountId** `string` — Selected ad account ID

### Response (200 · application/json)

A { data } envelope whose items follow entityType — campaigns, ad groups, or ads

**Schema**

- **data** `object[]`

```json
{
  "data": [
    {
      "resourceName": "customers/6776452901/campaigns/22173400513",
      "id": "22173400513",
      "name": "Spring promotion",
      "status": "PAUSED"
    },
    {
      "resourceName": "customers/6776452901/adGroups/175603784313",
      "id": "175603784313",
      "name": "Ad Group 1",
      "status": "ENABLED"
    },
    {
      "resourceName": "customers/6776452901/ads/730847006298",
      "id": "730847006298",
      "name": "Ad - 730847006298",
      "type": "RESPONSIVE_SEARCH_AD"
    }
  ]
}
```
