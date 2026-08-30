---
title: "Allow Attach Rebilling"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/allow-attach-rebilling"
seccion: "SaaS > SaaS > Allow Attach Rebilling"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/allow-attach-rebilling/:locationId"
---

# Allow Attach Rebilling

```http
POST /saas/allow-attach-rebilling/:locationId
```

Marks a SaaS sub-account as awaiting rebilling attach and optionally stores the rebilling configuration that should be applied when the rebilling config is created. Sets payment_pending on the sub-account. Only allowed when the sub-account is in setup_pending state.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID (Sub-account) to allow attach rebilling for

### Request body (application/json)

**Body required**

- **companyId** `string` _required_ — Company ID owning the location
- **attachedRebillingConfig** `object` — Map of rebilling product code to its config. When provided, this gets stored on the sub-account so it can be applied when the rebilling config is created. Omit to only mark the sub-account as awaiting rebilling attach without any pre-configured products. Possible product keys: `contentAI`, `workflow_premium_actions`, `workflow_ai`, `conversationAI`, `whatsApp`, `reviewsAI`, `EmailVerification`, `funnelAI`, `domainPurchase`, `Phone`, `Email`, `agentStudio`, `askai`, `aiStudio`.

```json
{
  "companyId": "5DP4iH6HLkQsiKESj6rh",
  "attachedRebillingConfig": {
    "EmailVerification": {
      "enabled": true,
      "markup": 4,
      "price": 0.0025
    },
    "Phone": {
      "enabled": true,
      "markup": 3
    },
    "agentStudio": {
      "enabled": true,
      "markup": 8,
      "price": 0.25
    },
    "contentAI": {
      "enabled": true,
      "markup": 5,
      "price": 0.09
    },
    "domainPurchase": {
      "enabled": true,
      "markup": 3
    }
  }
}
```

### Response (200 · application/json)

Allow attach rebilling completed successfully

**Schema**

- **success** `boolean` _required_ — Indicates if the allow attach rebilling operation succeeded
- **locationId** `string` _required_ — Location ID the rebilling config was attached to
- **attachedRebillingConfig** `object` _required_ — Stored rebilling configuration on the location. Markup is the internal percentage value converted from the request multiplier (e.g. 4 -> 300%, 3 -> 200%).

```json
{
  "success": true,
  "locationId": "AUKAtFVo0lWezBsBQ3FE",
  "attachedRebillingConfig": {
    "EmailVerification": {
      "enabled": true,
      "markup": 300,
      "price": 0.0025
    },
    "Phone": {
      "enabled": true,
      "markup": 200
    }
  }
}
```
