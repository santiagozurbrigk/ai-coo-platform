---
title: "Fetch slot information for queue items"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/fetch-slots"
seccion: "Social Planner > Category Queue > Fetch slot information for queue items"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/category/queues/:queueId/slots"
---

# Fetch slot information for queue items

```http
POST /social-media-posting/category/queues/:queueId/slots
```

Returns paginated slot information (scheduledDateTime, isSkipped) for queue items. Pass sessionId to get slots for draft items, or omit for live items. Call this after mutations to refresh slot data.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **queueId** `string` _required_

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — The location ID
- **sessionId** `string` — Session ID for edit mode. If not provided, calculates slots for live items.
- **skip** `number` — Number of items to skip

  **Default value:**

  `0`

- **limit** `number` — Number of items to return

  **Default value:**

  `20`

```json
{
  "locationId": "abc123",
  "sessionId": "507f1f77bcf86cd799439011",
  "skip": 0,
  "limit": 20
}
```

### Response (201 · application/json)

Slots fetched successfully.

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
    "message": "Slots fetched successfully",
    "slots": [
      {
        "itemId": "60af88475f1b2c001f5d5f4b",
        "scheduledDateTime": "2023-10-15T10:00:00.000Z",
        "isSkipped": false
      }
    ],
    "total": 100,
    "skip": 0,
    "limit": 20,
    "timezone": "America/New_York"
  },
  "traceId": "string"
}
```
