---
title: "Get ad accounts"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-ad-accounts"
seccion: "Ad Manager > Facebook Integration > Get ad accounts"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/ad-accounts"
---

# Get ad accounts

```http
GET /ad-publishing/facebook/ad-accounts
```

Retrieve Facebook ad accounts available for the connected user

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` — Account source type
  - Available options: `INTEGRATION`, `AD_MANAGER`
- **next** `string` — Pagination cursor
- **fetchAll** `string` — Fetch all accounts
- **limit** `string` — Results page limit

### Response (200 · application/json)

Ad accounts the connected user can access

**Schema**

  Array [

  ]

```json
[
  {
    "id": "act_357046700569338",
    "name": "Acme - Production",
    "accountStatus": "ACTIVE",
    "currency": "USD",
    "fundingType": "FACEBOOK_EXTENDED_CREDIT",
    "business": {
      "id": "153049965367635",
      "name": "Acme Marketing"
    },
    "integrationConnected": false
  }
]
```
