---
title: "List watermark templates"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/list-watermark-templates"
seccion: "Social Planner > Watermarks > List watermark templates"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/:locationId/watermarks"
---

# List watermark templates

```http
GET /social-media-posting/:locationId/watermarks
```

Retrieve a paginated list of watermark templates for a specific location. Each template exposes the connected accounts it applies to via `accountIds`. Use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-account) endpoint to look up account IDs.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Query parameters

- **limit** `string` — Maximum number of records to return
- **skip** `string` — Number of records to skip for pagination
- **name** `string` — Search by template name

### Response (200 · application/json)

List of watermark templates

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Paginated list of watermark templates

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Watermark Templates",
  "results": {
    "watermarks": [
      {
        "_id": "665f1bac78fda9b6c5f48012",
        "watermarkImageUrl": "http://example.com/watermark.png",
        "position": "top-left",
        "scale": 0.5,
        "opacity": 0.7,
        "padding": true,
        "templateName": "DefaultTemplate",
        "locationId": "ve9EPM428h8vShlRW1KT",
        "createdBy": "Lx1EI6YIgQYMQi0ytFXv",
        "accountIds": [
          "507f1f77bcf86cd799439011",
          "507f1f77bcf86cd799439012"
        ],
        "deleted": false,
        "createdAt": "2024-07-24T10:21:00.123Z",
        "updatedAt": "2024-07-24T10:21:00.123Z"
      }
    ],
    "meta": {
      "count": 1,
      "usingLegacy": false
    }
  }
}
```
