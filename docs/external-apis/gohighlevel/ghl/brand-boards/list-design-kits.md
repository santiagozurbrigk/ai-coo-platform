---
title: "List Design Kits"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/list-design-kits"
seccion: "Brand Boards > Design Kits > List Design Kits"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/brand-boards/locations/:locationId/design-kits"
---

# List Design Kits

```http
GET /brand-boards/locations/:locationId/design-kits
```

Get list of design kits for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — ID of the location to list design kits for.

### Query parameters

- **limit** `number` — Maximum number of design kits to return. **Possible values:** `>= 1` and `<= 20`

  Default value:

  `10`

- **offset** `number` — Number of design kits to skip for pagination. **Possible values:** `>= 0`

  Default value:

  `0`

- **search** `string` — Filter results by design kit name (case-insensitive partial match).
- **deleted** `boolean` — Include soft-deleted design kits in the results.

  Default value:

  `false`

### Response (200 · application/json)

Success

**Schema**

- **items** `object[]` _required_ — List of design kits for the current page.
- **total** `number` _required_ — Total number of design kits matching the query.
- **traceId** `string` — Trace identifier for the request, useful for debugging and support.

```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "My Design Kit",
      "isDefault": false,
      "createdAt": "2024-01-05T12:00:00.000Z",
      "updatedAt": "2024-01-05T12:00:00.000Z"
    }
  ],
  "total": 25,
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
