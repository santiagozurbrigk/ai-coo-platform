---
title: "Get ad account details"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-ad-account"
seccion: "Ad Manager > Facebook Integration > Get ad account details"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/ad-accounts/:adAccountId"
---

# Get ad account details

```http
GET /ad-publishing/facebook/ad-accounts/:adAccountId
```

Retrieve details of a specific Facebook ad account

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adAccountId** `string` _required_ — Ad account identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Details for a single ad account

**Schema**

- **id** `string` _required_ — Ad account id, prefixed with `act_`
- **name** `string` _required_ — Ad account name
- **accountStatus** `string` _required_ — Account status
- **currency** `string` _required_ — Account billing currency, ISO 4217
- **fundingType** `string` _required_ — How the account is funded
- **timezoneName** `string` _required_ — IANA timezone the account reports in
- **business** `object` — Owning Business Manager

```json
{
  "id": "act_357046700569338",
  "name": "Acme - Production",
  "accountStatus": "ACTIVE",
  "currency": "USD",
  "fundingType": "FACEBOOK_EXTENDED_CREDIT",
  "timezoneName": "America/Los_Angeles",
  "business": {
    "id": "153049965367635",
    "name": "Acme Marketing"
  }
}
```
