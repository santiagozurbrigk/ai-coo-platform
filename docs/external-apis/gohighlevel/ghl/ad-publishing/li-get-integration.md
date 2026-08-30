---
title: "Get LinkedIn integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-get-integration"
seccion: "Ad Manager > LinkedIn Integration > Get LinkedIn integration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/integration"
---

# Get LinkedIn integration

```http
GET /ad-publishing/linkedin/integration
```

Retrieve the LinkedIn Ads integration details for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

LinkedIn integration metadata for the location

**Schema**

- **locationId** `string` _required_ — Location identifier
- **status** `string` _required_ — Connection state
  - Available options: `connected`, `expired`, `disconnected`
- **adAccountId** `string` — Connected LinkedIn ad account id
- **currencyCode** `string` — Account billing currency, ISO 4217
- **organizationId** `string` — Organization URN the ad account belongs to
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "status": "connected",
  "adAccountId": "556129919",
  "currencyCode": "USD",
  "organizationId": "urn:li:organization:2414183",
  "createdAt": "2025-01-08T17:50:37.952Z",
  "updatedAt": "2026-08-19T08:12:05.304Z"
}
```
