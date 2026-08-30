---
title: "Bulk Enable SaaS"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/bulk-enable-saas"
seccion: "SaaS > SaaS > Bulk Enable SaaS"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/bulk-enable-saas/:companyId"
---

# Bulk Enable SaaS

```http
POST /saas/bulk-enable-saas/:companyId
```

Enable SaaS mode for multiple locations with support for both SaaS v1 and v2

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **companyId** `string` _required_

### Request body (application/json)

**Body required**

- **locationIds** `string[]` _required_ — Array of location IDs to enable SaaS for
- **isSaaSV2** `boolean` _required_ — Indicates if the SaaS is V2
- **actionPayload** `object` _required_ — Action payload for the bulk enable SaaS operation

```json
{
  "locationIds": [
    "locationId1",
    "locationId2"
  ],
  "isSaaSV2": true,
  "actionPayload": {
    "priceId": "price_1QDPY5FpU9DlKp7RQ8BXfywx",
    "stripeAccountId": "acct_1QDPY5FpU9DlKp7RQ8BXfywx",
    "saasPlanId": "66c4d36534f21f900dc2a265",
    "providerLocationId": "r06mdj4OrrERzYDvsOdh"
  }
}
```

### Response (201 · application/json)

Result of the bulk SaaS enable operation.

**Schema**

- **success** `boolean` _required_ — Indicates if the bulk enable SaaS operation was successful
- **message** `string` _required_ — Message indicating the bulk enable SaaS operation
- **bulkActionUrl** `string` — URL for the bulk enable SaaS operation

```json
{
  "success": true,
  "message": "Bulk enable SaaS operation completed successfully",
  "bulkActionUrl": "https://example.com/bulk-enable-saas"
}
```
