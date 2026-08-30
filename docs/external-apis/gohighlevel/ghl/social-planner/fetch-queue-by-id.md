---
title: "Fetch a category queue by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/fetch-queue-by-id"
seccion: "Social Planner > Category Queue > Fetch a category queue by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/social-media-posting/category/queues/:queueId"
---

# Fetch a category queue by ID

```http
GET /social-media-posting/category/queues/:queueId
```

Retrieves the details of a single category queue by its unique ID. The response includes a count of posts within the queue that have errors.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **queueId** `string` _required_

### Query parameters

- **locationId** `string` _required_ — Location ID

### Response (200 · application/json)

Successfully retrieved the category queue.

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
    "message": "Queue fetched successfully",
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
      "updatedAt": "2023-01-01T00:00:00Z",
      "category": {
        "_id": "6756f381be2553245b08d30c",
        "name": "Category Name",
        "primaryColor": "#FFFFFF",
        "secondaryColor": "#000000",
        "deleted": false,
        "locationId": "fvg1TXIiVxGcdOaL0riG",
        "createdBy": "SQ6d63Va2PUbWEZ9k0TD",
        "createdAt": "2024-12-09T13:41:21.385Z",
        "updatedAt": "2024-12-09T13:41:21.385Z"
      }
    }
  },
  "traceId": "string"
}
```
