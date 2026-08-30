---
title: "Update Design Kit"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/update-design-kit"
seccion: "Brand Boards > Design Kits > Update Design Kit"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PATCH"
path: "/brand-boards/locations/:locationId/design-kits/:designKitId"
---

# Update Design Kit

```http
PATCH /brand-boards/locations/:locationId/design-kits/:designKitId
```

Update a design kit by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — ID of the location that owns the design kit.
- **designKitId** `string` _required_ — ID of the design kit to update.

### Request body (application/json)

**Body required**

- **name** `string` — Display name for the design kit.
- **logos** `object[]` — Logos for the design kit. Sending this field replaces the existing logos. To keep an existing logo, include it with its `id`.
- **colors** `object[]` — Colors for the design kit. Sending this field replaces the existing colors. To keep an existing color, include it with its `id`.
- **fonts** `object[]` — Fonts for the design kit. Sending this field replaces the existing fonts. To keep an existing font, include it with its `id`.

```json
{
  "name": "My Design Kit",
  "logos": [
    {
      "id": "6a1d1e5db5ef0dfa799ed3c9",
      "url": "https://storage.googleapis.com/bucket/logos/my-logo.png",
      "label": "Primary Logo"
    }
  ],
  "colors": [
    {
      "id": "6a1d1e5db5ef0dfa799ed3ca",
      "value": "#FF5733",
      "label": "Brand Orange"
    }
  ],
  "fonts": [
    {
      "id": "6a1d1e5db5ef0dfa799ed3cb",
      "font": "Montserrat",
      "fallback": "sans-serif",
      "label": "Heading Font"
    }
  ]
}
```

### Response (200 · application/json)

Success

**Schema**

- **id** `string` _required_ — Unique identifier of the design kit.
- **name** `string` _required_ — Display name of the design kit.
- **isDefault** `boolean` _required_ — Whether this is the default design kit for the location.
- **createdAt** `string` _required_ — ISO 8601 timestamp of when the design kit was created.
- **updatedAt** `string` _required_ — ISO 8601 timestamp of when the design kit was last updated.
- **locationId** `string` _required_ — ID of the location that owns the design kit.
- **deleted** `boolean` _required_ — Whether the design kit has been soft-deleted.
- **logos** `object[]` — Logos belonging to the design kit.
- **colors** `object[]` — Colors belonging to the design kit.
- **fonts** `object[]` — Fonts belonging to the design kit.
- **traceId** `string` — Trace identifier for the request, useful for debugging and support.

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "My Design Kit",
  "isDefault": false,
  "createdAt": "2024-01-05T12:00:00.000Z",
  "updatedAt": "2024-01-05T12:00:00.000Z",
  "locationId": "oHJiAh0wDG3BzmzACVD6",
  "deleted": false,
  "logos": [
    {
      "id": "6a1d1e5db5ef0dfa799ed3c9",
      "url": "https://storage.googleapis.com/bucket/logos/my-logo.png",
      "label": "Primary Logo"
    }
  ],
  "colors": [
    {
      "id": "6a1d1e5db5ef0dfa799ed3ca",
      "hex": "#FF5733",
      "hexa": "#FF5733FF",
      "rgb": "rgb(255, 87, 51)",
      "rgba": "rgba(255, 87, 51, 1)",
      "label": "Brand Orange"
    }
  ],
  "fonts": [
    {
      "id": "6a1d1e5db5ef0dfa799ed3cb",
      "font": "Montserrat",
      "fallback": "sans-serif",
      "label": "Heading Font"
    }
  ],
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
