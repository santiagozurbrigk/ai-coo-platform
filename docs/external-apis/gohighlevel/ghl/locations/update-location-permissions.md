---
title: "Update Permissions"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/update-location-permissions"
seccion: "Sub-Account (Formerly location) > Permissions > Update Permissions"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/locations/:locationId/permissions"
---

# Update Permissions

```http
PUT /locations/:locationId/permissions
```

Update Sub-Account (Formerly Location) permissions

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **permissions** `string[]` _required_ — Permission plan values to apply for the sub-account
  - Available options: `2-way-text-messaging`, `gmb-messaging`, `web-chat`, `reputation-management`, `facebook-messenger`, `gmb-call-tracking`, `missed-call-text-back`, `text-to-pay`, `calendar`, `crm`, `opportunities`, `email-marketing`

```json
{
  "permissions": [
    "crm",
    "workflow"
  ]
}
```

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
