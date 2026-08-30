---
title: "Update queue settings or status"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/update-queue"
seccion: "Social Planner > Category Queue > Update queue settings or status"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/social-media-posting/category/queues/:queueId"
---

# Update queue settings or status

```http
PUT /social-media-posting/category/queues/:queueId
```

Updates queue status (active/paused/deleted), time slots, or skip dates.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **queueId** `string` _required_

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **skipLegacyWatermark** `boolean` — Skip legacy watermark cleanup when rescheduling posts
- **status** `object` — Status of the Queue
- **skipDateTime** `string` — Skip Date Time in ISO format
- **timeSlots** `object[]`
- **enableFuturePosts** `boolean` — Enable posting future content. Automatically Queue any New Posts Created in this Category.
- **prioritizeNewContent** `boolean` — Prioritize new content over older content. When true, new items added via directToQueue will be placed at the top of the queue.

```json
{
  "locationId": "609e126a1c4ae1001291e1b5",
  "skipLegacyWatermark": false,
  "status": "paused",
  "skipDateTime": "2023-10-05T14:48:00.000Z",
  "timeSlots": [
    {
      "dayOfWeek": 0,
      "time": "09:00"
    }
  ],
  "enableFuturePosts": true,
  "prioritizeNewContent": false
}
```

### Response (200 · application/json)

Queue updated successfully.

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
    "message": "Queue paused successfully.",
    "queue": {
      "_id": "60af88475f1b2c001f5d5f4b",
      "locationId": "location-123",
      "categoryId": "60af88475f1b2c001f5d5f4b",
      "timeSlots": [
        {
          "dayOfWeek": 0,
          "time": "09:00"
        }
      ],
      "enableFuturePosts": false,
      "prioritizeNewContent": false,
      "currentOrder": 1000,
      "status": "active",
      "startDate": "2023-01-01T12:00:00Z",
      "skipDateTime": [
        "2023-01-02T12:00:00Z"
      ],
      "currentPostId": "60af88475f1b2c001f5d5f4b",
      "totalPosts": 10,
      "lastScheduledTime": "2023-01-01T12:00:00Z",
      "createdBy": "user-123",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  },
  "traceId": "string"
}
```
