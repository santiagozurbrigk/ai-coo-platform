---
title: "Update Rebilling"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/update-rebilling"
seccion: "SaaS > SaaS > Update Rebilling"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/update-rebilling/:companyId"
---

# Update Rebilling

```http
POST /saas/update-rebilling/:companyId
```

Bulk update rebilling for given locationIds

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **companyId** `string` _required_

### Request body (application/json)

**Body required**

- **product** `string` _required_ — The product to update rebilling for
  - Available options: `workflow_premium_actions`, `EmailVerification`, `contentAI`, `workflow_ai`, `whatsApp`, `reviewsAI`, `domainPurchase`, `funnelAI`, `agentStudio`, `askai`, `aiStudio`, `conversation_AI`
- **locationIds** `string[]` _required_ — Array of location IDs to update rebilling for
- **config** `object` _required_ — Configuration for rebilling settings

```json
{
  "product": "contentAI",
  "locationIds": [
    "zzyG7A4x6bRJl5SlhQhH",
    "Vygq7VgXCDfg3xnl8TBR"
  ],
  "config": {
    "optIn": true,
    "enabled": true,
    "markup": 5
  }
}
```

### Response (201 · application/json)

Result of the bulk rebilling update.

**Schema**

- **success** `boolean` _required_ — Indicates if the rebilling update was successful
- **location_updated** `string[]` _required_ — IDs of the sub-accounts whose rebilling was updated
- **message** `string` — Human-readable summary of the outcome (present on success/partial updates)
- **error** `string` _required_ — Reason some or all locations failed to update; null on full success

```json
{
  "success": true,
  "location_updated": [
    "AUKAtFVo0lWezBsBQ3FE"
  ],
  "message": "Rebilling updated for 3 locations.",
  "error": "Saas Mode not activated"
}
```
