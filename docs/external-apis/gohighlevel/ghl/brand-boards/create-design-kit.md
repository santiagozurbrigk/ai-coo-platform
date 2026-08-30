---
title: "Create Design Kit"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/create-design-kit"
seccion: "Brand Boards > Design Kits > Create Design Kit"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/brand-boards/locations/:locationId/design-kits"
---

# Create Design Kit

```http
POST /brand-boards/locations/:locationId/design-kits
```

Create a design kit for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — ID of the location where the design kit will be created.

### Request body (application/json)

**Body required**

- **name** `string` — Display name for the design kit.
- **logos** `object[]` — Logos to include in the design kit.
- **colors** `object[]` — Colors to include in the design kit.
- **fonts** `object[]` — Fonts to include in the design kit.
- **type** `string` — How the design kit should be initialized. Use `blank` for an empty kit, or `url` to extract branding from a website (requires `url`).
  - Available options: `blank`, `url`
- **url** `string` — Website URL to extract branding from. Required when `type` is `url`.

```json
{
  "name": "My Design Kit",
  "logos": [
    {
      "url": "https://storage.googleapis.com/bucket/logos/my-logo.png",
      "label": "Primary Logo"
    }
  ],
  "colors": [
    {
      "value": "#FF5733",
      "label": "Brand Orange"
    }
  ],
  "fonts": [
    {
      "font": "Montserrat",
      "fallback": "sans-serif",
      "label": "Heading Font"
    }
  ],
  "type": "blank",
  "url": "https://example.com"
}
```

### Response (201 · application/json)

Created

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
