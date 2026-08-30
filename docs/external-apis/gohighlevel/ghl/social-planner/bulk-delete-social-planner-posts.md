---
title: "Bulk Delete Social Planner Posts"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/bulk-delete-social-planner-posts"
seccion: "Social Planner > Post > Bulk Delete Social Planner Posts"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/:locationId/posts/bulk-delete"
---

# Bulk Delete Social Planner Posts

```http
POST /social-media-posting/:locationId/posts/bulk-delete
```

Deletes multiple posts based on the provided list of post IDs. This operation is useful for clearing up large numbers of posts efficiently.

Note:

1.The maximum number of posts that can be deleted in a single request is '50'.

2.However, It will only get deleted in CRM database but still it is recommended to be cautious of this operation.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **postIds** `string[]` — Requested Results

```json
{
  "postIds": [
    "662791ee3f216822d7da0c8c"
  ]
}
```

### Response (201 · application/json)

Posts deleted successfully

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** _required_ — Message and deleted count

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Posts Deleted Successfully",
  "results": "{ message: \"Posts deleted successfully\", deletedCount: 10 }"
}
```
