---
title: "Get Google integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-integration"
seccion: "Ad Manager > Google Integration > Get Google integration"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/integration"
---

# Get Google integration

```http
GET /ad-publishing/google/integration
```

Retrieve the Google Ads integration details for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Google Ads integration metadata for the location

**Schema**

- **locationId** `string` _required_ — Location identifier
- **status** `string` _required_ — Connection state. Set to `disconnected` automatically if the selected account is no longer active.
  - Available options: `connected`, `expired`, `disconnected`
- **adAccountId** `string` _required_ — Connected Google Ads customer id, empty string when disconnected
- **createdAt** `string` _required_ — When the integration was created
- **updatedAt** `string` _required_ — When the integration was last updated

```json
{
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "status": "connected",
  "adAccountId": "6776452901",
  "createdAt": "2025-01-08T17:50:37.952Z",
  "updatedAt": "2026-08-11T11:57:25.917Z"
}
```
