---
title: "Get Location Subscription Details"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/get-location-subscription"
seccion: "SaaS > SaaS > Get Location Subscription Details"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/saas/get-saas-subscription/:locationId"
---

# Get Location Subscription Details

```http
GET /saas/get-saas-subscription/:locationId
```

Fetch subscription details for a specific location from location metadata

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_

### Query parameters

- **companyId** `string` _required_

### Response (200 · application/json)

Subscription details for the sub-account.

**Schema**

- **locationId** `string` _required_ — Location ID
- **isSaaSV2** `boolean` _required_ — Indicates if the SaaS is V2
- **companyId** `string` _required_ — Company ID
- **saasMode** `string` — SaaS mode
- **subscriptionId** `string` — Subscription ID
- **customerId** `string` — Customer ID
- **productId** `string` — Product ID
- **priceId** `string` — Price ID
- **saasPlanId** `string` — SaaS plan ID
- **subscriptionStatus** `string` — Subscription status

```json
{
  "locationId": "locationId1",
  "isSaaSV2": true,
  "companyId": "companyId1",
  "saasMode": "saasV2",
  "subscriptionId": "subscriptionId1",
  "customerId": "customerId1",
  "productId": "productId1",
  "priceId": "priceId1",
  "saasPlanId": "saasPlanId1",
  "subscriptionStatus": "active"
}
```
