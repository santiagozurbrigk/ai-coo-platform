---
title: "Create a new category queue"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-queue"
seccion: "Social Planner > Category Queue > Create a new category queue"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/category/queues"
---

# Create a new category queue

```http
POST /social-media-posting/category/queues
```

Creates a queue in draft status for a category. Published posts are auto-added. Use update endpoint to activate.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **categoryId** `string` _required_ — Category ID
- **timeSlots** `object[]` _required_
- **enableFuturePosts** `boolean` — Enable Future Posts. Defaults to false.
- **prioritizeNewContent** `boolean` — Prioritize New Content. Defaults to false.
- **userId** `string` _required_ — User id

```json
{
  "locationId": "609e126a1c4ae1001291e1b5",
  "categoryId": "60af88475f1b2c001f5d5f4b",
  "timeSlots": [
    {
      "dayOfWeek": 0,
      "time": "09:00"
    }
  ],
  "enableFuturePosts": true,
  "prioritizeNewContent": false,
  "userId": "w37swmmLbA02zgqKPpxITe"
}
```

### Response (201 · application/json)

Queue created successfully.

**Schema**

- **success** `boolean` _required_
- **statusCode** `number` _required_
- **results** `object` _required_
- **traceId** `string`

```json
{
  "success": true,
  "statusCode": 201,
  "results": {
    "message": "Queue created successfully",
    "queue": {
      "_id": "686ebf10c78c233e45c28d66",
      "locationId": "Qp26qppJgfrTZis7jsBy",
      "categoryId": "683702938b19583ce320e5eb",
      "timeSlots": [
        {
          "_id": "686ebf10c78c23d665c28d67",
          "dayOfWeek": 0,
          "time": "00:00"
        }
      ],
      "enableFuturePosts": true,
      "prioritizeNewContent": true,
      "status": "draft",
      "startDate": "2025-07-09T19:12:16.363Z",
      "skipDateTime": [],
      "totalPosts": 0,
      "lastScheduledTime": null,
      "createdBy": "uefV3MmLHs2sjJr2KfmL",
      "createdAt": "2025-07-09T19:12:16.366Z",
      "updatedAt": "2025-07-09T19:12:16.366Z"
    }
  },
  "traceId": "string"
}
```
