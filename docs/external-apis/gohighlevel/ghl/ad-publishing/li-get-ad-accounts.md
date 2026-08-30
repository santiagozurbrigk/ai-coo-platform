---
title: "Get LinkedIn ad accounts"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-get-ad-accounts"
seccion: "Ad Manager > LinkedIn Integration > Get LinkedIn ad accounts"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/ad-accounts"
---

# Get LinkedIn ad accounts

```http
GET /ad-publishing/linkedin/ad-accounts
```

Retrieve LinkedIn Ads accounts available for the connected user

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Ad accounts the connected user can access

**Schema**

  Array [

  ]

```json
[
  {
    "id": 556129919,
    "name": "Acme Test Account",
    "status": "ACTIVE",
    "currency": "USD",
    "servingStatuses": [
      "RUNNABLE"
    ],
    "organizationId": "urn:li:organization:2414183"
  }
]
```
