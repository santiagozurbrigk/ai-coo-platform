---
title: "Delete an active post and schedule the next one"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-current-active-post-and-schedule-next"
seccion: "Social Planner > Category Queue > Delete an active post and schedule the next one"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/social-media-posting/category/queues/:postId/active-post"
---

# Delete an active post and schedule the next one

```http
DELETE /social-media-posting/category/queues/:postId/active-post
```

Deletes a post that is currently scheduled and automatically triggers the scheduling of the next available post in the queue.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **postId** `string` _required_

### Query parameters

- **locationId** `string` _required_ — Location ID

### Response (200 · application/json)

Successfully deleted the active post and scheduled the next one.

**Schema**

- **success** `boolean` _required_
- **statusCode** `number` _required_
- **results** `object` _required_
- **traceId** `string`

```json
{
  "success": true,
  "statusCode": 200,
  "results": {
    "message": "Current post deleted and next post scheduled successfully"
  },
  "traceId": "string"
}
```
