---
title: "Get locations by stripeId with companyId"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/locations"
seccion: "SaaS > SaaS > Get locations by stripeId with companyId"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/saas/locations"
---

# Get locations by stripeId with companyId

```http
GET /saas/locations
```

Get locations by stripeCustomerId or stripeSubscriptionId with companyId

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **customerId** `string` _required_
- **subscriptionId** `string` _required_

### Response (200 · application/json)

Sub-account (location) IDs matched by the given Stripe identifier.

**Schema**

Array [

- **** `string`

]

```json
[
  "AUKAtFVo0lWezBsBQ3FE"
]
```
