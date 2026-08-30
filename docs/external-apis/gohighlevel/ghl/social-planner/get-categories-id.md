---
title: "Get categories by id"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-categories-id"
seccion: "Social Planner > Category > Get categories by id"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/:locationId/categories/:id"
---

# Get categories by id

```http
GET /social-media-posting/:locationId/categories/:id
```

Retrieve a specific category by its ID

## Request

### Header parameters

- **Authorization** `string` _required_ — Access Token
- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **id** `string` _required_ — Category Id
- **locationId** `string` _required_ — Location Id

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
  "message": "Fetched Category",
  "results": {
    "category": {
      "name": "Primary",
      "primaryColor": "#32a852",
      "secondaryColor": "#32a852",
      "locationId": "Lx1EI6YIgQYMQi0ytFXv",
      "_id": "Lx1EI6YIgQYMQi0ytFXv",
      "createdBy": "Lx1EI6YIgQYMQi0ytFXv",
      "deleted": false,
      "message": "Category not found",
      "createdAt": "2023-08-02T00:00:00.000Z",
      "updatedAt": "2023-08-02T00:00:00.000Z"
    }
  }
}
```
