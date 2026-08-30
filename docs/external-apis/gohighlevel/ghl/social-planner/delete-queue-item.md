---
title: "Delete an item from a queue"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-queue-item"
seccion: "Social Planner > Category Queue > Delete an item from a queue"
api_version: "v3"
capturado: "2026-08-30"
metodo: "DELETE"
path: "/social-media-posting/category/queues/:queueId/items/:itemId"
---

# Delete an item from a queue

```http
DELETE /social-media-posting/category/queues/:queueId/items/:itemId
```

Deletes an item from a specific category queue.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **queueId** `string` _required_
- **itemId** `string` _required_

### Query parameters

- **locationId** `string` _required_ — Location ID
- **sessionId** `string` — Edit session ID

### Response (200 · application/json)

The queue item has been successfully deleted.

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
    "message": "The queue item has been successfully deleted.",
    "updatedSlots": [
      {
        "itemId": "60af88475f1b2c001f5d5f4b",
        "scheduledDateTime": "2023-10-15T10:00:00.000Z",
        "isSkipped": false
      }
    ],
    "totalPostsChanged": 5
  },
  "traceId": "string"
}
```
