---
title: "Get tags by ids"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-tags-by-ids"
seccion: "Social Planner > Tag > Get tags by ids"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/:locationId/tags/details"
---

# Get tags by ids

```http
POST /social-media-posting/:locationId/tags/details
```

Retrieve specific tags by their IDs

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **tagIds** `string[]` _required_ — Array of Tag Ids

```json
{
  "tagIds": [
    "65fbdcfecc884f07e645ea8b"
  ]
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Fetched Tags by Tag IDs",
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
