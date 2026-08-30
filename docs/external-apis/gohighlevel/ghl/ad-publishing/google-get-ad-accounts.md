---
title: "Get Google ad accounts"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-ad-accounts"
seccion: "Ad Manager > Google Integration > Get Google ad accounts"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/ad-accounts"
---

# Get Google ad accounts

```http
GET /ad-publishing/google/ad-accounts
```

Retrieve Google Ads accounts available for the connected user

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **type** `string` — Account type
  - Available options: `INTEGRATION`, `AD_MANAGER`

### Response (200 · application/json)

Ad accounts, shaped by `type`. `INTEGRATION` resolves each account from Google and returns its billing status, name, and connection flag; `AD_MANAGER` reads the location's stored integrations and returns only `accId` and `mccId`.

**Schema**

  Array [

  ]

```json
[
  {
    "accId": "6776452901",
    "mccId": "6776452901",
    "paymentStatus": "APPROVED",
    "name": "Acme Test Account",
    "email": "[email protected]",
    "status": "ENABLED",
    "integrationConnected": true
  },
  {
    "accId": "6776452901",
    "mccId": "6776452901"
  }
]
```
