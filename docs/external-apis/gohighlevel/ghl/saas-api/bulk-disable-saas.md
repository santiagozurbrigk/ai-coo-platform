---
title: "Disable SaaS for locations"
source: "https://marketplace.gohighlevel.com/docs/ghl/saas-api/bulk-disable-saas"
seccion: "SaaS > SaaS > Disable SaaS for locations"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/saas/bulk-disable-saas/:companyId"
---

# Disable SaaS for locations

```http
POST /saas/bulk-disable-saas/:companyId
```

Disable SaaS for locations for given locationIds

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **companyId** `string` _required_

### Request body (application/json)

**Body required**

- **locationIds** `string[]` _required_ — Location IDs

```json
{
  "locationIds": [
    "locationId1",
    "locationId2"
  ]
}
```

### Response (201 · application/json)

Result of the bulk SaaS disable operation.

**Schema**

- **msg** `string` _required_ — Status message returned by the bulk disable SaaS operation

```json
{
  "msg": "success"
}
```
