---
title: "Delete Post"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-post"
seccion: "Social Planner > Post > Delete Post"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/social-media-posting/:locationId/posts/:id"
---

# Delete Post

```http
DELETE /social-media-posting/:locationId/posts/:id
```

Delete Post

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id
- **id** `string` _required_ — Post Id

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
  "message": "Deleted Post",
  "results": {
    "postId": "323534534435"
  }
}
```
