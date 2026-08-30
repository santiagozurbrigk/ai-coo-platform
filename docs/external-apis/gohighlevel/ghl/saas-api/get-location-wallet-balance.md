---
title: "Get Location Wallet Balance"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-location-wallet-balance"
seccion: "SaaS > SaaS > Get Location Wallet Balance"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/saas/companies/:companyId/locations/:locationId/wallet-balance"
---

# Get Location Wallet Balance

```http
GET /saas/companies/:companyId/locations/:locationId/wallet-balance
```

Fetch the wallet balance for a specific location. Returns a resource object with balance details.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **companyId** `string` _required_ — Company ID that owns the location
- **locationId** `string` _required_ — Location ID to get wallet balance for

### Response (200 · application/json)

Location wallet balance retrieved successfully

**Schema**

- **walletId** `string` _required_ — Wallet Id
- **balance** `number` _required_ — Current wallet balance
- **complimentaryCredits** `number` _required_ — Complimentary credits amount

```json
{
  "walletId": "xyz789",
  "balance": 1500.5,
  "complimentaryCredits": 100
}
```
