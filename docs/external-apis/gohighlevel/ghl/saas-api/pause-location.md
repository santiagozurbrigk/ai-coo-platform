---
title: "Pause location"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/pause-location"
seccion: "SaaS > SaaS > Pause location"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/pause/:locationId"
---

# Pause location

```http
POST /saas/pause/:locationId
```

Pause Sub account for given locationId

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_

### Request body (application/json)

**Body required**

- **paused** `boolean` _required_ — Paused
- **companyId** `string` _required_ — Company ID

```json
{
  "paused": true,
  "companyId": "companyId1"
}
```

### Response (201 · application/json)

True when the pause/resume request was accepted.

**Schema**

- **boolean** `boolean`
