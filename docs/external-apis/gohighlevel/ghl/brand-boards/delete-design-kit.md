---
title: "Delete Design Kit"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/delete-design-kit"
seccion: "Brand Boards > Design Kits > Delete Design Kit"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/brand-boards/locations/:locationId/design-kits/:designKitId"
---

# Delete Design Kit

```http
DELETE /brand-boards/locations/:locationId/design-kits/:designKitId
```

Delete a design kit by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — ID of the location that owns the design kit.
- **designKitId** `string` _required_ — ID of the design kit to delete.

### Response (200 · application/json)

Success

**Schema**

- **deleted** `boolean` _required_ — Whether the design kit was successfully deleted.
- **traceId** `string` — Trace identifier for the request, useful for debugging and support.

```json
{
  "deleted": true,
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
