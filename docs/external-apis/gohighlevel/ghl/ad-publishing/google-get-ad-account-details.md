---
title: "Get ad account details"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-ad-account-details"
seccion: "Ad Manager > Google Integration > Get ad account details"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/google/ad-accounts/:adAccountId"
---

# Get ad account details

```http
GET /ad-publishing/google/ad-accounts/:adAccountId
```

Retrieve details of a specific Google Ads account

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adAccountId** `string` _required_ — Ad account identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

Details for a single Google Ads account

**Schema**

- **resourceName** `string` — Google Ads resource name
- **id** `string` — Google Ads customer id
- **descriptiveName** `string` — Account display name
- **currencyCode** `string` — Account billing currency, ISO 4217
- **status** `string` — Google Ads account status
- **paymentStatus** `string` _required_ — Billing setup status, resolved by preferring APPROVED over APPROVED_HELD, PENDING then CANCELLED. `NO_PAYMENT_METHOD` means no billing setup was found.
  - Available options: `APPROVED`, `APPROVED_HELD`, `PENDING`, `CANCELLED`, `NO_PAYMENT_METHOD`
- **email** `string` — Email of a user with access to the account. Absent when Google returns no customer_user_access row, which is common for MCC-managed child accounts.

```json
{
  "resourceName": "customers/6776452901",
  "id": "6776452901",
  "descriptiveName": "Acme Test Account",
  "currencyCode": "USD",
  "status": "ENABLED",
  "paymentStatus": "APPROVED",
  "email": "[email protected]"
}
```
