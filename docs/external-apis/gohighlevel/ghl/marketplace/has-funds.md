---
title: "Check if account has sufficient funds"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/has-funds"
seccion: "Developer marketplace > Wallet Charges > Check if account has sufficient funds"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/marketplace/billing/charges/has-funds"
---

# Check if account has sufficient funds

```http
GET /marketplace/billing/charges/has-funds
```

Check if account has sufficient funds

## Request

### Response (200 · application/json)

Returns fund availability status

**Schema**

- **hasFunds** `boolean` — Indicates whether the sub-account has sufficient funds to be charged

```json
{
  "hasFunds": true
}
```
