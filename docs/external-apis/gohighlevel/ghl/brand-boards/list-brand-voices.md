---
title: "List Brand Voices"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/list-brand-voices"
seccion: "Brand Boards > Brand Voices > List Brand Voices"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/brand-boards/locations/:locationId/brand-voices"
---

# List Brand Voices

```http
GET /brand-boards/locations/:locationId/brand-voices
```

Get list of brand voices for a location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID

### Query parameters

- **limit** `number` — Number of brand voices to return. Defaults to 10, minimum is 1, maximum is 20 **Possible values:** `>= 1` and `<= 20`

  Default value:

  `10`

- **offset** `number` — Number of brand voices to skip for pagination. Defaults to 0, minimum is 0 **Possible values:** `>= 0`

  Default value:

  `0`

- **search** `string` — Search text for brand voice name
- **deleted** `boolean` — Whether to return deleted brand voices. Defaults to false

  Default value:

  `false`

### Response (200 · application/json)

Success

**Schema**

- **items** `object[]` _required_ — List of brand voices
- **total** `number` _required_ — Total count of brand voices
- **traceId** `string` — Trace ID of request

```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "My Brand Voice",
      "isDefault": false,
      "createdAt": "2024-01-05T12:00:00.000Z",
      "updatedAt": "2024-01-05T12:00:00.000Z"
    }
  ],
  "total": 25,
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```
