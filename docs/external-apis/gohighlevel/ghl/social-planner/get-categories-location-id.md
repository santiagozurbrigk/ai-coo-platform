---
title: "Get categories by location id"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-categories-location-id"
seccion: "Social Planner > Category > Get categories by location id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/:locationId/categories"
---

# Get categories by location id

```http
GET /social-media-posting/:locationId/categories
```

Retrieve all categories for a specific location with optional search and pagination

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
  "message": "Fetched Categories by Location ID",
  "results": {
    "count": 3,
    "categories": [
      {
        "name": "Primary",
        "primaryColor": "#FFFFFF",
        "secondaryColor": "#FFFFFF",
        "locationId": "Lx1EI6YIgQYMQi0ytFXv",
        "_id": "Lx1EI6YIgQYMQi0ytFXv",
        "createdBy": "Lx1EI6YIgQYMQi0ytFXv",
        "deleted": false,
        "createdAt": "2023-08-02T00:00:00.000Z",
        "updatedAt": "2023-08-02T00:00:00.000Z"
      }
    ]
  }
}
```
