---
title: "Set Default Design Kit"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/set-default-design-kit"
seccion: "Brand Boards > Design Kits > Set Default Design Kit"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/brand-boards/locations/:locationId/design-kits/:designKitId/default"
---

# Set Default Design Kit

```http
POST /brand-boards/locations/:locationId/design-kits/:designKitId/default
```

Set a design kit as the default for a location. The previous default will be unset.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — ID of the location that owns the design kit.
- **designKitId** `string` _required_ — ID of the design kit to set as default.

### Response (200 · application/json)

Success

**Schema**

- **success** `boolean` _required_ — Whether the default was set successfully.
- **designKitId** `string` _required_ — ID of the design kit that is now the default.
- **traceId** `string` — Trace identifier for the request, useful for debugging and support.

```json
{
  "success": true,
  "designKitId": "507f1f77bcf86cd799439011",
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
