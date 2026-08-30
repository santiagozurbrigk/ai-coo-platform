---
title: "Get all wallet charges"
source: "https://marketplace.gohighlevel.com/docs/ghl/marketplace/get-charges"
seccion: "Developer marketplace > Wallet Charges > Get all wallet charges"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/marketplace/billing/charges"
---

# Get all wallet charges

```http
GET /marketplace/billing/charges
```

Get all wallet charges

## Request

### Query parameters

- **meterId** `string` — Billing Meter ID (you can find this on your app's pricing page on the developer portal)
- **eventId** `string` — Event ID / Transaction ID
- **userId** `string` — Filter results by User ID that your server passed via API when the charge was created
- **startDate** `string` — Filter results AFTER a specific date. Use this in combination with endDate to filter results in a specific time window.
- **endDate** `string` — Filter results BEFORE a specific date. Use this in combination with startDate to filter results in a specific time window.
- **skip** `number` — Number of records to skip
- **limit** `number` — Maximum number of records to return

### Response (200 · application/json)

Returns list of wallet charges

**Schema**

- **charges** `object[]` — List of wallet charges
- **count** `number` — Total number of charges
- **pagination** `object` — Pagination metadata for the charges list

```json
{
  "charges": [],
  "pagination": {
    "total": 100,
    "skip": 0,
    "limit": 10
  }
}
```
