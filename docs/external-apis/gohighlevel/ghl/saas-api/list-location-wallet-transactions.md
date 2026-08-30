---
title: "List location wallet transactions"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/list-location-wallet-transactions"
seccion: "SaaS > SaaS > List location wallet transactions"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/locations/:locationId/wallet-transactions"
---

# List location wallet transactions

```http
POST /saas/locations/:locationId/wallet-transactions
```

Fetch paginated wallet transactions for a sub-account (location). Supports skip/limit pagination, date-range and charge-type filters, timezone normalization, and additional non-indexed filters in the request body.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID to list transactions for

### Request body (application/json)

**Body required**

- **skip** `number` — Number of records to skip for pagination. Defaults to 0 when omitted. **Possible values:** `>= 0`
- **limit** `number` — Maximum number of records to return. Capped at 1000 per request. **Possible values:** `>= 0` and `<= 1000`
- **filters** `object` — Transaction filters
- **timezone** `string` — Timezone for date normalization
- **users** `array[]` — User identifiers to scope transaction results
- **additionalFilter** `object` — Additional non-indexed filters

```json
{
  "skip": 0,
  "limit": 100,
  "filters": {
    "locationId": "AUKAtFVo0lWezBsBQ3FE",
    "settlementTime": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-03-31T23:59:59.999Z"
    },
    "chargeType": "Email"
  },
  "timezone": "UTC",
  "users": [
    null
  ],
  "additionalFilter": {
    "messageId": "msg_123"
  }
}
```

### Response (200 · application/json)

Wallet transactions retrieved successfully

**Schema**

- **transactions** `array[]` _required_ — Flat list of normalized wallet transaction records returned from blade-platform

```json
{
  "transactions": [
    null
  ]
}
```
