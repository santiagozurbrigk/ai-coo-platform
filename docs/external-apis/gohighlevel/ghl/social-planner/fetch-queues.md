---
title: "Fetch category queues for a location"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/fetch-queues"
seccion: "Social Planner > Category Queue > Fetch category queues for a location"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/category/queues/list"
---

# Fetch category queues for a location

```http
POST /social-media-posting/category/queues/list
```

Retrieves a paginated list of all category queues for a given location, excluding any that have been marked as deleted.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **skip** `number` — Number of items to skip
- **limit** `number` — Maximum number of items to return

```json
{
  "locationId": "609e126a1c4ae1001291e1b5",
  "skip": 0,
  "limit": 10
}
```

### Response (201 · application/json)

Successfully retrieved category queues.

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
    "message": "Queues fetched successfully",
    "queues": [
      {
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
    ],
    "meta": {
      "count": "100"
    }
  },
  "traceId": "string"
}
```
