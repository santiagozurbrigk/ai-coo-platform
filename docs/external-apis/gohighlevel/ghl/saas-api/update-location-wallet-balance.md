---
title: "Update Location Wallet Balance"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/update-location-wallet-balance"
seccion: "SaaS > SaaS > Update Location Wallet Balance"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/companies/:companyId/locations/:locationId/wallet-balance/complimentary-credits"
---

# Update Location Wallet Balance

```http
POST /saas/companies/:companyId/locations/:locationId/wallet-balance/complimentary-credits
```

Update the wallet balance or complimentary credit settings for a specific location. Supports partial updates via updateMask field (AIP-134 compliant).

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **companyId** `string` _required_ — Company ID that owns the location
- **locationId** `string` _required_ — Location ID to update wallet balance for

### Request body (application/json)

**Body required**

- **complimentaryCreditsAmount** `number` — Credit amount to be added

```json
{
  "complimentaryCreditsAmount": 100
}
```

### Response (200 · application/json)

Location wallet balance updated successfully

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
