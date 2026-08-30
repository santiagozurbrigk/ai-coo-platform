---
title: "Delete CSV Post"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-csv-post"
seccion: "Social Planner > CSV > Delete CSV Post"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/social-media-posting/:locationId/csv/:csvId/post/:postId"
---

# Delete CSV Post

```http
DELETE /social-media-posting/:locationId/csv/:csvId/post/:postId
```

Delete a specific post from a CSV import

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **postId** `string` _required_ — CSV Post Id
- **csvId** `string` _required_ — CSV Id

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
  "message": "Deleted CSV Post",
  "results": {
    "postId": "65f92e55cc884f0d0845e447",
    "csv": {
      "_id": "65f92e55cc884f0d0845e447",
      "status": "completed"
    }
  }
}
```
