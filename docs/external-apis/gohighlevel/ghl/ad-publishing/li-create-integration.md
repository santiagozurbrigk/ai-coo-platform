---
title: "Create LinkedIn integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-create-integration"
seccion: "Ad Manager > LinkedIn Integration > Create LinkedIn integration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/linkedin/integration"
---

# Create LinkedIn integration

```http
POST /ad-publishing/linkedin/integration
```

Create a LinkedIn Ads integration for a location with ad account details

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **adAccountId** `string` _required_ — Ad account identifier
- **adAccountName** `string` _required_ — Ad account name
- **currencyCode** `string` _required_ — Currency code
- **organizationId** `string` _required_ — Organization identifier

```json
{
  "locationId": "loc_123",
  "adAccountId": "12345678",
  "adAccountName": "My Ad Account",
  "currencyCode": "USD",
  "organizationId": "12345678"
}
```

### Response (200 · application/json)

The stored integration, same sanitised projection as GET /linkedin/integration

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
