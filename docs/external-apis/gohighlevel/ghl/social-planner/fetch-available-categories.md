---
title: "Get all categories with their queue status"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/fetch-available-categories"
seccion: "Social Planner > Category Queue > Get all categories with their queue status"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/category/queues/available-categories"
---

# Get all categories with their queue status

```http
GET /social-media-posting/category/queues/available-categories
```

Returns categories with status: "available" (no queue), "in_queue" (active/paused queue), or "draft" (queue in draft).

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location ID
- **skip** `string` — Number of items to skip
- **limit** `string` — Maximum number of items to return
- **q** `string` — Search query

### Response (200 · application/json)

Available categories fetched successfully.

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
    "message": "Available categories fetched successfully",
    "categories": [
      {
        "deleted": false,
        "_id": "65cb3d2f68baa617aa0c286e",
        "name": "Facebook Reel",
        "locationId": "fvg1TXIiVxGcdOaL0riG",
        "primaryColor": "#004EEB",
        "secondaryColor": "#EFF4FF",
        "createdBy": "SQ6d63Va2PUbWEZ9k0TD",
        "createdAt": "2024-02-13T09:58:07.129Z",
        "updatedAt": "2024-02-13T09:58:07.129Z",
        "publishedPostsCount": 80,
        "status": "in_queue",
        "queueDetails": {
          "queueId": "67fc07c6d7657c9aee764762",
          "prioritizeNewContent": false,
          "enableFuturePosts": true
        }
      }
    ],
    "meta": {
      "count": "100"
    }
  },
  "traceId": "string"
}
```
