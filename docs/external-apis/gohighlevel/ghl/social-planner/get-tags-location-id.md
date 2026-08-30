---
title: "Get tags by location id"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-tags-location-id"
seccion: "Social Planner > Tag > Get tags by location id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/:locationId/tags"
---

# Get tags by location id

```http
GET /social-media-posting/:locationId/tags
```

Retrieve all tags for a specific location with optional search and pagination

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Query parameters

- **searchText** `string` — Search text string
- **limit** `string` — Limit
- **skip** `string` — Skip

### Response (200 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Fetched Tags by Location ID",
  "results": {
    "tags": [
      {
        "tag": "Primary Tag",
        "locationId": "Lx1EI6YIgQYMQi0ytFXv",
        "_id": "Lx1EI6YIgQYMQi0ytFXv",
        "createdBy": "Lx1EI6YIgQYMQi0ytFXv",
        "deleted": false,
        "createdAt": "2023-08-02T00:00:00.000Z",
        "updatedAt": "2023-08-02T00:00:00.000Z"
      }
    ],
    "count": 3
  }
}
```
