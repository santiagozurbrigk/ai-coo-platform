---
title: "Get Permissions"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/get-location-permissions"
seccion: "Sub-Account (Formerly location) > Permissions > Get Permissions"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/locations/:locationId/permissions"
---

# Get Permissions

```http
GET /locations/:locationId/permissions
```

Get Sub-Account (Formerly Location) permissions

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Response (200 · application/json)

Successful response

**Schema**

- **permissions** `string[]` _required_ — Enabled permission names for the sub-account
  - Available options: `2-way-text-messaging`, `gmb-messaging`, `web-chat`, `reputation-management`, `facebook-messenger`, `gmb-call-tracking`, `missed-call-text-back`, `text-to-pay`, `calendar`, `crm`, `opportunities`, `email-marketing`

```json
{
  "permissions": [
    "crm",
    "workflow"
  ]
}
```
