---
title: "Update SaaS subscription"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/generate-payment-link"
seccion: "SaaS > SaaS > Update SaaS subscription"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/saas/update-saas-subscription/:locationId"
---

# Update SaaS subscription

```http
PUT /saas/update-saas-subscription/:locationId
```

Update SaaS subscription for given locationId and customerId

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_

### Request body (application/json)

**Body required**

- **subscriptionId** `string` _required_ — Subscription ID
- **customerId** `string` _required_ — Customer ID
- **companyId** `string` _required_ — Company ID

```json
{
  "subscriptionId": "sub_1QDPY5FpU9DlKp7RQ8BXfywx",
  "customerId": "cus_1QDPY5FpU9DlKp7RQ8BXfywx",
  "companyId": "companyId1"
}
```

### Response (200 · application/json)

Acknowledgement that the subscription update has been queued.

**Schema**

- **string** `string`

```json
"subscription update for location: AUKAtFVo0lWezBsBQ3FE is in process"
```
