---
title: "Remove attached config"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/remove-attached-config"
seccion: "SaaS > SaaS > Remove attached config"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/remove-attached-config/:locationId"
---

# Remove attached config

```http
POST /saas/remove-attached-config/:locationId
```

Clears attached SaaS plan (attachPlanId/attachPriceId) and/or attached rebilling config from a sub-account in setup_pending, and sets suspendedInfo.payment_pending to false.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID (Sub-account) to remove attached config from

### Request body (application/json)

**Body required**

- **companyId** `string` _required_ — Company ID owning the location

```json
{
  "companyId": "5DP4iH6HLkQsiKESj6rh"
}
```

### Response (200 · application/json)

Attached config removed successfully

**Schema**

- **success** `boolean` _required_ — Indicates if the remove attached config operation succeeded
- **locationId** `string` _required_ — Location ID the attached config was removed from
- **removedAttachedPlan** `boolean` _required_ — Whether an attached SaaS plan was cleared
- **removedAttachedRebilling** `boolean` _required_ — Whether attached rebilling config was cleared

```json
{
  "success": true,
  "locationId": "AUKAtFVo0lWezBsBQ3FE",
  "removedAttachedPlan": true,
  "removedAttachedRebilling": false
}
```
